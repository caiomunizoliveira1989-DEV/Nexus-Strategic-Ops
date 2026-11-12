'use client'

import { useEffect, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts'
import {
  CalendarDays,
  CheckCircle2,
  Info,
  Lightbulb,
  Mail,
  type LucideIcon,
} from 'lucide-react'
import { Panel, PanelTitle } from '@/components/dashboard/panel'
import { GenerateReportButton } from '@/components/dashboard/generate-report-button'
import { FinancialImpactChart } from '@/components/dashboard/financial-impact-chart'
import { DemandaOfertaPanel } from '@/components/dashboard/demanda-oferta-panel'
import { ALOCACAO_CHARTDATA, EFICIENCIA_ALOCACAO } from '@/lib/data/alocacao-recursos'
import { INSIGHTS } from '@/lib/data/insights-estrategicos'
import type {
  FinancialImpactData,
  StrategyDashboardData,
  StrategyHeader,
  SupplierContact,
  SupplierContactStatus,
} from '@/lib/entities/strategy'
import { MOCK_STRATEGY } from '@/lib/mock/strategy'

type StrategyIcon = 'mail' | 'check-circle'
type SupplierTone = 'green' | 'amber' | 'cyan'
type ChartColor = 'blue' | 'green' | 'cyan'

const STRATEGY_ICONS: Record<StrategyIcon, LucideIcon> = {
  mail: Mail,
  'check-circle': CheckCircle2,
}

const SUPPLIER_COLOR_CLASSES: Record<SupplierTone, string> = {
  green: 'text-neon-green',
  amber: 'text-neon-amber',
  cyan: 'text-neon-cyan',
}

const STRATEGY_CHART_COLORS: Record<ChartColor, string> = {
  blue: 'var(--neon-blue)',
  green: 'var(--neon-green)',
  cyan: 'var(--neon-cyan)',
}

const SUPPLIER_VISUALS: Record<
  SupplierContactStatus,
  { icon: StrategyIcon; tone: SupplierTone }
> = {
  contacted: { icon: 'mail', tone: 'green' },
  pending: { icon: 'mail', tone: 'amber' },
  follow_up_required: { icon: 'mail', tone: 'cyan' },
  completed: { icon: 'mail', tone: 'green' },
}

const SUPPLIER_STATUS_LABELS: Record<SupplierContactStatus, string> = {
  contacted: 'Contatado',
  pending: 'Pendente',
  follow_up_required: 'Acompanhamento necessário',
  completed: 'Concluído',
}

const MONTHS_SHORT = [
  'jan.', 'fev.', 'mar.', 'abr.', 'mai.', 'jun.',
  'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.',
]

type HeaderDisplay = {
  overviewLabel: string
  calendarDateLabel: string
}

type FinancialVisual = {
  growthClass: string
  currencySymbol: string
  unitSuffix: string
}

type FinancialDisplay = {
  growthLabel: string
  growthClass: string
  revenueLabel: string
  chartData: { periodLabel: string; revenue: number; cost: number }[]
  yAxisTickLabel: (value: number) => string
}

type SupplierVisual = {
  icon: StrategyIcon
  tone: SupplierTone
}

type SupplierDisplay = {
  id: string
  name: string
  statusLabel: string
  timeLabel: string
  icon: StrategyIcon
  toneClass: string
}

const FINANCIAL_VISUAL: FinancialVisual = {
  growthClass: 'text-neon-green',
  currencySymbol: 'R$',
  unitSuffix: 'M',
}

function formatToday(date: Date): string {
  return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
}

function toHeaderDisplay(header: StrategyHeader, todayLabel: string): HeaderDisplay {
  return {
    overviewLabel: '| ' + todayLabel,
    calendarDateLabel: todayLabel,
  }
}

function toFinancialDisplay(
  financial: FinancialImpactData,
  visual: FinancialVisual,
): FinancialDisplay {
  return {
    growthLabel:
      '(+' +
      financial.growthPct.toLocaleString('pt-BR', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      }) +
      '%)',
    growthClass: visual.growthClass,
    revenueLabel:
      visual.currencySymbol +
      financial.revenueMEur.toLocaleString('pt-BR', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      }) +
      visual.unitSuffix,
    chartData: financial.points.map((point) => ({
      periodLabel: MONTHS_SHORT[new Date(point.date).getUTCMonth()],
      revenue: point.revenueMEur,
      cost: point.costMEur,
    })),
    yAxisTickLabel: (value) => visual.currencySymbol + value + visual.unitSuffix,
  }
}

function toSupplierDisplay(
  supplier: SupplierContact,
  visual: SupplierVisual,
): SupplierDisplay {
  return {
    id: supplier.id,
    name: supplier.name,
    statusLabel: SUPPLIER_STATUS_LABELS[supplier.status],
    timeLabel: new Date(supplier.lastContactedAt).toLocaleTimeString('pt-BR', {
      hour: 'numeric',
      minute: '2-digit',
      timeZone: 'UTC',
    }),
    icon: visual.icon,
    toneClass: SUPPLIER_COLOR_CLASSES[visual.tone],
  }
}

function deriveStrategyPresentation(data: StrategyDashboardData, todayLabel: string) {
  return {
    header: toHeaderDisplay(data.header, todayLabel),
    financial: toFinancialDisplay(data.financial, FINANCIAL_VISUAL),
    suppliers: data.suppliers.map((supplier) =>
      toSupplierDisplay(supplier, SUPPLIER_VISUALS[supplier.status]),
    ),
  }
}

export function StrategyView() {
  const [todayLabel, setTodayLabel] = useState<string | null>(null)

  useEffect(() => {
    setTodayLabel(formatToday(new Date()))
  }, [])

  const strategyPresentation = deriveStrategyPresentation(
    MOCK_STRATEGY,
    todayLabel ?? '',
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Visão Geral Estratégica{' '}
          <span className="font-normal text-muted-foreground">
            {strategyPresentation.header.overviewLabel}
          </span>
        </h1>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 rounded-xl border border-border bg-card/40 px-3 py-2.5 text-sm text-muted-foreground">
            <CalendarDays className="size-4" /> {strategyPresentation.header.calendarDateLabel} ▾
          </span>
          <GenerateReportButton accent="green" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Linha 1 — Impacto Financeiro */}
        <div className="min-w-0 md:col-span-2 md:col-start-1 md:row-start-1">
          <Panel className="flex h-full flex-col">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <PanelTitle className="mb-0">Análise de Impacto Financeiro</PanelTitle>
              <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <CalendarDays className="size-3.5" /> Fechamento trimestral
              </span>
            </div>
            <FinancialImpactChart />
          </Panel>
        </div>

        {/* Coluna direita — Demanda e Fornecedores */}
        <div className="flex min-w-0 flex-col gap-6 md:col-start-3 md:row-span-2 md:row-start-1">
          <Panel className="flex min-h-[18rem] flex-1 flex-col">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <PanelTitle className="mb-0">Demanda vs Oferta de Mercado</PanelTitle>
              <span className="text-[10px] text-muted-foreground">Balanço de grãos</span>
            </div>
            <DemandaOfertaPanel />
          </Panel>

          <Panel className="flex min-h-0 flex-1 flex-col">
            <PanelTitle>Status de Contato com Fornecedores</PanelTitle>
            <ul className="min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
              {strategyPresentation.suppliers.map((supplier) => {
                const SupplierIcon = STRATEGY_ICONS[supplier.icon]
                return (
                  <li
                    key={supplier.id}
                    className="flex items-center justify-between gap-3 border-b border-border py-3 last:border-b-0"
                  >
                    <span className="flex items-center gap-3">
                      <span className="grid size-9 place-items-center rounded-lg bg-accent text-muted-foreground">
                        <SupplierIcon className="size-4" />
                      </span>
                      <span>
                        <p className="text-sm font-medium text-foreground">{supplier.name}</p>
                        <p className={'text-xs ' + supplier.toneClass}>
                          {supplier.statusLabel}
                        </p>
                      </span>
                    </span>
                    <span className="flex items-center gap-2 text-xs text-muted-foreground">
                      {supplier.timeLabel}
                      <Info className="size-3.5" />
                    </span>
                  </li>
                )
              })}
            </ul>
          </Panel>
        </div>

        {/* Linha 2 — Insights e Ações */}
        <div className="min-w-0 md:col-start-1 md:row-start-2">
          <Panel className="flex h-full flex-col">
            <PanelTitle>Insights e Ações</PanelTitle>
            <div className="flex flex-1 flex-col rounded-xl border border-neon-green/30 bg-neon-green/5 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <span className="grid size-7 place-items-center rounded-lg bg-neon-blue/15 text-neon-blue">
                    IA
                  </span>
                  Recomendações do Estrategista
                </span>
                <Lightbulb className="size-5 text-neon-green text-glow-green" />
              </div>
              <ul className="space-y-3 text-sm">
                {INSIGHTS.map((insight) => (
                  <li key={insight.id} className="flex gap-2 text-muted-foreground">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-neon-green" />
                    <span>{insight.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Panel>
        </div>

        {/* Linha 2 — Métricas de Alocação de Recursos */}
        <div className="min-w-0 md:col-start-2 md:row-start-2">
          <Panel className="flex h-full flex-col">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-foreground">
                Métricas de Alocação de Recursos
              </h3>
              <div className="text-right">
                <p className="text-lg font-bold text-foreground">{EFICIENCIA_ALOCACAO}%</p>
                <p className="text-[10px] text-muted-foreground">Eficiência</p>
              </div>
            </div>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={ALOCACAO_CHARTDATA}
                  margin={{ top: 16, right: 6, bottom: 0, left: -22 }}
                >
                  <defs>
                    <linearGradient id="alloc" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={STRATEGY_CHART_COLORS.cyan} />
                      <stop offset="100%" stopColor={STRATEGY_CHART_COLORS.green} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--border)" vertical={false} />
                  <XAxis
                    dataKey="resourceLabel"
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => value + '%'}
                  />
                  <Bar
                    dataKey="allocationPct"
                    fill="url(#alloc)"
                    radius={[6, 6, 0, 0]}
                    barSize={34}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  )
}
