'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { CalendarDays } from 'lucide-react'
import {
  ANOS,
  FONTES,
  acharTrimestre,
  calcular,
  formatBillions,
  serieCalculada,
  trimestresDoAno,
  type Currency,
} from '@/lib/data/financial'

const FMT = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

const MES_FIM: Record<1 | 2 | 3 | 4, string> = {
  1: '03',
  2: '06',
  3: '09',
  4: '12',
}

type Props = { currency?: Currency }

export function FinancialImpactChart({ currency = 'BRL' }: Props) {
  const [ano, setAno] = useState(2026)
  const [tri, setTri] = useState<1 | 2 | 3 | 4>(2)
  const [ptax, setPtax] = useState<number | null>(null)

  const disponiveis = useMemo(() => trimestresDoAno(ano), [ano])
  const ponto = useMemo(() => acharTrimestre(ano, tri), [ano, tri])
  const calc = useMemo(() => (ponto ? calcular(ponto) : null), [ponto])
  const serie = useMemo(() => serieCalculada(), [])

  useEffect(() => {
    if (disponiveis.length && !disponiveis.some((d) => d.tri === tri)) {
      setTri(disponiveis[0].tri)
    }
  }, [disponiveis, tri])

  useEffect(() => {
    let cancelado = false
    fetch(`/api/cambio/${ano}-${MES_FIM[tri]}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!cancelado) setPtax(d?.ptaxMedio ?? null)
      })
      .catch(() => {
        if (!cancelado) setPtax(null)
      })
    return () => {
      cancelado = true
    }
  }, [ano, tri])

  if (!calc) {
    return (
      <p className="text-sm text-muted-foreground">
        Sem publicação do IBGE para este trimestre.
      </p>
    )
  }

  const cards = [
    { label: 'PIB Agro', valor: calc.pibBrlBi, cor: 'text-neon-blue' },
    { label: 'Tributos', valor: calc.tributosBrlBi, cor: 'text-neon-amber' },
    { label: 'Frete', valor: calc.freteBrlBi, cor: 'text-neon-green' },
    { label: 'Resultado', valor: calc.resultadoBrlBi, cor: 'text-neon-cyan' },
  ]

  const eixo = serie.map((s) => ({ label: `${s.ano}T${s.tri}`, pib: s.pibBrlBi }))
  const max = Math.max(...serie.map((s) => s.pibBrlBi))
  const domain: [number, number] = [0, Math.ceil(max * 1.1)]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <CalendarDays className="size-4" />
        <label className="flex items-center gap-1.5">
          <span>Ano</span>
          <select
            value={ano}
            onChange={(e) => setAno(Number(e.target.value))}
            className="rounded-lg border border-neon-blue/40 bg-transparent px-2 py-1 text-xs font-semibold text-foreground"
            aria-label="Ano de referência"
          >
            {ANOS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-1.5">
          <span>Trimestre</span>
          <select
            value={tri}
            onChange={(e) => setTri(Number(e.target.value) as 1 | 2 | 3 | 4)}
            className="rounded-lg border border-neon-blue/40 bg-transparent px-2 py-1 text-xs font-semibold text-foreground"
            aria-label="Trimestre"
          >
            {disponiveis.map((d) => (
              <option key={d.tri} value={d.tri}>
                {d.tri}º trimestre
              </option>
            ))}
          </select>
        </label>
        <span className="ml-auto rounded bg-neon-green/15 px-1.5 py-0.5 text-[9px] text-neon-green">
          margem {FMT.format(calc.margemPct)}%
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-lg border border-border/60 px-2.5 py-2">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{c.label}</p>
            <p className={`text-sm font-bold ${c.cor}`}>
              {formatBillions(c.valor, currency, ptax)}
            </p>
          </div>
        ))}
      </div>

      <div className="h-[200px] w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={eixo} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
            <defs>
              <linearGradient id="finPib" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--neon-blue)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="var(--neon-blue)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: 'var(--muted-foreground)', fontSize: 9 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={domain}
              tick={{ fill: 'var(--muted-foreground)', fontSize: 9 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              formatter={(v) => {
                const n = typeof v === 'number' ? v : Number(v)
                return [Number.isFinite(n) ? formatBillions(n) : '-', 'PIB Agro']
              }}
            />
            <Area
              type="monotone"
              dataKey="pib"
              stroke="var(--neon-blue)"
              fill="url(#finPib)"
              strokeWidth={2.5}
              dot={{ r: 3, fill: 'var(--neon-blue)' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-lg border border-border/60 bg-muted/20 p-3 text-[12px] leading-relaxed text-muted-foreground">
        <span className="font-semibold text-foreground">{calc.rotulo}</span>
        {' · '}PIB {formatBillions(calc.pibBrlBi)}
        {' · '}tributos a 16,15%
        {' · '}{FMT.format(calc.toneladasMt)} mi t x R$ {FMT.format(calc.freteTonMedio)}/t
        {ptax ? ` · cambio R$ ${FMT.format(ptax)}` : ''}
      </div>

      <div className="border-t border-border/60 pt-2.5">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Fontes e parâmetros
        </p>
        <ul className="space-y-1">
          {FONTES.map((f) => (
            <li key={f.nome} className="flex flex-wrap items-baseline gap-1.5 text-[11px] leading-relaxed">
              <a
                href={f.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-neon-blue hover:underline"
              >
                {f.nome}
              </a>
              <span className="text-muted-foreground">· {f.orgao}</span>
              <span
                className={
                  'rounded px-1 ' +
                  (f.tipo === 'oficial'
                    ? 'bg-neon-green/15 text-neon-green'
                    : f.tipo === 'estudo'
                      ? 'bg-neon-blue/15 text-neon-blue'
                      : 'bg-neon-amber/15 text-neon-amber')
                }
              >
                {f.tipo}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground/80">
          Resultado = PIB − tributos − frete. Não é lucro contábil: o valor adicionado já exclui
          impostos sobre produtos e parte do frete é serviço de outro setor.
        </p>
      </div>
    </div>
  )
}
