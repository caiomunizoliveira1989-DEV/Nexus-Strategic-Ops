// Índices do painel "Métricas de Alocação de Recursos"
// Cada barra é derivada de um dos outros três painéis do dashboard.

import { MOCK_STRATEGY } from '@/lib/mock/strategy'
import { INDICADORES } from '@/lib/data/demanda-oferta'

/* ── Painel "Análise de Impacto Financeiro" (R$ bilhões) ── */
const PIB_AGRO = 204.6
const FRETE = 37.4
const RESULTADO = 134.1

/* ── Painel "Status de Contato com Fornecedores" ── */
const FORNECEDORES = MOCK_STRATEGY.suppliers
const TOTAL_FORNECEDORES = FORNECEDORES.length
const CONCLUIDOS = FORNECEDORES.filter((s) => s.status === 'completed').length

/* ── Painel "Demanda vs Oferta de Mercado" ── */
const COBERTURA_MEDIA =
  INDICADORES.reduce((s, i) => s + i.coberturaMeses, 0) / INDICADORES.length
const META_COBERTURA_MESES = 3

const round1 = (n: number) => Math.round(n * 10) / 10
const pct = (parte: number, total: number) => round1((parte / total) * 100)

export type BarraAlocacao = {
  resourceLabel: string
  allocationPct: number
}

export const ALOCACAO_CHARTDATA: BarraAlocacao[] = [
  { resourceLabel: 'Capital', allocationPct: pct(RESULTADO, PIB_AGRO) },
  { resourceLabel: 'Humano', allocationPct: pct(CONCLUIDOS, TOTAL_FORNECEDORES) },
  { resourceLabel: 'Equipamentos', allocationPct: pct(PIB_AGRO - FRETE, PIB_AGRO) },
  { resourceLabel: 'P&D', allocationPct: pct(COBERTURA_MEDIA, META_COBERTURA_MESES) },
]

const MEDIA =
  ALOCACAO_CHARTDATA.reduce((s, b) => s + b.allocationPct, 0) /
  ALOCACAO_CHARTDATA.length

export const EFICIENCIA_ALOCACAO = round1(MEDIA).toFixed(1).replace('.', ',')

/* Origem de cada índice, para conferência */
export const ORIGEM_BARRAS = [
  { barra: 'Capital', formula: 'Resultado ÷ PIB Agro', dados: RESULTADO + ' ÷ ' + PIB_AGRO, painel: 'Análise de Impacto Financeiro' },
  { barra: 'Humano', formula: 'Concluídos ÷ Total de fornecedores', dados: CONCLUIDOS + ' ÷ ' + TOTAL_FORNECEDORES, painel: 'Status de Contato com Fornecedores' },
  { barra: 'Equipamentos', formula: '(PIB − Frete) ÷ PIB', dados: '(' + PIB_AGRO + ' − ' + FRETE + ') ÷ ' + PIB_AGRO, painel: 'Análise de Impacto Financeiro' },
  { barra: 'P&D', formula: 'Cobertura média ÷ meta de 3 meses', dados: round1(COBERTURA_MEDIA) + ' ÷ ' + META_COBERTURA_MESES, painel: 'Demanda vs Oferta de Mercado' },
]
