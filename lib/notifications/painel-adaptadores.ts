import type { SinalPainel } from '@/lib/notifications/registro'
import type { NivelNotificacao } from '@/lib/notifications/store'

type Entrada = Omit<SinalPainel, 'escopo'>

type Solto = Record<string, unknown>
const obj = (v: unknown): Solto => (v && typeof v === 'object' ? (v as Solto) : {})
const lista = (v: unknown): Solto[] => (Array.isArray(v) ? v.map(obj) : [])

function num(v: unknown): number | undefined {
  if (typeof v === 'number' && Number.isFinite(v)) return v
  if (typeof v === 'string') {
    const n = Number(v.replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.'))
    return Number.isFinite(n) ? n : undefined
  }
  return undefined
}

function txt(...c: unknown[]): string {
  for (const v of c) if (typeof v === 'string' && v.trim()) return v.trim()
  return ''
}

function arred(n: number, casas = 0): string {
  return n.toLocaleString('pt-BR', {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  })
}

function nivelDe(t: string): NivelNotificacao {
  const s = t.toLowerCase()
  if (/high|alto|crit|grav|sever/.test(s)) return 'critico'
  if (/medium|medi|aten|moder/.test(s)) return 'atencao'
  return 'info'
}

/* ---------- LOGÍSTICA ---------- */

export function sinaisDeLogisticaPainel(
  alertas: readonly unknown[],
  navios: readonly unknown[],
): Entrada[] {
  const sinais: Entrada[] = []
  const listaAlertas = alertas.map(obj)
  const listaNavios = navios.map(obj)

  const graves = listaAlertas.filter((a) =>
    String(a.severidade ?? '').toLowerCase().startsWith('grav'),
  ).length
  const criticos = listaAlertas.filter((a) =>
    String(a.risco ?? '').toLowerCase().includes('crit'),
  ).length

  sinais.push({
    id: 'logistica-alertas-ativos',
    rotulo: 'Alertas logísticos ativos',
    valor: String(listaAlertas.length),
    numero: listaAlertas.length,
    nivel: graves > 0 ? 'atencao' : 'info',
    meta: 'Logística',
  })

  sinais.push({
    id: 'logistica-alertas-graves',
    rotulo: 'Alertas graves em corredores',
    valor: String(graves),
    numero: graves,
    nivel: graves > 0 ? 'critico' : 'info',
    meta: 'Logística',
  })

  sinais.push({
    id: 'logistica-pontos-criticos',
    rotulo: 'Pontos em condição crítica',
    valor: String(criticos),
    numero: criticos,
    nivel: criticos > 0 ? 'critico' : 'info',
    meta: 'Logística',
  })

  const afetados = listaNavios.filter(
    (n) => Array.isArray(n.alertas) && (n.alertas as unknown[]).length > 0,
  )

  sinais.push({
    id: 'logistica-navios-afetados',
    rotulo: 'Navios em rota afetada',
    valor: String(afetados.length),
    numero: afetados.length,
    nivel: afetados.length > 0 ? 'atencao' : 'info',
    meta: 'Logística',
  })

  const atraso = afetados.reduce((soma, n) => soma + (num(n.atrasoDias) ?? 0), 0)

  sinais.push({
    id: 'logistica-atraso-acumulado',
    rotulo: 'Atraso acumulado na frota',
    valor: atraso + ' dias',
    numero: atraso,
    nivel: atraso >= 20 ? 'critico' : atraso > 0 ? 'atencao' : 'info',
    meta: 'Logística',
  })

  /* índice de risco consolidado, para o card do topo */
  const indice = listaAlertas.length
    ? Math.round((graves * 2 + criticos) / (listaAlertas.length * 3) * 100)
    : 0

  sinais.push({
    id: 'logistica-indice-risco',
    rotulo: 'Índice de risco da rede',
    valor: indice + '%',
    numero: indice,
    nivel: indice >= 60 ? 'critico' : indice >= 30 ? 'atencao' : 'info',
    meta: 'Logística',
  })

  return sinais
}

/* ---------- CONFORMIDADE ---------- */

export function sinaisDeConformidadePainel(alertas: readonly unknown[]): Entrada[] {
  const sinais: Entrada[] = []
  const listaAlertas = alertas.map(obj)

  const area = listaAlertas.reduce(
    (soma, a) => soma + (num(a.hectares ?? a.areaHa ?? a.area) ?? 0),
    0,
  )
  const graves = listaAlertas.filter((a) =>
    String(a.severidade ?? '').toLowerCase().startsWith('grav'),
  ).length

  sinais.push({
    id: 'conformidade-poligonos',
    rotulo: 'Polígonos monitorados',
    valor: String(listaAlertas.length),
    numero: listaAlertas.length,
    nivel: 'info',
    meta: 'Conformidade',
  })

  sinais.push({
    id: 'conformidade-area-alerta',
    rotulo: 'Área em alerta',
    valor: arred(area) + ' ha',
    numero: area,
    nivel: graves > 0 ? 'critico' : 'info',
    meta: 'Conformidade',
  })

  sinais.push({
    id: 'conformidade-graves',
    rotulo: 'Ocorrências graves',
    valor: String(graves),
    numero: graves,
    nivel: graves > 0 ? 'critico' : 'info',
    meta: 'Conformidade',
  })

  return sinais
}

/* ---------- ESTRATÉGIA ---------- */

export function sinaisDeEstrategiaPainel(dados: unknown): Entrada[] {
  const d = obj(dados)
  const fin = obj(d.financeiro ?? d.impactoFinanceiro ?? d.impacto)
  const sinais: Entrada[] = []

  const receita = num(fin.pibAgro ?? fin.pib ?? d.pibAgro ?? d.pib)
  if (receita !== undefined) {
    sinais.push({
      id: 'estrategia-receita',
      rotulo: 'PIB agro',
      valor: 'R$ ' + arred(receita, 1) + ' bi',
      numero: receita,
      nivel: 'info',
      meta: 'Estratégia',
    })
  }

  const resultado = num(fin.resultado ?? d.resultado)
  if (resultado !== undefined) {
    sinais.push({
      id: 'estrategia-resultado',
      rotulo: 'Resultado do setor',
      valor: 'R$ ' + arred(resultado, 1) + ' bi',
      numero: resultado,
      nivel: 'info',
      meta: 'Estratégia',
    })
  }

  const eficiencia = num(obj(d.alocacao ?? d.recursos).eficiencia ?? d.eficiencia)
  if (eficiencia !== undefined) {
    sinais.push({
      id: 'estrategia-eficiencia',
      rotulo: 'Eficiência de alocação',
      valor: arred(eficiencia, 1) + '%',
      numero: eficiencia,
      nivel: eficiencia < 60 ? 'atencao' : 'info',
      meta: 'Estratégia',
    })
  }

  for (const c of lista(d.commodities ?? d.demanda ?? d.demandaOferta)) {
    const nome = txt(c.nome, c.name, c.produto)
    const estoque = num(c.estoqueMeses ?? c.estoque ?? c.meses)
    if (!nome || estoque === undefined) continue
    sinais.push({
      id: 'estrategia-commodity-' + nome.toLowerCase(),
      rotulo: 'Estoque de ' + nome,
      valor: estoque.toFixed(1) + ' m',
      numero: estoque,
      nivel: estoque < 1 ? 'critico' : 'info',
      meta: 'Estratégia',
    })
  }

  return sinais
}
