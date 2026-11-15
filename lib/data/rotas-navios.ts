/* Liga o painel ETA às zonas de alerta do mapa.
   O status de cada navio não é fixo: é derivado de quais
   zonas o traçado da rota cruza. */

import type { AlertaLogistica, CategoriaAlerta } from '@/lib/data/alertas-logistica'

export type StatusRota =
  | 'em_rota'
  | 'zona_conflito'
  | 'congestionamento'
  | 'alerta_climatico'
  | 'rota_desviada'

export const STATUS_ROTA_LABEL: Record<StatusRota, string> = {
  em_rota: 'Em Rota',
  zona_conflito: 'Zona de Conflito',
  congestionamento: 'Congestionamento',
  alerta_climatico: 'Alerta Climático',
  rota_desviada: 'Rota Desviada',
}

export const STATUS_ROTA_CLASS: Record<StatusRota, string> = {
  em_rota: 'text-neon-cyan',
  zona_conflito: 'text-neon-red',
  congestionamento: 'text-neon-amber',
  alerta_climatico: 'text-neon-blue',
  rota_desviada: 'text-neon-amber',
}

export const COR_STATUS: Record<StatusRota, string> = {
  em_rota: '#22d3ee',
  zona_conflito: '#ef4444',
  congestionamento: '#f97316',
  alerta_climatico: '#3b82f6',
  rota_desviada: '#f59e0b',
}

/* Atraso estimado, em dias, que cada zona impõe a uma rota que a cruza */
export const ATRASO_POR_ALERTA: Record<string, number> = {
  hormuz: 12,
  mandeb: 9,
  suez: 2,
  panama: 4,
  'congestao-global': 5,
  conacri: 10,
  ningbo: 2,
  tema: 7,
  abidjan: 2,
  'pacifico-tufoes': 4,
  'boa-esperanca': 12,
  'norte-europa': 3,
}

const PRIORIDADE: CategoriaAlerta[] = ['conflito', 'congestao', 'clima', 'rota']

const CATEGORIA_PARA_STATUS: Record<CategoriaAlerta, StatusRota> = {
  conflito: 'zona_conflito',
  congestao: 'congestionamento',
  clima: 'alerta_climatico',
  rota: 'rota_desviada',
}

type Rota = {
  origem: string
  destino: string
  tracado: [number, number][]
}

export const ROTAS_POR_CODIGO: Record<string, Rota> = {
  'HKG-ROT': {
    origem: 'Hong Kong',
    destino: 'Roterdã',
    tracado: [
      [22.3, 114.17],
      [10.0, 112.0],
      [1.29, 103.85],
      [6.0, 95.0],
      [12.58, 43.33],
      [20.0, 38.0],
      [30.01, 32.58],
      [33.5, 28.0],
      [37.94, 23.63],
      [36.0, -5.6],
      [51.95, 4.14],
    ],
  },
  'LA-SGP': {
    origem: 'Los Angeles',
    destino: 'Singapura',
    tracado: [
      [33.74, -118.27],
      [25.0, -140.0],
      [20.0, 137.0],
      [12.0, 118.0],
      [1.29, 103.85],
    ],
  },
  'HK-SGP': {
    origem: 'Hong Kong',
    destino: 'Singapura',
    tracado: [
      [22.3, 114.17],
      [18.0, 112.0],
      [10.0, 108.0],
      [1.29, 103.85],
    ],
  },
}

const RAIO_TERRA_KM = 6371

function graus(rad: number): number {
  return (rad * Math.PI) / 180
}

function emKm(p: [number, number], latRef: number): [number, number] {
  return [graus(p[1]) * Math.cos(graus(latRef)) * RAIO_TERRA_KM, graus(p[0]) * RAIO_TERRA_KM]
}

/* Menor distância entre um ponto e um segmento de reta, em km */
function distanciaSegmentoKm(
  ponto: [number, number],
  a: [number, number],
  b: [number, number],
): number {
  const latRef = (a[0] + b[0]) / 2
  const [px, py] = emKm(ponto, latRef)
  const [ax, ay] = emKm(a, latRef)
  const [bx, by] = emKm(b, latRef)

  const dx = bx - ax
  const dy = by - ay
  const comprimento2 = dx * dx + dy * dy

  let t = comprimento2 === 0 ? 0 : ((px - ax) * dx + (py - ay) * dy) / comprimento2
  t = Math.max(0, Math.min(1, t))

  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy))
}

function distanciaPontoKm(ponto: [number, number], alvo: [number, number]): number {
  return distanciaSegmentoKm(ponto, alvo, alvo)
}

export function avaliarRota(
  tracado: [number, number][],
  alertas: AlertaLogistica[],
): { status: StatusRota; atingidos: AlertaLogistica[]; atrasoDias: number } {
  if (tracado.length < 2) {
    return { status: 'em_rota', atingidos: [], atrasoDias: 0 }
  }

  const atingidos = alertas.filter((alerta) => {
    const centro: [number, number] = [alerta.lat, alerta.lng]

    for (let i = 1; i < tracado.length; i += 1) {
      const d = distanciaSegmentoKm(centro, tracado[i - 1], tracado[i])
      if (d <= alerta.raioKm) return true
    }

    return (
      distanciaPontoKm(centro, tracado[0]) <= alerta.raioKm ||
      distanciaPontoKm(centro, tracado[tracado.length - 1]) <= alerta.raioKm
    )
  })

  if (!atingidos.length) {
    return { status: 'em_rota', atingidos: [], atrasoDias: 0 }
  }

  const categoriaDominante = PRIORIDADE.find((c) =>
    atingidos.some((a) => a.categoria === c),
  )

  const atrasoDias = atingidos.reduce(
    (soma, a) => soma + (ATRASO_POR_ALERTA[a.id] ?? 2),
    0,
  )

  return {
    status: categoriaDominante ? CATEGORIA_PARA_STATUS[categoriaDominante] : 'em_rota',
    atingidos,
    atrasoDias,
  }
}

export function codigoDaRota(nome: string): string | null {
  const achado = nome.match(/([A-Z]{2,3})\s*[-–]\s*([A-Z]{3})/i)
  if (!achado) return null
  return `${achado[1].toUpperCase()}-${achado[2].toUpperCase()}`
}

function etaParaHoras(eta: string): number {
  const dias = eta.match(/(\d+)\s*d/i)
  const horas = eta.match(/(\d+)\s*h/i)
  return (dias ? Number(dias[1]) * 24 : 0) + (horas ? Number(horas[1]) : 0)
}

function horasParaEta(total: number): string {
  const dias = Math.floor(total / 24)
  const horas = Math.round(total % 24)
  return `${dias}d ${horas}h`
}

function centroDoTracado(tracado: [number, number][]): [number, number] {
  if (!tracado.length) return [18, 62]
  const meio = tracado[Math.floor(tracado.length / 2)]
  return [meio[0], meio[1]]
}

export type NavioAvaliado = {
  id: string
  nome: string
  codigo: string | null
  origem: string
  destino: string
  etaBase: string
  etaAjustado: string
  atrasoDias: number
  status: StatusRota
  alertas: AlertaLogistica[]
  tracado: [number, number][]
  centro: [number, number]
}

export function montarNavios(
  navios: { id: string; name: string; eta: string }[],
  alertas: AlertaLogistica[],
): NavioAvaliado[] {
  return navios.map((navio) => {
    const codigo = codigoDaRota(navio.name)
    const rota = codigo ? ROTAS_POR_CODIGO[codigo] : undefined
    const tracado = rota?.tracado ?? []
    const avaliacao = avaliarRota(tracado, alertas)

    const baseHoras = etaParaHoras(navio.eta)

    return {
      id: navio.id,
      nome: navio.name,
      codigo,
      origem: rota?.origem ?? '—',
      destino: rota?.destino ?? '—',
      etaBase: navio.eta,
      etaAjustado:
        baseHoras > 0
          ? horasParaEta(baseHoras + avaliacao.atrasoDias * 24)
          : navio.eta,
      atrasoDias: avaliacao.atrasoDias,
      status: avaliacao.status,
      alertas: avaliacao.atingidos,
      tracado,
      centro: centroDoTracado(tracado),
    }
  })
}
