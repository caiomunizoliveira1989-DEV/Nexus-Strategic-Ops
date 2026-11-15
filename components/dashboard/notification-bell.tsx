'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  AlertTriangle,
  Bell,
  CheckCheck,
  Inbox,
  Info,
  MapPin,
  ShieldAlert,
} from 'lucide-react'
import {
  focarMapa,
  marcarTodasLidas,
  useNotificacoes,
  type EscopoNotificacao,
  type NivelNotificacao,
} from '@/lib/notifications/store'

const ROTULO_ESCOPO: Record<EscopoNotificacao, string> = {
  painel: 'Painel',
  agricultura: 'Agricultura',
  estrategia: 'Estratégia',
  logistica: 'Logística',
  conformidade: 'Conformidade',
  carbono: 'Carbono',
  geral: 'Geral',
}

const COR: Record<
  NivelNotificacao,
  { texto: string; borda: string; fundo: string; rotulo: string }
> = {
  critico: { texto: 'text-neon-red', borda: 'border-neon-red/40', fundo: 'bg-neon-red/5', rotulo: 'Crítico' },
  atencao: { texto: 'text-neon-amber', borda: 'border-neon-amber/40', fundo: 'bg-neon-amber/5', rotulo: 'Atenção' },
  info: { texto: 'text-neon-cyan', borda: 'border-neon-cyan/40', fundo: 'bg-neon-cyan/5', rotulo: 'Informação' },
}

function Icone({ nivel }: { nivel: NivelNotificacao }) {
  if (nivel === 'critico') return <ShieldAlert className="size-4" />
  if (nivel === 'atencao') return <AlertTriangle className="size-4" />
  return <Info className="size-4" />
}

export function NotificationBell({ className = '' }: { className?: string }) {
  const { escopo, itens, lidas } = useNotificacoes()
  const [aberto, setAberto] = useState(false)
  const [pos, setPos] = useState<{ top: number; right: number } | null>(null)

  const botao = useRef<HTMLButtonElement | null>(null)
  const painel = useRef<HTMLDivElement | null>(null)

  const naoLidas = useMemo(
    () => itens.filter((n) => !lidas.includes(n.id)).length,
    [itens, lidas],
  )

  const posicionar = useCallback(() => {
    const r = botao.current?.getBoundingClientRect()
    if (!r) return
    setPos({ top: r.bottom + 10, right: Math.max(12, window.innerWidth - r.right) })
  }, [])

  useEffect(() => {
    if (!aberto) return
    posicionar()

    function fechar(e: MouseEvent) {
      const alvo = e.target as Node
      if (painel.current?.contains(alvo) || botao.current?.contains(alvo)) return
      setAberto(false)
    }

    function escapar(e: KeyboardEvent) {
      if (e.key === 'Escape') setAberto(false)
    }

    document.addEventListener('mousedown', fechar)
    document.addEventListener('keydown', escapar)
    window.addEventListener('resize', posicionar)
    window.addEventListener('scroll', posicionar, true)

    return () => {
      document.removeEventListener('mousedown', fechar)
      document.removeEventListener('keydown', escapar)
      window.removeEventListener('resize', posicionar)
      window.removeEventListener('scroll', posicionar, true)
    }
  }, [aberto, posicionar])

  const dropdown =
    aberto && pos
      ? createPortal(
          <div
            ref={painel}
            role="dialog"
            aria-label="Notificações"
            style={{ top: pos.top, right: pos.right }}
            className="fixed z-[9999] w-[23rem] max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-xl border border-border bg-card shadow-2xl"
          >
            <div className="flex items-center justify-between gap-2 border-b border-border px-3.5 py-2.5">
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-[13px] font-bold tracking-tight text-foreground">
                  Alertas
                  <span className="rounded bg-background/70 px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                    {itens.length}
                  </span>
                </p>
                <p className="text-[10.5px] text-muted-foreground">
                  Escopo: {ROTULO_ESCOPO[escopo]}
                </p>
              </div>

              {itens.length > 0 && (
                <button
                  onClick={marcarTodasLidas}
                  title="Marcar todas como lidas"
                  className="grid size-7 shrink-0 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:text-neon-green"
                >
                  <CheckCheck className="size-3.5" />
                </button>
              )}
            </div>

            <div className="max-h-[21rem] overflow-y-auto [scrollbar-width:thin] [scrollbar-color:var(--border)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border">
              {itens.length === 0 && (
                <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
                  <Inbox className="size-6 text-muted-foreground" />
                  <p className="text-[12px] text-muted-foreground">
                    Nenhum alerta nesta vista.
                  </p>
                </div>
              )}

              <ul>
                {itens.map((n) => {
                  const cor = COR[n.nivel]
                  const lida = lidas.includes(n.id)
                  return (
                    <li key={n.id} className="border-b border-border/60 last:border-b-0">
                      <button
                        onClick={() => {
                          if (n.mapa) focarMapa(n.mapa)
                          setAberto(false)
                        }}
                        className={
                          'flex w-full items-start gap-2.5 px-3.5 py-2.5 text-left transition-colors hover:bg-background/50 ' +
                          (lida ? 'opacity-60' : '')
                        }
                      >
                        <span className={'mt-0.5 shrink-0 ' + cor.texto}>
                          <Icone nivel={n.nivel} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-start justify-between gap-2">
                            <span className="text-[12.5px] font-semibold leading-snug text-foreground">
                              {n.titulo}
                            </span>
                            {!lida && (
                              <span className="mt-1 size-1.5 shrink-0 rounded-full bg-neon-cyan" />
                            )}
                          </span>
                          <span className="mt-0.5 flex items-center gap-1 text-[10.5px] text-muted-foreground">
                            <MapPin className="size-2.5 shrink-0" />
                            <span className="truncate">{n.local}</span>
                          </span>
                          <span className="mt-1 line-clamp-2 block text-[11.5px] leading-snug text-muted-foreground">
                            {n.descricao}
                          </span>
                          <span className="mt-1 flex flex-wrap items-center gap-1.5">
                            <span
                              className={
                                'rounded border px-1.5 py-0.5 text-[9.5px] font-semibold ' +
                                cor.borda + ' ' + cor.texto + ' ' + cor.fundo
                              }
                            >
                              {cor.rotulo}
                            </span>
                            {n.meta && (
                              <span className="text-[9.5px] text-muted-foreground">{n.meta}</span>
                            )}
                            <span className="text-[9.5px] text-muted-foreground">{n.quando}</span>
                          </span>
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>

            <div className="border-t border-border px-3.5 py-2">
              <p className="text-[10px] leading-snug text-muted-foreground">
                Sincronizado com o mapa de {ROTULO_ESCOPO[escopo]}. Clique para centralizar o alerta.
              </p>
            </div>
          </div>,
          document.body,
        )
      : null

  return (
    <>
      <button
        ref={botao}
        onClick={() => setAberto((v) => !v)}
        aria-expanded={aberto}
        aria-haspopup="dialog"
        title="Notificações"
        className={
          'relative grid size-9 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-neon-green/40 hover:text-foreground ' +
          className
        }
      >
        <Bell className="size-[18px]" />
        {naoLidas > 0 && (
          <span className="absolute -right-1 -top-1 grid min-w-[16px] place-items-center rounded-full bg-neon-red px-1 text-[9.5px] font-bold leading-4 text-white">
            {naoLidas > 9 ? '9+' : naoLidas}
          </span>
        )}
      </button>
      {dropdown}
    </>
  )
}
