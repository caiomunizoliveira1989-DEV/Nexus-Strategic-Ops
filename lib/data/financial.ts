/**
 * Painel de Estratégia — agropecuária brasileira.
 * PIB trimestral em valores correntes (IBGE, Contas Nacionais Trimestrais).
 * Todos os parâmetros de custo são explícitos e rastreáveis.
 */

export type Currency = 'BRL' | 'USD'

export type Trimestre = {
  ano: number
  tri: 1 | 2 | 3 | 4
  pibBrlBi: number
}

/** Valores adicionados da agropecuária, R$ bilhões correntes (IBGE/SIDRA) */
export const PIB_AGRO: Trimestre[] = [
  { ano: 2024, tri: 3, pibBrlBi: 170.874 },
  { ano: 2024, tri: 4, pibBrlBi: 112.268 },
  { ano: 2025, tri: 1, pibBrlBi: 245.582 },
  { ano: 2025, tri: 2, pibBrlBi: 251.976 },
  { ano: 2025, tri: 3, pibBrlBi: 176.191 },
  { ano: 2025, tri: 4, pibBrlBi: 101.548 },
  { ano: 2026, tri: 1, pibBrlBi: 230.386 },
  { ano: 2026, tri: 2, pibBrlBi: 204.591 },
]

export const ANOS = [2026, 2025, 2024]

export function trimestresDoAno(ano: number): Trimestre[] {
  return PIB_AGRO.filter((p) => p.ano === ano).sort((a, b) => a.tri - b.tri)
}

export function acharTrimestre(ano: number, tri: number): Trimestre | undefined {
  return PIB_AGRO.find((p) => p.ano === ano && p.tri === tri)
}

/**
 * Parâmetros do Custo Brasil. Cada um tem origem declarada.
 * Ajuste aqui muda o cálculo do painel inteiro.
 */
export const PARAMETROS = {
  /** ICMS + FETHAB + FUNRURAL + SENAR — referência Mato Grosso */
  aliquotaTributaria: 0.1615,
  /** R$/tonelada — Sorriso (MT) → Santos, jan/2025 */
  freteTonMin: 330,
  /** R$/tonelada — mesma rota, pico de 2025 */
  freteTonMax: 500,
  /** Milhões de toneladas — CONAB, safra 2025/26 */
  producaoGraosAnual: 360.8,
} as const

/** Média entre o menor e o maior frete observados */
export const FRETE_TON_MEDIO =
  (PARAMETROS.freteTonMin + PARAMETROS.freteTonMax) / 2

/**
 * Distribuição da colheita ao longo do ano.
 * Premissa de modelagem, não dado publicado: soja concentra no Q1,
 * milho 2ª safra no Q3, entressafra no Q4.
 */
export const DISTRIBUICAO_SAFRA: Record<1 | 2 | 3 | 4, number> = {
  1: 0.35,
  2: 0.25,
  3: 0.30,
  4: 0.10,
}

export type ResultadoTrimestre = {
  ano: number
  tri: 1 | 2 | 3 | 4
  rotulo: string
  pibBrlBi: number
  tributosBrlBi: number
  freteBrlBi: number
  custoBrlBi: number
  resultadoBrlBi: number
  margemPct: number
  toneladasMt: number
  freteTonMedio: number
}

const r2 = (v: number) => Math.round(v * 100) / 100

export function calcular(t: Trimestre): ResultadoTrimestre {
  const tributos = r2(t.pibBrlBi * PARAMETROS.aliquotaTributaria)

  const toneladasMt = r2(PARAMETROS.producaoGraosAnual * DISTRIBUICAO_SAFRA[t.tri])
  // milhões de t × R$/t = R$ milhões → dividir por 1000 = R$ bilhões
  const frete = r2((toneladasMt * FRETE_TON_MEDIO) / 1000)

  const custo = r2(tributos + frete)
  const resultado = r2(t.pibBrlBi - custo)

  return {
    ano: t.ano,
    tri: t.tri,
    rotulo: `${t.ano} T${t.tri}`,
    pibBrlBi: t.pibBrlBi,
    tributosBrlBi: tributos,
    freteBrlBi: frete,
    custoBrlBi: custo,
    resultadoBrlBi: resultado,
    margemPct: r2((resultado / t.pibBrlBi) * 100),
    toneladasMt,
    freteTonMedio: FRETE_TON_MEDIO,
  }
}

export function serieCalculada(): ResultadoTrimestre[] {
  return PIB_AGRO.map(calcular)
}

const NUM = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

export function formatBillions(
  v: number,
  currency: Currency = 'BRL',
  ptax?: number | null,
): string {
  if (currency === 'USD') {
    if (!ptax || ptax <= 0) return '—'
    return `US$ ${NUM.format(v / ptax)} bi`
  }
  return `R$ ${NUM.format(v)} bi`
}

export type Fonte = {
  nome: string
  orgao: string
  url: string
  tipo: 'oficial' | 'estudo' | 'premissa'
  fornece: string
}

export const FONTES: Fonte[] = [
  {
    nome: 'Contas Nacionais Trimestrais',
    orgao: 'IBGE / SIDRA',
    url: 'https://sidra.ibge.gov.br/home/cnt/brasil',
    tipo: 'oficial',
    fornece: 'PIB da agropecuária por trimestre, valores correntes',
  },
  {
    nome: 'Safra de Grãos 2025/26',
    orgao: 'CONAB',
    url: 'https://www.gov.br/conab/pt-br/assuntos/noticias/conab-estima-producao-de-361-7-milhoes-de-toneladas-de-graos-na-safra-2025-26',
    tipo: 'oficial',
    fornece: 'Produção de 360,8 milhões de toneladas',
  },
  {
    nome: 'Boletim Logístico',
    orgao: 'CONAB',
    url: 'https://www.gov.br/conab/pt-br/atuacao/logistica/boletim-logistico/boletim-logistico-marco-2025.pdf/@@download/file',
    tipo: 'oficial',
    fornece: 'Preços de frete rodoviário por rota',
  },
  {
    nome: 'Logística do agronegócio',
    orgao: 'ESALQ-LOG / USP',
    url: 'https://esalqlog.esalq.usp.br/',
    tipo: 'estudo',
    fornece: 'Custo de escoamento e comparação de rotas',
  },
  {
    nome: 'Tributação da soja e do milho',
    orgao: 'UNEMAT',
    url: 'https://periodicos.unemat.br/ruc/article/download/10428/8281/41857',
    tipo: 'estudo',
    fornece: 'Carga de 16,15% na comercialização interestadual (MT)',
  },
  {
    nome: 'PTAX — Dólar comercial',
    orgao: 'Banco Central do Brasil',
    url: 'https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/swagger-ui3',
    tipo: 'oficial',
    fornece: 'Câmbio oficial para conversão em dólar',
  },
  {
    nome: 'Distribuição trimestral da colheita',
    orgao: 'Modelo do painel',
    url: 'https://www.gov.br/conab/pt-br/atuacao/informacoes-agropecuarias/safras/safra-de-graos',
    tipo: 'premissa',
    fornece: 'Q1 35% · Q2 25% · Q3 30% · Q4 10% (premissa, ajustável)',
  },
]
