import { NextResponse } from 'next/server'
import type { ZonaAlerta, CategoriaAlerta } from '@/lib/data/alertas'

export const revalidate = 3600

const GEO = 'https://terrabrasilis.dpi.inpe.br/geoserver/ows'
const QUEIMADAS = 'https://terrabrasilis.dpi.inpe.br/queimadas/geoserver/ows'

type Fonte = {
  nome: string
  base: string
  camada: string
  categoria: CategoriaAlerta
  limite: number
}

const FONTES: Fonte[] = [
  {
    nome: 'DETER Amazônia / INPE',
    base: GEO,
    camada: 'deter-amz:deter_amz',
    categoria: 'desmatamento',
    limite: 400,
  },
  {
    nome: 'DETER Cerrado / INPE',
    base: GEO,
    camada: 'deter-cerrado-nb:deter_cerrado',
    categoria: 'desmatamento',
    limite: 400,
  },
  {
    nome: 'Queimadas / INPE',
    base: QUEIMADAS,
    camada: 'dados_abertos:focos_mesatual_br_todosats',
    categoria: 'queimada',
    limite: 400,
  },
]

function urlWfs(f: Fonte, comOrdenacao: boolean): string {
  const p = new URLSearchParams({
    service: 'WFS',
    version: '2.0.0',
    request: 'GetFeature',
    typeName: f.camada,
    outputFormat: 'application/json',
    srsName: 'EPSG:4326',
    count: String(f.limite),
  })
  if (comOrdenacao) p.set('sortBy', 'areatotalkm D')
  return f.base + '?' + p.toString()
}

async function buscar(f: Fonte): Promise<any> {
  for (const ordenar of [true, false]) {
    try {
      const r = await fetch(urlWfs(f, ordenar), {
        signal: AbortSignal.timeout(20000),
        headers: { Accept: 'application/json' },
        next: { revalidate: 3600 },
      })
      if (!r.ok) continue
      const json = await r.json()
      if (json?.features?.length) return json
    } catch {
      /* tenta a próxima variação */
    }
  }
  return null
}

function anelDe(g: any): [number, number][] | null {
  if (!g) return null
  try {
    if (g.type === 'Polygon') {
      return g.coordinates[0].map((c: number[]) => [c[1], c[0]] as [number, number])
    }
    if (g.type === 'MultiPolygon') {
      return g.coordinates[0][0].map((c: number[]) => [c[1], c[0]] as [number, number])
    }
  } catch {
    return null
  }
  return null
}

function centroDoAnel(anel: [number, number][]): [number, number] {
  let lat = 0
  let lng = 0
  for (const [a, b] of anel) {
    lat += a
    lng += b
  }
  return [lat / anel.length, lng / anel.length]
}

function numero(v: any): number {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

function dataTexto(p: any): string {
  const bruto =
    p.detectiondate ?? p.data_hora_gmt ?? p.data ?? p.view_date ?? p.date ?? ''
  if (!bruto) return '—'
  const d = new Date(bruto)
  if (Number.isNaN(d.getTime())) return String(bruto)
  return d.toLocaleDateString('pt-BR')
}

function normalizar(f: Fonte, json: any): ZonaAlerta[] {
  const saida: ZonaAlerta[] = []

  for (const feat of json.features ?? []) {
    const p = feat.properties ?? {}
    const anel = anelDe(feat.geometry)

    if (!anel || anel.length < 3) {
      // focos de queimada vêm como ponto
      if (feat.geometry?.type === 'Point') {
        const [lng, lat] = feat.geometry.coordinates
        const ponto: [number, number] = [lat, lng]
        const risco = numero(p.risco_fogo)
        saida.push({
          id: f.camada + '-' + (feat.id ?? saida.length),
          categoria: f.categoria,
          severidade: risco >= 0.8 ? 'grave' : 'moderada',
          hectares: 0,
          data: dataTexto(p),
          fonte: f.nome,
          local: [p.municipio, p.estado].filter(Boolean).join(' · ') || 'Brasil',
          centro: ponto,
          anel: null,
        })
      }
      continue
    }

    const km2 = numero(p.areatotalkm ?? p.areamunkm ?? p.area_km ?? p.areakm)
    const hectares = km2 > 0 ? Math.round(km2 * 100) : 0
    const centro = centroDoAnel(anel)

    saida.push({
      id: f.camada + '-' + (feat.id ?? saida.length),
      categoria: f.categoria,
      severidade: hectares >= 50 ? 'grave' : 'moderada',
      hectares,
      data: dataTexto(p),
      fonte: f.nome,
      local: [p.municipio, p.uf].filter(Boolean).join(' · ') || 'Brasil',
      centro,
      anel,
    })
  }

  return saida
}

export async function GET() {
  const resultados = await Promise.all(FONTES.map((f) => buscar(f)))

  let alertas: ZonaAlerta[] = []
  const falhas: string[] = []

  resultados.forEach((json, i) => {
    const f = FONTES[i]
    if (!json) {
      falhas.push(f.nome)
      return
    }
    alertas = alertas.concat(normalizar(f, json))
  })

  const graves = alertas.filter((a) => a.severidade === 'grave').length
  const hectares = alertas.reduce((s, a) => s + a.hectares, 0)

  return NextResponse.json({
    atualizadoEm: new Date().toISOString(),
    fontes: FONTES.map((f) => f.nome),
    falhas,
    alertas,
    resumo: {
      total: alertas.length,
      graves,
      moderadas: alertas.length - graves,
      hectares,
    },
  })
}
