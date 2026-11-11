/**
 * Painel de Estratégia — agricultura brasileira.
 * Valores-âncora verificados em fontes públicas (2025).
 */

export const FONTES = {
  vbp: 'MAPA/CGAEC — VBP Dez/2025',
  pibAgro: 'IBGE — Contas Nacionais 2025',
  custoLogistico: 'ILOS — Custos Logísticos 2025',
} as const

/** Valores verificados, em R$ bilhões (2025) */
export const ANCORA_2025 = {
  pibAgro: 775.3,
  pibBrasil: 12700,
  vbpTotal: 1416.18,
  vbpLavouras: 928.05,
  vbpPecuaria: 488.13,
  custoLogisticoTotal: 1960,
} as const

/** Participação da agropecuária no PIB nacional */
export const SHARE_AGRO = ANCORA_2025.pibAgro / ANCORA_2025.pibBrasil

/** Custo Brasil rateado ao setor, em R$ bilhões */
export const CUSTO_BRASIL_AGRO = ANCORA_2025.custoLogisticoTotal * SHARE_AGRO

/** Custo Brasil como fração do VBP (~8,45%) */
export const CUSTO_RATE = CUSTO_BRASIL_AGRO / ANCORA_2025.vbpTotal

export type Currency = 'BRL' | 'USD'

export type FinancialPoint = {
  period: string
  revenueBrlBi: number
  costBrlBi: number
  profitBrlBi: number
  source: string
}

const round2 = (v: number) => Math.round(v * 100) / 100

export function makePoint(period: string, vbpBrlBi: number): FinancialPoint {
  const cost = round2(vbpBrlBi * CUSTO_RATE)
  return {
    period,
    revenueBrlBi: vbpBrlBi,
    costBrlBi: cost,
    profitBrlBi: round2(vbpBrlBi - cost),
    source: FONTES.vbp,
  }
}

/**
 * Estimativas mensais do VBP publicadas pelo MAPA.
 * Cada edição revisa o total do ano com a base de produção do mês anterior.
 * Apenas os meses verificados nas publicações oficiais.
 */
const VBP_MENSAL: Record<string, number> = {
  '2025-01': 1413.58,
  '2025-02': 1421.15,
  '2025-09': 1409.04,
  '2025-11': 1416.18,
}

export const FINANCIAL_SERIES: FinancialPoint[] = Object.entries(VBP_MENSAL)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([period, vbp]) => makePoint(period, vbp))

const NUM = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

export function formatBillions(
  valueBrlBi: number,
  currency: Currency = 'BRL',
  ptax?: number,
): string {
  if (currency === 'USD') {
    if (!ptax || ptax <= 0) return '—'
    return `US$ ${NUM.format(valueBrlBi / ptax)} bi`
  }
  return `R$ ${NUM.format(valueBrlBi)} bi`
}

/** Filtra a série até o mês selecionado (formato AAAA-MM) */
export function seriesUntil(period: string): FinancialPoint[] {
  return FINANCIAL_SERIES.filter((p) => p.period <= period)
}
