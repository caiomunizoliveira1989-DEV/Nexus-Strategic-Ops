'use client'

import { Ship } from 'lucide-react'
import { MiniMapaLogistica } from '@/components/dashboard/mini-mapa-logistica'

export function StatusRedeLogistica() {
  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card p-3.5">
      <div className="mb-2 flex items-center gap-2">
        <Ship className="size-4 text-neon-cyan" />
        <h4 className="text-[13.5px] font-semibold text-foreground">
          Status da Rede Logística
        </h4>
        <span className="ml-auto text-[10px] text-muted-foreground">ao vivo</span>
      </div>
      <MiniMapaLogistica />
    </div>
  )
}
