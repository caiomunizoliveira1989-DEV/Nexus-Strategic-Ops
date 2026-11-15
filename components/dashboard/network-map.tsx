import { cn } from '@/lib/utils'
import { CardRedeLogistica } from '@/components/dashboard/card-rede-logistica'

type Node = { x: number; y: number; color: string }

export function NetworkMap({ className }: { className?: string }) {
  const nodes: Node[] = [
    { x: 240, y: 210, color: 'var(--neon-cyan)' },
    { x: 470, y: 165, color: 'var(--neon-cyan)' },
    { x: 560, y: 150, color: 'var(--neon-magenta)' },
    { x: 700, y: 195, color: 'var(--neon-magenta)' },
  ]
  return (
    <CardRedeLogistica />
  )
}
