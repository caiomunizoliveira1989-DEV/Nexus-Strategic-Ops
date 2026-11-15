'use client'

import { Sprout, Target, Scale, Ship, AlertTriangle } from 'lucide-react'
import { useSinaisPainel, type EscopoVista } from '@/lib/notifications/registro'
import type { NivelNotificacao } from '@/lib/notifications/store'

const META: Record<
  EscopoVista,
  { titulo: string; Icone: typeof Sprout; cor: string }
> = {
  agricultura: { titulo: 'Agricultura', Icone: Sprout, cor: 'text-neon-green' },
  estrategia: { titulo: 'Estratégia', Icone: Target, cor: 'text-neon-cyan' },
  conformidade: { titulo: 'Conformidade', Icone: Scale, cor: 'text-neon-amber' },
  logistica: { titulo: 'Logística', Icone: Ship, cor: 'text-neon-red' },
}

const COR_NIVEL: Record<NivelNotificacao, string> = {
  critico: 'text-neon-red',
  atencao: 'text-neon-amber',
  info: 'text-muted-foreground',
}

const ORDEM: EscopoVista[] = ['agricultura', 'estrategia', 'conformidade', 'logistica']

export function PainelVistas() {
  const sinais = useSinaisPainel()

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {ORDEM.map((escopo) => {
        const { titulo, Icone, cor } = META[escopo]
        const lista = sinais[escopo]
        const criticos = lista.filter((s) => s.nivel === 'critico').length

        return (
          <div
            key={escopo}
            className="flex flex-col rounded-xl border border-border bg-card p-3.5"
          >
            <div className="flex items-center gap-2">
              <Icone className={'size-4 shrink-0 ' + cor} />
              <h4 className="text-[13.5px] font-semibold text-foreground">{titulo}</h4>
              <span className="ml-auto text-[10px] text-muted-foreground">
                {lista.length}
              </span>
            </div>

            {criticos > 0 && (
              <span className="mt-1.5 flex items-center gap-1 text-[10.5px] font-semibold text-neon-red">
                <AlertTriangle className="size-3" />
                {criticos} em estado crítico
              </span>
            )}

            <ul className="mt-2 flex-1">
              {lista.length === 0 && (
                <li className="text-[11.5px] leading-snug text-muted-foreground">
                  Abra a vista {titulo} para carregar os dados desta sessão.
                </li>
              )}

              {lista.slice(0, 4).map((s) => (
                <li
                  key={s.id}
                  className="flex items-baseline justify-between gap-2 border-b border-border/50 py-1.5 last:border-b-0"
                >
                  <span className="min-w-0 truncate text-[11.5px] text-muted-foreground">
                    {s.rotulo}
                  </span>
                  <span className={'shrink-0 text-[12px] font-semibold ' + COR_NIVEL[s.nivel]}>
                    {s.valor}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </div>
  )
}
