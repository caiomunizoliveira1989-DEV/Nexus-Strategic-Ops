import type { NivelNotificacao, Notificacao } from '@/lib/notifications/store'
import type { EscopoVista, SinalPainel } from '@/lib/notifications/registro'

const CHAVE = 'nexus:painel:snapshot:v1'
const RELATIVO = 0.005

type Registro = { v: string; n?: number }
type Snapshot = { dia: string; sinais: Record<string, Registro> }

export const ROTULO_ESCOPO_VISTA: Record<EscopoVista, string> = {
  agricultura: 'Agricultura',
  estrategia: 'Estratégia',
  conformidade: 'Conformidade',
  logistica: 'Logística',
}

function hoje(): string {
  return new Date().toISOString().slice(0, 10)
}

function ler(): Snapshot | null {
  if (typeof window === 'undefined') return null
  try {
    const bruto = window.localStorage.getItem(CHAVE)
    if (!bruto) return null
    const s = JSON.parse(bruto)
    if (!s || typeof s.sinais !== 'object') return null
    return { dia: String(s.dia ?? ''), sinais: s.sinais }
  } catch {
    return null
  }
}

function montarMapa(sinais: SinalPainel[]): Record<string, Registro> {
  const mapa: Record<string, Registro> = {}
  for (const s of sinais) {
    mapa[s.id] =
      typeof s.numero === 'number' ? { v: s.valor, n: s.numero } : { v: s.valor }
  }
  return mapa
}

export function gravarSnapshotPainel(sinais: SinalPainel[]) {
  if (typeof window === 'undefined' || !sinais.length) return
  try {
    window.localStorage.setItem(
      CHAVE,
      JSON.stringify({ dia: hoje(), sinais: montarMapa(sinais) } satisfies Snapshot),
    )
  } catch {
    /* sem storage */
  }
}

function variou(ant: Registro, atual: SinalPainel): boolean {
  if (ant.v === atual.valor) return false
  if (typeof ant.n === 'number' && typeof atual.numero === 'number') {
    const delta = Math.abs(atual.numero - ant.n)
    const base = Math.abs(ant.n)
    return base === 0 ? delta > 0 : delta / base >= RELATIVO
  }
  return true
}

const ORDEM: Record<NivelNotificacao, number> = { critico: 0, atencao: 1, info: 2 }

export function notificacoesDePainel(sinais: SinalPainel[]): Notificacao[] {
  if (!sinais.length) return []

  const mapa = montarMapa(sinais)
  const anterior = ler()

  /* mesmo dia: não recalcula */
  if (anterior && anterior.dia === hoje()) return []

  /* primeiro acesso: cria a linha de base sem notificar */
  if (!anterior) {
    try {
      window.localStorage.setItem(
        CHAVE,
        JSON.stringify({ dia: hoje(), sinais: mapa } satisfies Snapshot),
      )
    } catch {
      /* sem storage */
    }
    return []
  }

  const novos: { sinal: SinalPainel; ant: Registro | null }[] = []

  for (const s of sinais) {
    const ant = anterior.sinais[s.id] ?? null
    if (!ant) {
      novos.push({ sinal: s, ant: null })
      continue
    }
    if (variou(ant, s)) novos.push({ sinal: s, ant })
  }

  /* consolida o retrato do dia, para a próxima comparação */
  try {
    window.localStorage.setItem(
      CHAVE,
      JSON.stringify({ dia: hoje(), sinais: mapa } satisfies Snapshot),
    )
  } catch {
    /* sem storage */
  }

  return novos
    .sort((a, b) => ORDEM[a.sinal.nivel] - ORDEM[b.sinal.nivel])
    .slice(0, 12)
    .map(({ sinal, ant }) => ({
      id: 'painel-' + sinal.id + '-' + (ant?.v ?? 'novo'),
      nivel: sinal.nivel,
      titulo: sinal.rotulo,
      local: sinal.valor,
      descricao: ant
        ? 'Atualizado na vista ' +
          ROTULO_ESCOPO_VISTA[sinal.escopo] +
          '. Antes: ' +
          ant.v +
          '.'
        : 'Informação nova na vista ' +
          ROTULO_ESCOPO_VISTA[sinal.escopo] +
          ', não registrada no retrato anterior.',
      meta: ROTULO_ESCOPO_VISTA[sinal.escopo],
      quando: 'hoje',
    }))
}
