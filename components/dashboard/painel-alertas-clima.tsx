'use client'

import { useState } from 'react'
import { CloudRain, ChevronDown, MoreHorizontal } from 'lucide-react'

export type LinhaAlerta = {
  label: string
  value: string
  toneClass: string
}

type Props = {
  titulo: string
  resumo: string
  linhas: LinhaAlerta[]
  legenda: LinhaAlerta[]
}

const SCROLL =
  'overflow-y-auto pr-2 ' +
  '[scrollbar-width:thin] [scrollbar-color:var(--border)_transparent] ' +
  '[&::-webkit-scrollbar]:w-1.5 ' +
  '[&::-webkit-scrollbar-thumb]:rounded-full ' +
  '[&::-webkit-scrollbar-thumb]:bg-border ' +
  '[&::-webkit-scrollbar-track]:bg-transparent'

export function PainelAlertasClima({ titulo, resumo, linhas, legenda }: Props) {
  const [aberto, setAberto] = useState(true)

  return (
    <div className="pointer-events-auto w-72 max-w-full rounded-xl border border-border bg-card/95 shadow-lg backdrop-blur">
      <button
        onClick={() => setAberto((v) => !v)}
        className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left"
      >
        <span className="flex min-w-0 items-center gap-2">
          <CloudRain className="size-4 shrink-0 text-neon-cyan" />
          <span className="truncate text-[13px] font-bold tracking-tight text-foreground">
            {titulo}
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-1">
          <MoreHorizontal className="size-4 text-muted-foreground" />
          <ChevronDown
            className={
              'size-4 text-muted-foreground transition-transform ' +
              (aberto ? '' : '-rotate-90')
            }
          />
        </span>
      </button>

      {aberto && (
        <div className={'max-h-[18rem] px-3 pb-3 ' + SCROLL}>
          <p className="mb-2 text-[12px] leading-snug text-muted-foreground">{resumo}</p>

          <ul className="border-t border-border pt-2">
            {linhas.map((linha, i) => (
              <li
                key={i}
                className="flex items-baseline justify-between gap-3 border-b border-border/50 py-1.5 last:border-b-0"
              >
                <span className="text-[12px] leading-tight text-muted-foreground">
                  {linha.label}
                </span>
                <span className={'shrink-0 text-right text-[12px] font-semibold ' + linha.toneClass}>
                  {linha.value}
                </span>
              </li>
            ))}
          </ul>

          <ul className="mt-2 border-t border-border pt-2">
            {legenda.map((item, i) => (
              <li
                key={i}
                className="flex items-baseline justify-between gap-3 border-b border-border/50 py-1.5 last:border-b-0"
              >
                <span className="text-[12px] leading-tight text-muted-foreground">
                  {item.label}
                </span>
                <span className={'shrink-0 text-right text-[12px] font-semibold ' + item.toneClass}>
                  {item.value}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
