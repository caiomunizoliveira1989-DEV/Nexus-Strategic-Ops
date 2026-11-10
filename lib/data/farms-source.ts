import type { FarmFeature, FarmStatus } from './farms'

export type FarmSourceConfig = {
  url: string
  label: string
  typeName?: string
  municipioIbge?: string
  bbox?: string
  pageSize: number
  max: number
}

export type FarmFetchResult = {
  features: FarmFeature[]
  source: string
  sourceUrl: string
  syncedAt: string
  received: number
  skipped: number
  filter: string
}

const FIELD_MAP: Record<string, string[]> = {
  id: ['cod_imovel'],
  city: ['municipio', 'nom_municipio'],
  state: ['uf', 'sg_uf'],
  areaHa: ['area', 'area_ha', 'num_area'],
  status: ['status_imovel', 'status', 'situacao'],
  owner: ['nom_proprietario', 'nome_proprietario'],
}

function pick(props: Record<string, unknown>, keys: string[]): unknown {
  for (const key of keys) {
    for (const real of Object.keys(props)) {
      if (real.toLowerCase() === key.toLowerCase()) {
        const value = props[real]
        if (value !== null && value !== undefined && value !== '') return value
      }
    }
  }
  return undefined
}

function toNumber(value: unknown): number {
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/\./g, '').replace(',', '.'))
    return Number.isFinite(parsed) ? parsed : 0
  }
  return 0
}

function mapStatus(value: unknown): FarmStatus {
  const code = String(value ?? '').toUpperCase().trim()
  if (code === 'AT' || code === 'RE') return 'monitored'
  if (code === 'SU') return 'alert'
  if (code === 'PE' || code === 'CA') return 'pending'

  const text = code.toLowerCase()
  if (/cancel|indeferid|reprov|inativo/.test(text)) return 'pending'
  if (/pendente|analise|aguard/.test(text)) return 'pending'
  if (/alerta|sobrepost|embargo|suspens/.test(text)) return 'alert'
  return 'monitored'
}

function simplifyRing(ring: number[][], precision = 5): number[][] {
  const out: number[][] = []
  let prev = ''

  for (const point of ring) {
    const lon = Math.round((point[0] ?? 0) * 10 ** precision) / 10 ** precision
    const lat = Math.round((point[1] ?? 0) * 10 ** precision) / 10 ** precision
    const key = lon + ',' + lat
    if (key === prev) continue
    prev = key
    out.push([lon, lat])
  }

  return out.length >= 4 ? out : ring
}

export function toGeometry(value: unknown): FarmFeature['geometry'] {
  const raw = value as { type?: string; coordinates?: unknown } | null

  if (raw && raw.type === 'Polygon' && Array.isArray(raw.coordinates)) {
    return { type: 'Polygon', coordinates: (raw.coordinates as number[][][]).map((r) => simplifyRing(r)) }
  }

  if (raw && raw.type === 'MultiPolygon' && Array.isArray(raw.coordinates)) {
    const polys = raw.coordinates as number[][][][]
    let best: number[][][] = polys[0] ?? []
    let size = 0

    for (const poly of polys) {
      const ring = poly[0] ?? []
      if (ring.length > size) {
        size = ring.length
        best = poly
      }
    }

    return { type: 'Polygon', coordinates: best.map((r) => simplifyRing(r)) }
  }

  return { type: 'Polygon', coordinates: [] }
}

export function readConfig(): FarmSourceConfig | null {
  const url = process.env.FARMS_SOURCE_URL
  if (!url) return null

  return {
    url,
    label: process.env.FARMS_SOURCE_LABEL ?? 'SICAR/CAR',
    typeName: process.env.FARMS_TYPE_NAME,
    municipioIbge: process.env.FARMS_MUNICIPIO_IBGE,
    bbox: process.env.FARMS_BBOX,
    pageSize: Number(process.env.FARMS_PAGE_SIZE ?? 200),
    max: Number(process.env.FARMS_MAX ?? 3000),
  }
}

export function buildFilter(config: FarmSourceConfig): string {
  if (config.municipioIbge) return 'cod_municipio_ibge=' + Number(config.municipioIbge)
  if (config.bbox) return 'bbox ' + config.bbox
  return 'sem filtro'
}

function buildUrl(config: FarmSourceConfig, offset: number): string {
  if (!config.typeName) {
    throw new Error('FARMS_TYPE_NAME obrigatorio. Ex: sicar:sicar_imoveis_mg')
  }

  if (!config.municipioIbge && !config.bbox) {
    throw new Error('defina FARMS_MUNICIPIO_IBGE (preferido) ou FARMS_BBOX')
  }

  const params = new URLSearchParams({
    service: 'WFS',
    version: '2.0.0',
    request: 'GetFeature',
    typeNames: config.typeName,
    outputFormat: 'application/json',
    srsName: 'EPSG:4326',
    count: String(config.pageSize),
    startIndex: String(offset),
    sortBy: 'cod_imovel A',
  })

  if (config.municipioIbge) params.set('cql_filter', 'cod_municipio_ibge=' + Number(config.municipioIbge))
  if (config.bbox) params.set('bbox', config.bbox + ',EPSG:4326')

  const sep = config.url.includes('?') ? '&' : '?'
  return config.url + sep + params.toString()
}

async function fetchPage(config: FarmSourceConfig, offset: number): Promise<unknown[]> {
  const response = await fetch(buildUrl(config, offset), {
    headers: { accept: 'application/json' },
    signal: AbortSignal.timeout(60000),
  })

  if (!response.ok) throw new Error('HTTP ' + response.status + ' na fonte')

  const text = await response.text()
  let body: { features?: unknown[] }

  try {
    body = JSON.parse(text)
  } catch {
    throw new Error('a fonte devolveu XML/HTML em vez de JSON')
  }

  return Array.isArray(body.features) ? body.features : []
}

export async function fetchFarmsFromSource(config: FarmSourceConfig): Promise<FarmFetchResult> {
  const raw: unknown[] = []

  for (let offset = 0; offset < config.max; offset += config.pageSize) {
    const page = await fetchPage(config, offset)
    if (!page.length) break
    raw.push(...page)
    if (page.length < config.pageSize) break
  }

  const seen = new Set<string>()
  const features: FarmFeature[] = []
  let skipped = 0

  for (const item of raw) {
    const entry = item as { geometry?: unknown; properties?: Record<string, unknown> }
    if (!entry || !entry.geometry) {
      skipped++
      continue
    }

    const geometry = toGeometry(entry.geometry)
    if (!geometry.coordinates.length) {
      skipped++
      continue
    }

    const props = entry.properties ?? {}
    const id = String(pick(props, FIELD_MAP.id) ?? '').trim()
    const city = String(pick(props, FIELD_MAP.city) ?? '').trim()
    const state = String(pick(props, FIELD_MAP.state) ?? '').trim().toUpperCase()

    if (!id || !city || state.length !== 2 || seen.has(id)) {
      skipped++
      continue
    }

    seen.add(id)

    const tail = id.split('-').pop() ?? id
    const owner = String(pick(props, FIELD_MAP.owner) ?? '').trim() || 'Não informado'

    features.push({
      type: 'Feature',
      geometry,
      properties: {
        id,
        name: 'Imóvel ' + tail.slice(0, 6).toUpperCase(),
        city,
        state,
        areaHa: Math.round(toNumber(pick(props, FIELD_MAP.areaHa))),
        status: mapStatus(pick(props, FIELD_MAP.status)),
        owner,
        car: id,
        source: config.label,
      },
    })
  }

  return {
    features,
    source: config.label,
    sourceUrl: config.url,
    syncedAt: new Date().toISOString(),
    received: raw.length,
    skipped,
    filter: buildFilter(config),
  }
}
