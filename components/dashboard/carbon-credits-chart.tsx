'use client'

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts'
import type { PontoCredito } from '@/lib/entities/compliance'

const numero = new Intl.NumberFormat('pt-BR')

export function CarbonCreditsChart({ serie }: { serie: PontoCredito[] }) {
  return (
    <div className="h-full min-h-[8rem] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={serie} margin={{ top: 4, right: 6, bottom: 0, left: -24 }}>
          <defs>
            <linearGradient id="carbono" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--neon-green)" stopOpacity={0.45} />
              <stop offset="100%" stopColor="var(--neon-green)" stopOpacity={0.03} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="mes"
            tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(valor) => numero.format(valor)}
          />
          <Area
            type="monotone"
            dataKey="saldo"
            stroke="var(--neon-green)"
            fill="url(#carbono)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
