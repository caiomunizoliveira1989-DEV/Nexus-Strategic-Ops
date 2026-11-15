'use client'

import { Flame, MoreVertical } from 'lucide-react'
import { Panel, PanelTitle } from '@/components/dashboard/panel'
import { GenerateReportButton } from '@/components/dashboard/generate-report-button'
import { NetworkMap } from '@/components/dashboard/network-map'
import { SincronizarNotificacoesPainel } from '@/components/dashboard/notificacoes-painel'
import { PainelFinanceiroDashboard } from '@/components/dashboard/painel-financeiro-dashboard'
import { FeedAtividadesAuto } from '@/components/dashboard/feed-atividades'

export function HomeView() {
  return (
    <div className="space-y-2">
      <SincronizarNotificacoesPainel />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          STRATEGIC OVERVIEW DASHBOARD{' '}
        </h1>
        <GenerateReportButton accent="magenta" />
      </div>

      <div className="grid grid-cols-1 items-stretch gap-3 lg:grid-cols-2">
        {/* COLUNA 1 */}
        <div className="flex flex-col gap-3">
          <PainelFinanceiroDashboard />

          <FeedAtividadesAuto className="rounded-xl border border-border bg-card/50 p-4" />
        </div>

        {/* COLUNA 2 */}
        <div className="flex flex-col gap-3">
          <Panel>
            <PanelTitle action={<MoreVertical className="size-4 text-muted-foreground" />}>
              Recomendações por IA | Cadeia de Suprimentos
            </PanelTitle>
            <div className="space-y-3">
              <div className="rounded-xl border border-neon-magenta/40 bg-neon-magenta/5 p-4 shadow-[0_0_20px_-10px_var(--neon-magenta)]">
                <div className="mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Flame className="size-4 text-neon-magenta" /> Prioridade Alta
                  </span>
                  <span className="text-xs font-semibold text-neon-green">
                    +14% Efficiency
                  </span>
                </div>
                <p className="font-medium text-foreground">Otimizar Rota 412</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Redirecionar a logística para aumentar a eficiência nos corredores da América Latina.
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="h-1.5 overflow-hidden rounded-full bg-accent">
                    <div className="w-[72%] rounded-full bg-neon-magenta" />
                  </div>
                  <button className="shrink-0 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-neon-magenta/50">
                    Ver Detalhes
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card/40 p-4">
                <span className="mb-3 flex items-center gap-2 text-sm font-semibold text-neon-amber">
                  <span className="size-2.5 rounded-sm bg-neon-amber" /> Medium
                  Priority
                </span>
                {[
                  {
                    t: 'Ajuste de Estoque',
                    d: 'Ajustar o estoque para permitir pedidos em espera.',
                  },
                  { t: 'Armazenagem de Grãos', d: 'Ampliar a capacidade de armazenagem de grãos.' },
                ].map((r) => (
                  <div
                    key={r.t}
                    className="flex items-center justify-between gap-3 border-t border-border py-3 first:border-t-0 first:pt-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{r.t}</p>
                      <p className="text-xs text-muted-foreground">{r.d}</p>
                    </div>
                    <button className="shrink-0 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-neon-cyan/50">
                      Ver Detalhes
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </Panel>

          <Panel className="flex flex-1 flex-col">
            <PanelTitle action={<MoreVertical className="size-4 text-muted-foreground" />}>
              Status da Rede Logística
            </PanelTitle>
            <NetworkMap className="min-h-52 w-full flex-1" />
          </Panel>
        </div>
      </div>
    </div>
  )
}