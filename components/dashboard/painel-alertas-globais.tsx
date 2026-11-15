'use client'

import { useState } from 'react'
import { Globe2, ChevronDown, RefreshCw, Loader2 } from 'lucide-react'
import {
  COR_SEVERIDADE,
  ROTULO_CATEGORIA,
  type AlertaLogistica,
  type CategoriaAlerta,
} from '@/lib/data/alertas-logistica'
import { PROBLEMA_POR_ALERTA } from '@/lib/data/alertas-problemas'

const CATEGORIAS: CategoriaAlerta[] = ['conflito', 'clima', 'congestao', 'rota']

// ALTURA_VISIVEL controla quantos alertas aparecem antes de rolar.
// 23rem ~ 3 alertas | 29rem ~ 4 alertas | 35rem ~ 5 alertas
const SCROLL =
  'overflow-y-auto pr-2 ' +
  '[scrollbar-width:thin] [scrollbar-color:var(--border)_transparent] ' +
  '[&::-webkit-scrollbar]:w-1.5 ' +
  '[&::-webkit-scrollbar-thumb]:rounded-full ' +
  '[&::-webkit-scrollbar-thumb]:bg-border ' +
  '[&::-webkit-scrollbar-track]:bg-transparent'

type Props = {
  alertas: AlertaLogistica[]
  carregando: boolean
  atualizadoEm: string | null
  filtro: Record<CategoriaAlerta, boolean>
  onAlternarCategoria: (c: CategoriaAlerta) => void
  onSelecionar: (a: AlertaLogistica) => void
  onAtualizar: () => void
}

export function PainelAlertasGlobais({
  alertas,
  carregando,
  atualizadoEm,
  filtro,
  onAlternarCategoria,
  onSelecionar,
  onAtualizar,
}: Props) {
  const [aberto, setAberto] = useState(true)

  const visiveis = alertas.filter((a) => filtro[a.categoria])
  const hora = atualizadoEm
    ? new Date(atualizadoEm).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : null

  return (
    <div className="pointer-events-auto w-[22rem] max-w-full rounded-xl border border-border bg-card/95 shadow-lg backdrop-blur">
      <div className="flex items-center justify-between gap-2 px-3.5 py-2.5">
        <button
          onClick={() => setAberto((v) => !v)}
          className="flex min-w-0 items-center gap-2 text-left"
        >
          <Globe2 className="size-[18px] shrink-0 text-neon-cyan" />
          <span className="truncate text-[14px] font-bold tracking-tight text-foreground">
            Alertas Globais
          </span>
        </button>
        <div className="flex shrink-0 items-center gap-1">
          <button
            onClick={onAtualizar}
            title="Refazer busca de alertas"
            className="grid size-6 place-items-center rounded text-muted-foreground transition-colors hover:text-foreground"
          >
            <RefreshCw className={'size-3.5 ' + (carregando ? 'animate-spin' : '')} />
          </button>
          <button
            onClick={() => setAberto((v) => !v)}
            title={aberto ? 'Minimizar painel' : 'Expandir painel'}
            className="grid size-6 place-items-center rounded text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronDown
              className={
                'size-4 transition-transform ' + (aberto ? '' : '-rotate-90')
              }
            />
          </button>
        </div>
      </div>

      {aberto && (
        <div className={'max-h-[12rem] px-3.5 pb-3 ' + SCROLL}>
          <div className="mb-2.5 flex flex-wrap gap-1">
            {CATEGORIAS.slice(0, 3).map((c) => (
              <button
                key={c}
                onClick={() => onAlternarCategoria(c)}
                className={
                  'rounded border px-2 py-0.5 text-[11px] font-medium transition-colors ' +
                  (filtro[c]
                    ? 'border-neon-cyan/40 bg-neon-cyan/10 text-neon-cyan'
                    : 'border-border text-muted-foreground/60 line-through')
                }
              >
                {ROTULO_CATEGORIA[c]}
              </button>
            ))}
          </div>

          {carregando && !alertas.length && (
            <p className="flex items-center gap-2 py-3 text-[13px] text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" />
              Buscando fontes…
            </p>
          )}

          <ul>
            {visiveis.map((a) => {
              const cor = COR_SEVERIDADE[a.severidade]
              const problema = PROBLEMA_POR_ALERTA[a.id] ?? a.resumo

              return (
                <li key={a.id} className="border-b border-border/50 last:border-b-0">
                  <button
                    onClick={() => onSelecionar(a)}
                    className="w-full rounded py-2 text-left transition-colors hover:bg-background/50"
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className="size-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: cor.traco }}
                      />
                      <span className="min-w-0 flex-1 truncate text-[13.5px] font-semibold text-foreground">
                        {a.titulo}
                      </span>
                    </span>

                    <span className="mt-1 block pl-4.5 text-[11.5px] font-medium">
                      <span className="text-muted-foreground">{a.local}</span>
                      <span className="text-muted-foreground"> · </span>
                      <span style={{ color: cor.traco }}>{cor.rotulo}</span>
                      <span className="text-muted-foreground"> · {a.risco}</span>
                    </span>

                    <span className="mt-1 line-clamp-2 block pl-4.5 text-[12px] leading-relaxed text-muted-foreground">
                      {problema}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>

          <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
            <span className="text-[11px] text-muted-foreground">
              {visiveis.length} de {alertas.length} alertas
            </span>
            <span className="text-[11px] text-muted-foreground">
              {hora ? 'Busca de hoje, ' + hora : 'sem busca'}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}