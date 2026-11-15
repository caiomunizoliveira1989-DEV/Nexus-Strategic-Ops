import type { NivelNotificacao, Notificacao } from '@/lib/notifications/store'

/* Campos lidos de forma tolerante: o tipo ZonaAlerta pode variar
   sem quebrar esta camada. */
export type AlertaBruto = {
  id?: string | number
  categoria?: string
  severidade?: string
  municipio?: string
  municipios?: string[]
  local?: string
  hectares?: number
  areaHa?: number
  lat?: number
  lng?: number
  data?: string
  detectadoEm?: string
}

const CHAVE = 'nexus:conformidade:snapshot:v1'

type Snapshot = { dia: string; ids: string[]; novos: string[] }

function hoje(): string {
  return new Date().toISOString().slice(0, 10)
}

function lerSnapshot(): Snapshot | null {
  if (typeof window === 'undefined') return null
  try {
    const bruto = window.localStorage.getItem(CHAVE)
    if (!bruto) return null
    const s = JSON.parse(bruto)
    if (!s || !Array.isArray(s.ids)) return null
    return {
      dia: String(s.dia ?? ''),
      ids: s.ids.map(String),
      novos: Array.isArray(s.novos) ? s.novos.map(String) : [],
    }
  } catch {
    return null
  }
}

function gravar(s: Snapshot) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(CHAVE, JSON.stringify(s))
  } catch {
    /* sem storage: a comparação reinicia no próximo acesso */
  }
}

function chaveDe(a: AlertaBruto, i: number): string {
  if (a.id !== undefined && a.id !== null) return String(a.id)
  const partes = [a.lat, a.lng, a.categoria, a.hectares]
    .filter((v) => v !== undefined && v !== null)
    .join('|')
  return partes || 'alerta-' + i
}

export type ResultadoDiff = {
  total: number
  novos: Set<string>
  primeiroAcesso: boolean
  base: number
}

/* Compara com o último retrato salvo.
   - mesmo dia: reaproveita o resultado já calculado
   - primeiro acesso da história: cria a base e não notifica nada
   - dia novo: notifica só os IDs que não existiam antes */
export function calcularNovos(alertas: readonly unknown[]): ResultadoDiff {
  const lista = alertas as AlertaBruto[]
  const ids = lista.map(chaveDe)
  const conjunto = new Set(ids)
  const anterior = lerSnapshot()

  if (anterior && anterior.dia === hoje()) {
    return {
      total: ids.length,
      novos: new Set(anterior.novos.filter((id) => conjunto.has(id))),
      primeiroAcesso: false,
      base: anterior.ids.length,
    }
  }

  if (!anterior) {
    gravar({ dia: hoje(), ids, novos: [] })
    return { total: ids.length, novos: new Set(), primeiroAcesso: true, base: 0 }
  }

  const anteriores = new Set(anterior.ids)
  const novos = ids.filter((id) => !anteriores.has(id))
  gravar({ dia: hoje(), ids, novos })

  return {
    total: ids.length,
    novos: new Set(novos),
    primeiroAcesso: false,
    base: anterior.ids.length,
  }
}

const ROTULO: Record<string, string> = {
  desmatamento: 'desmatamento',
  queimada: 'queimada',
}

function municipioDe(a: AlertaBruto): string {
  if (a.municipio) return a.municipio
  if (Array.isArray(a.municipios) && a.municipios.length) return a.municipios[0]
  if (a.local) return a.local
  return 'Área monitorada'
}

function hectaresDe(a: AlertaBruto): number {
  if (typeof a.hectares === 'number') return a.hectares
  if (typeof a.areaHa === 'number') return a.areaHa
  return 0
}

function ehGrave(a: AlertaBruto): boolean {
  return String(a.severidade ?? '').toLowerCase().startsWith('grav')
}

function dataDe(a: AlertaBruto): string {
  return a.data ?? a.detectadoEm ?? ''
}

function categoriaDe(a: AlertaBruto): string {
  const c = String(a.categoria ?? '').toLowerCase()
  return ROTULO[c] ?? c ?? 'alerta'
}

type Grupo = {
  municipio: string
  categoria: string
  quantidade: number
  hectares: number
  grave: boolean
  lat?: number
  lng?: number
  data: string
}

/* Um foco por polígono geraria centenas de notificações.
   Agrupamos por município + categoria, que é o que a operação lê. */
export function notificacoesDeConformidade(alertas: readonly unknown[]): Notificacao[] {
  const diff = calcularNovos(alertas)
  if (diff.primeiroAcesso || diff.novos.size === 0) return []

  const lista = alertas as AlertaBruto[]
  const grupos = new Map<string, Grupo>()

  lista.forEach((a, i) => {
    const id = chaveDe(a, i)
    if (!diff.novos.has(id)) return

    const municipio = municipioDe(a)
    const categoria = categoriaDe(a)
    const k = municipio + '|' + categoria
    const atual = grupos.get(k)

    if (atual) {
      atual.quantidade += 1
      atual.hectares += hectaresDe(a)
      atual.grave = atual.grave || ehGrave(a)
      if (atual.lat === undefined && typeof a.lat === 'number') {
        atual.lat = a.lat
        atual.lng = a.lng
      }
      if (!atual.data) atual.data = dataDe(a)
      return
    }

    grupos.set(k, {
      municipio,
      categoria,
      quantidade: 1,
      hectares: hectaresDe(a),
      grave: ehGrave(a),
      lat: typeof a.lat === 'number' ? a.lat : undefined,
      lng: typeof a.lng === 'number' ? a.lng : undefined,
      data: dataDe(a),
    })
  })

  const ordem = (g: Grupo) => (g.grave ? 0 : 1)

  return [...grupos.values()]
    .sort((a, b) => ordem(a) - ordem(b) || b.quantidade - a.quantidade)
    .slice(0, 8)
    .map((g) => {
      const nivel: NivelNotificacao = g.grave ? 'critico' : 'atencao'
      const poligonos = g.quantidade === 1 ? '1 novo polígono' : g.quantidade + ' novos polígonos'
      const area =
        g.hectares > 0
          ? Math.round(g.hectares).toLocaleString('pt-BR') + ' ha'
          : 'área não informada'

      return {
        id: 'conf-' + g.municipio + '-' + g.categoria,
        nivel,
        titulo: poligonos + ' de ' + g.categoria,
        local: g.municipio,
        descricao:
          area +
          ' detectados por satélite e ainda não registrados no retrato anterior do mapa.' +
          (g.grave ? ' Há ocorrência classificada como grave.' : ''),
        meta: 'INPE · DETER/' + (g.categoria === 'queimada' ? 'Queimadas' : 'PRODES'),
        quando: g.data || 'hoje',
        mapa:
          g.lat !== undefined && g.lng !== undefined
            ? { lat: g.lat, lng: g.lng, zoom: 7 }
            : undefined,
      }
    })
}
