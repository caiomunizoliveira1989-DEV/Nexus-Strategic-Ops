import type { NivelNotificacao, Notificacao } from '@/lib/notifications/store'

export type GrupoSinal = 'indicador' | 'commodity' | 'fornecedor' | 'insight'

export type Sinal = {
  id: string
  grupo: GrupoSinal
  rotulo: string
  valor: string
  numero?: number
  nivel: NivelNotificacao
  detalhe?: string
  meta?: string
}

type RegistroSinal = { v: string; n?: number }
type Snapshot = { dia: string; sinais: Record<string, RegistroSinal> }

const CHAVE = 'nexus:estrategia:snapshot:v1'
const LIMIAR_RELATIVO = 0.005

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

function gravar(s: Snapshot) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(CHAVE, JSON.stringify(s))
  } catch {
    /* sem storage */
  }
}

function variou(ant: RegistroSinal, atual: Sinal): boolean {
  if (ant.v === atual.valor) return false
  if (typeof ant.n === 'number' && typeof atual.numero === 'number') {
    const base = Math.abs(ant.n)
    const delta = Math.abs(atual.numero - ant.n)
    return base === 0 ? delta > 0 : delta / base >= LIMIAR_RELATIVO
  }
  return true
}

const ORDEM: Record<NivelNotificacao, number> = { critico: 0, atencao: 1, info: 2 }

export function notificacoesDeEstrategia(sinais: Sinal[]): Notificacao[] {
  const mapa: Record<string, RegistroSinal> = {}
  for (const s of sinais) {
    mapa[s.id] = typeof s.numero === 'number' ? { v: s.valor, n: s.numero } : { v: s.valor }
  }

  const anterior = ler()

  /* mesmo dia: nao recalcula */
  if (anterior && anterior.dia === hoje()) return []

  /* primeiro acesso da historia: cria a base sem notificar */
  if (!anterior) {
    gravar({ dia: hoje(), sinais: mapa })
    return []
  }

  const novos: { sinal: Sinal; ant: RegistroSinal | null }[] = []

  for (const s of sinais) {
    const ant = anterior.sinais[s.id] ?? null
    if (!ant) {
      novos.push({ sinal: s, ant: null })
      continue
    }
    if (s.grupo === 'insight') continue
    if (variou(ant, s)) novos.push({ sinal: s, ant })
  }

  gravar({ dia: hoje(), sinais: mapa })

  return novos
    .sort((a, b) => ORDEM[a.sinal.nivel] - ORDEM[b.sinal.nivel])
    .slice(0, 10)
    .map(({ sinal, ant }) => ({
      id: 'est-' + sinal.id + '-' + (ant?.v ?? 'novo'),
      nivel: sinal.nivel,
      titulo: sinal.rotulo,
      local: sinal.valor,
      descricao: ant
        ? (sinal.detalhe ? sinal.detalhe + ' ' : '') + 'Antes: ' + ant.v + '.'
        : sinal.detalhe ?? 'Informação nova, não registrada no retrato anterior da tela.',
      meta: sinal.meta ?? sinal.grupo,
      quando: 'hoje',
    }))
}

/* ---------- leitura tolerante dos dados da tela ---------- */

type Solto = Record<string, unknown>

const obj = (v: unknown): Solto => (v && typeof v === 'object' ? (v as Solto) : {})
const lista = (v: unknown): Solto[] => (Array.isArray(v) ? v.map(obj) : [])

function num(...c: unknown[]): number | undefined {
  for (const v of c) {
    if (typeof v === 'number' && Number.isFinite(v)) return v
    if (typeof v === 'string') {
      const n = Number(v.replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.'))
      if (Number.isFinite(n) && n !== 0) return n
    }
  }
  return undefined
}

function txt(...c: unknown[]): string {
  for (const v of c) if (typeof v === 'string' && v.trim()) return v.trim()
  return ''
}

function nivelPorTexto(t: string): NivelNotificacao {
  const s = t.toLowerCase()
  if (s.includes('crit') || s.includes('grav') || s.includes('pendente')) return 'critico'
  if (s.includes('aten') || s.includes('acompanh') || s.includes('análise') || s.includes('analise')) return 'atencao'
  return 'info'
}

export function sinaisDeEstrategia(dados: unknown): Sinal[] {
  const d = obj(dados)
  const sinais: Sinal[] = []

  const fin = obj(d.financeiro ?? d.impactoFinanceiro ?? d.impacto ?? d.financialImpact)

  const indicadores: [string, string, unknown][] = [
    ['pib', 'PIB agro', fin.pibAgro ?? fin.pib ?? d.pibAgro ?? d.pib],
    ['tributos', 'Tributos', fin.tributos ?? d.tributos],
    ['frete', 'Frete', fin.frete ?? d.frete],
    ['resultado', 'Resultado', fin.resultado ?? d.resultado],
  ]

  for (const [chave, rotulo, bruto] of indicadores) {
    const n = num(bruto)
    if (n === undefined) continue
    sinais.push({
      id: 'indicador-' + chave,
      grupo: 'indicador',
      rotulo: rotulo + ' atualizado',
      valor: 'R$ ' + n.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' bi',
      numero: n,
      nivel: 'atencao',
      meta: 'Impacto financeiro',
    })
  }

  for (const c of lista(d.commodities ?? d.demanda ?? d.demandaOferta ?? d.culturas)) {
    const nome = txt(c.nome, c.name, c.produto, c.cultura)
    if (!nome) continue

    const estoque = num(c.estoqueMeses, c.estoque, c.meses, c.cobertura)
    const status = txt(c.status, c.situacao, c.classificacao)
    const pressao = num(c.pressao, c.pressaoPreco, c.variacao)

    if (estoque !== undefined) {
      const critico = estoque < 1
      sinais.push({
        id: 'commodity-' + nome.toLowerCase() + '-estoque',
        grupo: 'commodity',
        rotulo: nome + ': estoque em ' + estoque.toFixed(1) + ' mês',
        valor: estoque.toFixed(1) + ' m',
        numero: estoque,
        nivel: critico ? 'critico' : 'atencao',
        detalhe: critico ? 'Cobertura abaixo de um mês de consumo.' : undefined,
        meta: 'Demanda vs oferta',
      })
    }
    if (status) {
      sinais.push({
        id: 'commodity-' + nome.toLowerCase() + '-status',
        grupo: 'commodity',
        rotulo: nome + ' passou a ' + status,
        valor: status,
        nivel: nivelPorTexto(status),
        meta: 'Demanda vs oferta',
      })
    }
    if (pressao !== undefined) {
      sinais.push({
        id: 'commodity-' + nome.toLowerCase() + '-pressao',
        grupo: 'commodity',
        rotulo: 'Pressão de preço: ' + nome,
        valor: pressao.toFixed(1) + '%',
        numero: pressao,
        nivel: 'atencao',
        meta: 'Demanda vs oferta',
      })
    }
  }

  for (const f of lista(d.fornecedores ?? d.suppliers ?? d.contatos)) {
    const nome = txt(f.nome, f.name, f.empresa)
    const status = txt(f.status, f.situacao)
    if (!nome || !status) continue
    sinais.push({
      id: 'fornecedor-' + nome.toLowerCase(),
      grupo: 'fornecedor',
      rotulo: nome + ' agora está ' + status,
      valor: status,
      nivel: nivelPorTexto(status),
      meta: 'Fornecedores',
    })
  }

  lista(d.insights ?? d.sugestoes ?? d.recomendacoes ?? d.acoes).forEach((i, indice) => {
    const texto = txt(i.texto, i.titulo, i.title, i.descricao, i.acao)
    if (!texto) return
    sinais.push({
      id: 'insight-' + texto.slice(0, 40).toLowerCase().replace(/\s+/g, '-') + '-' + indice,
      grupo: 'insight',
      rotulo: 'Nova recomendação do estrategista',
      valor: 'sugestão',
      nivel: 'info',
      detalhe: texto,
      meta: 'Insights e ações',
    })
  })

  const eficiencia = num(obj(d.alocacao ?? d.recursos).eficiencia, d.eficiencia)
  if (eficiencia !== undefined) {
    sinais.push({
      id: 'indicador-eficiencia',
      grupo: 'indicador',
      rotulo: 'Eficiência de alocação',
      valor: eficiencia.toFixed(1) + '%',
      numero: eficiencia,
      nivel: eficiencia < 60 ? 'atencao' : 'info',
      meta: 'Alocação de recursos',
    })
  }

  return sinais
}
