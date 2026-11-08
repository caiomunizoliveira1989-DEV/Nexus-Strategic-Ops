'use client'

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
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
import type {
  DemandSupplyPoint,
  FinancialImpactData,
  MarketDemandSupplyData,
  ResourceAllocationData,
  StrategyDashboardData,
  StrategyRecommendation,
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
  contacted: 'Contacted',
  pending: 'Pending',
  follow_up_required: 'Follow-up Required',
  completed: 'Completed',
}

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

type MarketVisual = {
  axisSuffix: string
}

type MarketDisplay = {
  gapLabel: string
  chartData: { yearLabel: string; demand: number; supply: number }[]
  yAxisTickLabel: (value: number) => string
}

type AllocationDisplay = {
  efficiencyLabel: string
  chartData: { resourceLabel: string; allocationPct: number }[]
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

type RecommendationDisplay = {
  id: string
  text: string
  icon: StrategyIcon
}

type RecommendationVisual = {
  icon: StrategyIcon
}

const FINANCIAL_VISUAL: FinancialVisual = {
  growthClass: 'text-neon-green',
  currencySymbol: '€',
  unitSuffix: 'M',
}

const MARKET_VISUAL: MarketVisual = {
  axisSuffix: 'M',
}

const RECOMMENDATION_VISUAL: RecommendationVisual = {
  icon: 'check-circle',
}

function formatDate(timestamp: string): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

function toHeaderDisplay(header: StrategyHeader): HeaderDisplay {
  return {
    overviewLabel: `| ${header.presenterName} | ${formatDate(header.overviewDate)}`,
    calendarDateLabel: formatDate(header.calendarDate),
  }
}

function toFinancialDisplay(
  financial: FinancialImpactData,
  visual: FinancialVisual,
): FinancialDisplay {
  return {
    growthLabel: `(+${financial.growthPct.toFixed(1)}%)`,
    growthClass: visual.growthClass,
    revenueLabel: `${visual.currencySymbol}${financial.revenueMEur.toFixed(1)}${visual.unitSuffix}`,
    chartData: financial.points.map((point) => ({
      periodLabel: new Date(point.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC',
      }),
      revenue: point.revenueMEur,
      cost: point.costMEur,
    })),
    yAxisTickLabel: (value) =>
      `${visual.currencySymbol}${value}${visual.unitSuffix}`,
  }
}

function toDemandSupplyPointDisplay(point: DemandSupplyPoint) {
  return {
    yearLabel: `${point.year}`,
    demand: point.demandMTons,
    supply: point.supplyMTons,
  }
}

function toMarketDisplay(
  market: MarketDemandSupplyData,
  visual: MarketVisual,
): MarketDisplay {
  return {
    gapLabel: `${market.gapMTons.toFixed(1)}${visual.axisSuffix} Tons`,
    chartData: market.points.map(toDemandSupplyPointDisplay),
    yAxisTickLabel: (value) => `${value}${visual.axisSuffix}`,
  }
}

function toAllocationDisplay(
  allocation: ResourceAllocationData,
): AllocationDisplay {
  return {
    efficiencyLabel: `${allocation.efficiencyPct}%`,
    chartData: allocation.metrics.map((metric) => ({
      resourceLabel: metric.resource,
      allocationPct: metric.allocationPct,
    })),
    yAxisTickLabel: (value) => `${value}%`,
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
    timeLabel: new Date(supplier.lastContactedAt).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      timeZone: 'UTC',
    }),
    icon: visual.icon,
    toneClass: SUPPLIER_COLOR_CLASSES[visual.tone],
  }
}

function toRecommendationDisplay(
  recommendation: StrategyRecommendation,
  visual: RecommendationVisual,
): RecommendationDisplay {
  return {
    id: recommendation.id,
    text: getRecommendationText(recommendation),
    icon: visual.icon,
  }
}

function getRecommendationText(recommendation: StrategyRecommendation): string {
  switch (recommendation.kind) {
    case 'supply_chain':
      return `Optimize supply chain routes in ${recommendation.region} region by ${recommendation.costReductionPct}% to reduce costs`
    case 'research_investment':
      return `Invest ${recommendation.investmentPct}% in R&D for ${recommendation.sector} ${recommendation.focus} (due ${new Date(recommendation.dueDate).toLocaleDateString('en-US', {
        month: 'numeric',
        day: 'numeric',
        timeZone: 'UTC',
      })})`
    case 'competitor_compliance':
      return `Analyze competitor compliance changes in ${recommendation.region}`
  }
}

function deriveStrategyPresentation(data: StrategyDashboardData) {
  return {
    header: toHeaderDisplay(data.header),
    financial: toFinancialDisplay(data.financial, FINANCIAL_VISUAL),
    market: toMarketDisplay(data.market, MARKET_VISUAL),
    allocation: toAllocationDisplay(data.allocation),
    suppliers: data.suppliers.map((supplier) =>
      toSupplierDisplay(supplier, SUPPLIER_VISUALS[supplier.status]),
    ),
    recommendations: data.recommendations.map((recommendation) =>
      toRecommendationDisplay(recommendation, RECOMMENDATION_VISUAL),
    ),
  }
}

const strategyPresentation = deriveStrategyPresentation(MOCK_STRATEGY)

export function StrategyView() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Nexus Strategic Overview{' '}
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <div className="mb-2 flex items-start justify-between">
            <PanelTitle className="mb-0">Financial Impact Analysis</PanelTitle>
            <div className="text-right">
              <p className={`text-xs font-semibold ${strategyPresentation.financial.growthClass}`}>
                {strategyPresentation.financial.growthLabel}
              </p>
              <p className="text-xl font-bold text-foreground">
                {strategyPresentation.financial.revenueLabel}
              </p>
            </div>
          </div>
          <div className="mb-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-neon-blue" /> Revenue
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-neon-green" /> Cost
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-neon-cyan" /> Profit
            </span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={strategyPresentation.financial.chartData}
                margin={{ top: 10, right: 10, bottom: 0, left: -18 }}
              >
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={STRATEGY_CHART_COLORS.blue} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={STRATEGY_CHART_COLORS.blue} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="cst" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={STRATEGY_CHART_COLORS.green} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={STRATEGY_CHART_COLORS.green} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="periodLabel"
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={strategyPresentation.financial.yAxisTickLabel}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke={STRATEGY_CHART_COLORS.blue}
                  fill="url(#rev)"
                  strokeWidth={3}
                />
                <Area
                  type="monotone"
                  dataKey="cost"
                  stroke={STRATEGY_CHART_COLORS.green}
                  fill="url(#cst)"
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel>
          <PanelTitle>Insights &amp; Actions</PanelTitle>
          <div className="rounded-xl border border-neon-green/30 bg-neon-green/5 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <span className="grid size-7 place-items-center rounded-lg bg-neon-blue/15 text-neon-blue">
                  AI
                </span>
                Strategist Recommendations
              </span>
              <Lightbulb className="size-5 text-neon-green text-glow-green" />
            </div>
            <ul className="space-y-3 text-sm">
              {strategyPresentation.recommendations.map((recommendation) => {
                const RecommendationIcon = STRATEGY_ICONS[recommendation.icon]
                return (
                  <li key={recommendation.id} className="flex gap-2 text-muted-foreground">
                    <RecommendationIcon className="mt-0.5 size-4 shrink-0 text-neon-green" />
                    <span>{recommendation.text}</span>
                  </li>
                )
              })}
            </ul>
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Panel>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-foreground">
              Market Demand vs Supply
            </h3>
            <span className="text-xs text-muted-foreground">
              Gap: <span className="text-neon-cyan">{strategyPresentation.market.gapLabel}</span>
            </span>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={strategyPresentation.market.chartData}
                margin={{ top: 6, right: 6, bottom: 0, left: -22 }}
              >
                <defs>
                  <linearGradient id="dem" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={STRATEGY_CHART_COLORS.blue} stopOpacity={0.5} />
                    <stop offset="100%" stopColor={STRATEGY_CHART_COLORS.blue} stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="sup" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={STRATEGY_CHART_COLORS.green} stopOpacity={0.5} />
                    <stop offset="100%" stopColor={STRATEGY_CHART_COLORS.green} stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="yearLabel"
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={strategyPresentation.market.yAxisTickLabel}
                />
                <Area type="monotone" dataKey="demand" stroke={STRATEGY_CHART_COLORS.blue} fill="url(#dem)" strokeWidth={2.5} />
                <Area type="monotone" dataKey="supply" stroke={STRATEGY_CHART_COLORS.green} fill="url(#sup)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-foreground">
              Resource Allocation Metrics
            </h3>
            <div className="text-right">
              <p className="text-lg font-bold text-foreground">
                {strategyPresentation.allocation.efficiencyLabel}
              </p>
              <p className="text-[10px] text-muted-foreground">Efficiency</p>
            </div>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={strategyPresentation.allocation.chartData}
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
                  tickFormatter={strategyPresentation.allocation.yAxisTickLabel}
                />
                <Bar dataKey="allocationPct" fill="url(#alloc)" radius={[6, 6, 0, 0]} barSize={34}>
                  {strategyPresentation.allocation.chartData.map((item) => (
                    <Cell key={item.resourceLabel} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel>
          <PanelTitle>Automated Supplier Contact Status</PanelTitle>
          <ul className="space-y-1">
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
                      <p className={`text-xs ${supplier.toneClass}`}>
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
    </div>
  )
}
