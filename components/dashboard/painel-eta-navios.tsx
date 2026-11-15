'use client'

import { Ship as ShipIcon, AlertTriangle } from 'lucide-react'
import {
  COR_STATUS,
  STATUS_ROTA_CLASS,
  STATUS_ROTA_LABEL,
  type NavioAvaliado,
} from '@/lib/data/rotas-navios'

type Props = {
  navios: NavioAvaliado[]
  selecionadoId: string | null
  alertaSelecionadoId: string | null
  onSelecionar: (navio: NavioAvaliado) => void
}

export function PainelEtaNavios({
  navios,
  selecionadoId,
  alertaSelecionadoId,
  onSelecionar,
}: Props) {
  const emRisco = navios.filter((n) => n.status !== 'em_rota').length

  return (
    <div className="flex flex-col">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShipIcon className="size-[22px] text-neon-cyan" />
          <h3 className="text-[17px] font-semibold text-foreground">ETA e Status</h3>
        </div>
        <span className="rounded-lg border border-neon-amber/30 bg-neon-amber/5 px-2.5 py-1 text-[12px] font-semibold text-neon-amber">
          {emRisco} em rota afetada
        </span>
      </div>

      <div className="grid grid-cols-[1fr_auto_auto] gap-x-4 border-b border-border pb-2.5 text-[12px] font-medium uppercase tracking-wide text-muted-foreground">
        <span>Navio</span>
        <span>Previsão</span>
        <span className="text-right">Status</span>
      </div>

      <ul>
        {navios.map((navio) => {
          const destacado = navio.id === selecionadoId
          const afetadoPeloAlerta =
            !!alertaSelecionadoId &&
            navio.alertas.some((a) => a.id === alertaSelecionadoId)

          return (
            <li key={navio.id} className="border-b border-border last:border-b-0">
              <button
                onClick={() => onSelecionar(navio)}
                className={
                  'w-full rounded px-1.5 py-3 text-left transition-colors ' +
                  (destacado
                    ? 'bg-neon-cyan/10'
                    : afetadoPeloAlerta
                      ? 'bg-neon-amber/5'
                      : 'hover:bg-background/40')
                }
              >
                <span className="grid grid-cols-[1fr_auto_auto] items-start gap-x-4">
                  <span className="min-w-0">
                    <span className="block truncate text-[15px] font-semibold leading-snug text-foreground">
                      {navio.nome}
                    </span>
                    <span className="mt-0.5 block truncate text-[12px] leading-snug text-muted-foreground">
                      {navio.origem} → {navio.destino}
                    </span>
                  </span>

                  <span className="text-right">
                    <span className="block text-[14px] leading-snug text-muted-foreground">
                      {navio.etaBase}
                    </span>
                    {navio.atrasoDias > 0 && (
                      <span className="mt-0.5 block text-[12.5px] font-semibold leading-snug text-neon-amber">
                        +{navio.atrasoDias}d → {navio.etaAjustado}
                      </span>
                    )}
                  </span>

                  <span
                    className={
                      'text-right text-[13.5px] font-semibold leading-snug ' +
                      STATUS_ROTA_CLASS[navio.status]
                    }
                  >
                    {STATUS_ROTA_LABEL[navio.status]}
                  </span>
                </span>

                {navio.alertas.length > 0 && (
                  <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    {navio.alertas.slice(0, 3).map((alerta) => (
                      <span
                        key={alerta.id}
                        className="flex items-center gap-1 rounded border border-border bg-background/40 px-2 py-0.5 text-[11.5px]"
                        style={{ color: COR_STATUS[navio.status] }}
                      >
                        <AlertTriangle className="size-3" />
                        {alerta.titulo}
                      </span>
                    ))}
                    {navio.alertas.length > 3 && (
                      <span className="text-[11.5px] text-muted-foreground">
                        +{navio.alertas.length - 3}
                      </span>
                    )}
                  </span>
                )}
              </button>
            </li>
          )
        })}
      </ul>

      <p className="mt-2.5 border-t border-border pt-2.5 text-[12px] leading-relaxed text-muted-foreground">
        Status e atraso calculados pelas zonas de alerta que o traçado da rota cruza.
      </p>
    </div>
  )
}
