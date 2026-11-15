'use client'

import { Component, type ReactNode } from 'react'
import { FinancialImpactChart as PainelEstrategia } from '@/components/dashboard/financial-impact-chart'

/* Reaproveita o MESMO componente da vista Estrategia.
   Sem copia de valores: se la atualizar, aqui atualiza junto. */
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

export function PainelImpactoDashboard() {
  return (
    <div className="flex h-full min-h-[210px] flex-col overflow-hidden">
      <Protegido>
        <PainelEstrategia />
      </Protegido>
    </div>
  )
}
