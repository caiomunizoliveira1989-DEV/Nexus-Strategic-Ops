'use client'

import { Info } from 'lucide-react'
import {
  PARAMETROS_CARBONO,
  SERIE_MENSAL,
  calcularCarbono,
  type TipoEtapa,
} from '@/lib/data/carbono'

const numero = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 })
const moeda = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
})

const COR_VALOR: Record<TipoEtapa, string> = {
  entrada: 'text-foreground',
  produto: 'text-neon-cyan',
  desconto: 'text-neon-amber',
  resultado: 'text-neon-green',
}

export function CreditosCarbono() {
  const { etapas, liquido, valor } = calcularCarbono()
  const p = PARAMETROS_CARBONO

  const maior = Math.max(...SERIE_MENSAL)
  const anterior = SERIE_MENSAL[SERIE_MENSAL.length - 2]
  const atual = SERIE_MENSAL[SERIE_MENSAL.length - 1]
  const variacao = ((atual - anterior) / anterior) * 100

  return (
    <div className="flex flex-col">
      <div className="mb-1.5 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-foreground">
            Créditos de Carbono
          </p>
          <p className="text-[10px] leading-tight text-muted-foreground">
            Memória de cálculo · geração anual
          </p>
        </div>
        <span className="shrink-0 rounded-lg border border-neon-green/30 bg-neon-green/5 px-2 py-0.5 text-[10px] font-semibold text-neon-green">
          +{numero.format(variacao)}% no mês
        </span>
      </div>

      <div className="mb-2 flex items-end justify-between gap-3">
        <div>
          <p className="text-[9px] uppercase tracking-wide text-muted-foreground">
            Saldo em carteira
          </p>
          <p className="text-xl font-bold leading-tight text-foreground">
            {numero.format(p.saldoEmCarteira)}{' '}
            <span className="text-[10px] font-normal text-muted-foreground">tCO₂e</span>
          </p>
        </div>

        <div className="flex h-6 w-24 shrink-0 items-end gap-0.5" aria-hidden>
          {SERIE_MENSAL.map((v, i) => (
            <span
              key={i}
              className="w-full rounded-sm bg-neon-green/45"
              style={{ height: Math.max(15, (v / maior) * 100) + '%' }}
            />
          ))}
        </div>
      </div>

      <ul className="border-t border-border pt-1">
        {etapas.map((etapa) => (
          <li
            key={etapa.id}
            className="flex items-start justify-between gap-2 border-b border-border/50 py-1 last:border-b-0"
          >
            <span className="min-w-0">
              <span className="block text-[11px] font-medium leading-tight text-foreground">
                {etapa.rotulo}
              </span>
              <span className="block text-[9px] leading-tight text-muted-foreground">
                {etapa.expressao}
              </span>
            </span>
            <span
              className={
                'shrink-0 whitespace-nowrap text-right text-[11px] font-semibold tabular-nums ' +
                COR_VALOR[etapa.tipo]
              }
            >
              {etapa.tipo === 'desconto' && etapa.valor !== 0 ? '−' : ''}
              {numero.format(Math.abs(etapa.valor))}
              <span className="ml-1 text-[9px] font-normal text-muted-foreground">
                {etapa.unidade}
              </span>
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-1.5 grid grid-cols-2 gap-2 border-t border-border pt-1.5">
        <div>
          <p className="text-[9px] uppercase tracking-wide text-muted-foreground">
            Preço de referência
          </p>
          <p className="text-sm font-semibold text-foreground">
            {moeda.format(p.precoReferenciaBrl)}
            <span className="text-[9px] font-normal text-muted-foreground"> /tCO₂e</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-[9px] uppercase tracking-wide text-muted-foreground">
            Valor anual
          </p>
          <p className="text-sm font-semibold text-neon-green">{moeda.format(valor)}</p>
        </div>
      </div>

      <p className="mt-1 flex items-start gap-1 rounded border border-border bg-background/40 px-1.5 py-1 text-[9px] leading-snug text-muted-foreground">
        <Info className="mt-px size-2.5 shrink-0" />
        {numero.format(liquido)} tCO₂e/ano × {moeda.format(p.precoReferenciaBrl)} por tonelada
        = {moeda.format(valor)} por ano.
      </p>
    </div>
  )
}
