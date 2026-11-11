'use client'

import { useMemo } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import {
  formatBillions,
  seriesUntil,
  type Currency,
  type FinancialPoint,
} from '@/lib/data/financial'

const MONTHS_SHORT = ['jan.', 'fev.', 'mar.', 'abr.', 'mai.', 'jun.', 'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.']

type Row = {
  label: string
  period: string
  revenueBrlBi: number | null
}

/**
 * Grade fixa de 12 meses com nulo nos meses sem publicação oficial.
 * Evita ligar dois meses distantes com uma reta que sugere continuidade.
 */
function buildRows(visible: FinancialPoint[]): Row[] {
  if (!visible.length) return []
  const year = visible[0].period.slice(0, 4)
  const byPeriod = new Map(visible.map((p) => [p.period, p]))
  return MONTHS_SHORT.map((label, i) => {
    const period = `${year}-${String(i + 1).padStart(2, '0')}`
    const p = byPeriod.get(period)
    return { label, period, revenueBrlBi: p ? p.revenueBrlBi : null }
  })
}

type Props = {
  period: string
  currency?: Currency
  ptax?: number
}

export function FinancialImpactChart({ period, currency = 'BRL', ptax }: Props) {
  const visible = useMemo(() => seriesUntil(period), [period])
  const last = visible[visible.length - 1]
  const rows = useMemo(() => buildRows(visible), [visible])

  const domain = useMemo<[number, number]>(() => {
    if (!visible.length) return [0, 1]
    const values = visible.map((p) => p.revenueBrlBi)
    const min = Math.min(...values)
    const max = Math.max(...values)
    const pad = Math.max((max - min) * 0.3, 5)
    return [Math.floor(min - pad), Math.ceil(max + pad)]
  }, [visible])

  if (!last) {
    return (
      <p className="text-sm text-muted-foreground">
        Sem dados públicos publicados para o período selecionado.
      </p>
    )
  }

  const cards = [
    { label: 'Receita (VBP)', value: last.revenueBrlBi, tone: 'text-neon-blue' },
    { label: 'Custo Brasil', value: last.costBrlBi, tone: 'text-neon-green' },
    { label: 'Lucro', value: last.profitBrlBi, tone: 'text-neon-cyan' },
  ]

  return (
    <div>
      <div className="mb-4 grid grid-cols-3 gap-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-lg border border-border/60 px-3 py-2">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{c.label}</p>
            <p className={`text-sm font-bold ${c.tone}`}>
              {formatBillions(c.value, currency, ptax)}
            </p>
          </div>
        ))}
      </div>

      <div className="h-[240px] w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={rows} margin={{ top: 10, right: 10, bottom: 0, left: -18 }}>
            <defs>
              <linearGradient id="finRev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--neon-blue)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="var(--neon-blue)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={domain}
              tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `${v}`}
            />
            <Tooltip
              formatter={(value) => {
                const n = typeof value === 'number' ? value : Number(value)
                return [
                  Number.isFinite(n) ? formatBillions(n, currency, ptax) : '-',
                  'VBP',
                ]
              }}
            />
            <Area
              type="linear"
              dataKey="revenueBrlBi"
              name="VBP"
              stroke="var(--neon-blue)"
              fill="url(#finRev)"
              strokeWidth={2.5}
              connectNulls={false}
              dot={{ r: 4, fill: 'var(--neon-blue)' }}
              activeDot={{ r: 6 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <p className="mt-2 text-[10px] text-muted-foreground">
        Fonte: {last.source} · Eixo vertical não parte de zero · Meses sem publicação oficial ficam vazios
      </p>
    </div>
  )
}
