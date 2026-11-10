#!/usr/bin/env node
/**
 * Sincroniza imoveis rurais do SICAR (WFS) para lib/data/farms.generated.ts
 *
 * Por municipio (preferido):
 *   FARMS_SOURCE_URL="https://geoserver.car.gov.br/geoserver/sicar/ows" \
 *   FARMS_TYPE_NAME="sicar:sicar_imoveis_mg" \
 *   FARMS_MUNICIPIO_IBGE=3133709 \
 *   node scripts/sync-farms.mjs
 *
 * Por bbox (fallback):
 *   FARMS_BBOX="-44.65,-20.45,-44.00,-19.95" node scripts/sync-farms.mjs
 */

import fs from 'node:fs'
import path from 'node:path'

const OUT = 'lib/data/farms.generated.ts'
const BASE = process.env.FARMS_SOURCE_URL
const LABEL = process.env.FARMS_SOURCE_LABEL ?? 'SICAR/CAR'
const TYPE_NAME = process.env.FARMS_TYPE_NAME
const MUNICIPIO_IBGE = process.env.FARMS_MUNICIPIO_IBGE
const BBOX = process.env.FARMS_BBOX
const BBOX_SRS = process.env.FARMS_BBOX_SRS ?? 'EPSG:4326'
const PAGE = Number(process.env.FARMS_PAGE_SIZE ?? 200)
const MAX = Number(process.env.FARMS_MAX ?? 3000)

if (!BASE) { console.error('FARMS_SOURCE_URL nao definida'); process.exit(2) }
if (!TYPE_NAME) { console.error('FARMS_TYPE_NAME nao definida. Ex: sicar:sicar_imoveis_mg'); process.exit(3) }
if (!MUNICIPIO_IBGE && !BBOX) {
  console.error('defina FARMS_MUNICIPIO_IBGE (preferido) ou FARMS_BBOX.')
  console.error('descubra o codigo com: FARMS_MUNICIPIO="Itatiaiuçu" FARMS_UF=mg node scripts/resolve-municipio.mjs')
  process.exit(4)
}

const USE_MUNICIPIO = Boolean(MUNICIPIO_IBGE)
const FILTER = USE_MUNICIPIO
  ? 'cod_municipio_ibge=' + Number(MUNICIPIO_IBGE)
  : null

const FIELD_MAP = {
  id: ['cod_imovel'],
  city: ['municipio', 'nom_municipio'],
  state: ['uf', 'sg_uf'],
  areaHa: ['area', 'area_ha'],
  status: ['status_imovel', 'status'],
  owner: ['nom_proprietario', 'nome_proprietario'],
}

function pick(props, keys) {
  for (const key of keys) {
    for (const real of Object.keys(props)) {
      if (real.toLowerCase() === key.toLowerCase()) {
        const v = props[real]
        if (v !== null && v !== undefined && v !== '') return v
      }
    }
  }
  return undefined
}

function toNumber(v) {
  if (typeof v === 'number') return v
  if (typeof v === 'string') {
    const n = Number(v.replace(/\./g, '').replace(',', '.'))
    return Number.isFinite(n) ? n : 0
  }
  return 0
}

function mapStatus(v) {
  const code = String(v ?? '').toUpperCase().trim()
  if (code === 'AT' || code === 'RE') return 'monitored'
  if (code === 'SU') return 'alert'
  if (code === 'PE' || code === 'CA') return 'pending'
  return 'monitored'
}

function simplifyRing(ring, precision = 5) {
  const out = []
  let prev = ''
  for (const p of ring) {
    const lon = Math.round((p[0] ?? 0) * 10 ** precision) / 10 ** precision
    const lat = Math.round((p[1] ?? 0) * 10 ** precision) / 10 ** precision
    const key = lon + ',' + lat
    if (key === prev) continue
    prev = key
    out.push([lon, lat])
  }
  return out.length >= 4 ? out : ring
}

function toGeometry(value) {
  if (!value || typeof value !== 'object') return { type: 'Polygon', coordinates: [] }

  if (value.type === 'Polygon' && Array.isArray(value.coordinates)) {
    return { type: 'Polygon', coordinates: value.coordinates.map((r) => simplifyRing(r)) }
  }

  if (value.type === 'MultiPolygon' && Array.isArray(value.coordinates)) {
    let best = value.coordinates[0] ?? []
    let size = 0
    for (const poly of value.coordinates) {
      const ring = poly[0] ?? []
      if (ring.length > size) { size = ring.length; best = poly }
    }
    return { type: 'Polygon', coordinates: best.map((r) => simplifyRing(r)) }
  }

  return { type: 'Polygon', coordinates: [] }
}

function buildUrl(offset, extra) {
  const params = new URLSearchParams({
    service: 'WFS',
    version: '2.0.0',
    request: 'GetFeature',
    typeNames: TYPE_NAME,
    outputFormat: 'application/json',
    srsName: 'EPSG:4326',
    sortBy: 'cod_imovel A',
  })

  if (FILTER) params.set('cql_filter', FILTER)
  if (BBOX) params.set('bbox', BBOX + ',' + BBOX_SRS)
  if (!extra) {
    params.set('count', String(PAGE))
    params.set('startIndex', String(offset))
  }

  for (const [k, v] of Object.entries(extra ?? {})) params.set(k, v)

  return BASE + (BASE.includes('?') ? '&' : '?') + params.toString()
}

async function request(offset, extra) {
  const url = buildUrl(offset, extra)
  const res = await fetch(url, { headers: { accept: 'application/json' }, signal: AbortSignal.timeout(60000) })
  const text = await res.text()

  let body
  try {
    body = JSON.parse(text)
  } catch {
    console.error('  resposta NAO e JSON (HTTP ' + res.status + ')')
    console.error('  url: ' + url)
    console.error('  trecho: ' + text.slice(0, 300).replace(/\s+/g, ' '))
    throw new Error('a fonte devolveu XML/HTML em vez de JSON')
  }

  if (body.exceptions) {
    console.error('  ServiceException: ' + JSON.stringify(body.exceptions).slice(0, 300))
    throw new Error('a fonte recusou a consulta')
  }

  return body
}

// contagem previa: confirma o filtro antes de baixar geometria
try {
  const hits = await request(0, { resultType: 'hits' })
  const matched = hits.totalFeatures ?? hits.numberMatched
  if (typeof matched === 'number') {
    console.log('total na fonte: ' + matched + (FILTER ? '  (filtro: ' + FILTER + ')' : '  (bbox)'))
    if (matched === 0) {
      console.error('filtro nao retornou nada. confira FARMS_MUNICIPIO_IBGE e FARMS_TYPE_NAME')
      process.exit(6)
    }
  }
} catch (err) {
  console.error('contagem previa falhou: ' + err.message)
  process.exit(7)
}

const raw = []

for (let offset = 0; offset < MAX; offset += PAGE) {
  process.stdout.write('  offset=' + offset + ' ... ')

  let page
  try {
    page = (await request(offset)).features ?? []
  } catch (err) {
    console.log('falhou')
    console.error('  ' + err.message)
    break
  }

  console.log(page.length + ' feicao(oes)')
  if (!page.length) break
  raw.push(...page)
  if (page.length < PAGE) break
}

if (!raw.length) {
  console.error('nenhuma feicao retornada')
  process.exit(8)
}

const seen = new Set()
const features = []
let skipped = 0

for (const entry of raw) {
  if (!entry || !entry.geometry) { skipped++; continue }

  const geometry = toGeometry(entry.geometry)
  if (!geometry.coordinates.length) { skipped++; continue }

  const props = entry.properties ?? {}
  const id = String(pick(props, FIELD_MAP.id) ?? '').trim()
  const city = String(pick(props, FIELD_MAP.city) ?? '').trim()
  const state = String(pick(props, FIELD_MAP.state) ?? '').trim().toUpperCase()

  if (!id || !city || state.length !== 2 || seen.has(id)) { skipped++; continue }

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
      source: LABEL,
    },
  })
}

if (!features.length) {
  console.error('nenhuma feicao valida apos o mapeamento (' + skipped + ' descartadas)')
  process.exit(9)
}

const meta = {
  source: LABEL,
  sourceUrl: BASE,
  layer: TYPE_NAME,
  filter: FILTER ?? ('bbox ' + BBOX),
  syncedAt: new Date().toISOString(),
  count: features.length,
}

const header = [
  '// ARQUIVO GERADO POR scripts/sync-farms.mjs - NAO EDITAR A MAO',
  '// fonte: ' + LABEL,
  '// camada: ' + TYPE_NAME,
  '// filtro: ' + meta.filter,
  '// sincronizado em: ' + meta.syncedAt,
  '',
  'export type SyncedFarm = {',
  "  type: 'Feature'",
  '  geometry: { type: string; coordinates: unknown }',
  '  properties: {',
  '    id: string',
  '    name: string',
  '    city: string',
  '    state: string',
  '    areaHa: number',
  "    status: 'monitored' | 'alert' | 'pending'",
  '    owner: string',
  '    car: string',
  '    source: string',
  '  }',
  '}',
  '',
  'export const SYNCED_META = ' + JSON.stringify(meta, null, 2) + ' as const',
  '',
  'export const SYNCED_FARMS: SyncedFarm[] = ',
].join('\n')

fs.mkdirSync(path.dirname(OUT), { recursive: true })
fs.writeFileSync(OUT, header + JSON.stringify(features) + '\n', 'utf8')

console.log('')
console.log('OK: ' + features.length + ' imovel(is) de ' + LABEL)
console.log('filtro: ' + meta.filter)
console.log('descartados: ' + skipped)
console.log('gravado: ' + OUT)
