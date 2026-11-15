'use client'

import { Component, type ReactNode } from 'react'
import { FinancialImpactChart as PainelEstrategia } from '@/components/dashboard/financial-impact-chart'

/* Mesmo componente da vista Estrategia: le lib/data/financial.ts.
   Se la atualizar, aqui atualiza junto. */
class Protegido extends Component<{ children: ReactNode }, { erro: boolean }> {
  state = { erro: false }

  static getDerivedStateFromError() {
    return { erro: true }
  }

  render() {
    if (this.state.erro) {
      return (
        <div className="grid h-full place-items-center px-3 text-center">
          <p className="text-[11px] leading-snug text-muted-foreground">
            Nao foi possivel carregar o painel financeiro.
          </p>
        </div>
      )
    }
    return this.props.children
  }
}

export function PainelFinanceiroDashboard() {
  return (
    <div className="flex min-h-[260px] w-full min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-card p-3">
      <Protegido>
        <PainelEstrategia />
      </Protegido>
    </div>
  )
}
