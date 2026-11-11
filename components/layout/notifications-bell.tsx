'use client'

import { useEffect, useRef, useState } from 'react'
import {
  AlertTriangle,
  Bell,
  CloudLightning,
  CloudRain,
  Construction,
  Droplets,
  Wind,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useI18n } from '@/lib/context/i18n-context'
import { useNotifications } from '@/lib/context/notifications-context'
import type { NotificationCode, NotificationSeverity } from '@/lib/services/notifications'

const ICONS: Record<NotificationCode, LucideIcon> = {
  storm: CloudLightning,
  rain: CloudRain,
  windHigh: Wind,
  water: Droplets,
  bridge: Construction,
}

const TONE: Record<NotificationSeverity, string> = {
  low: 'text-neon-blue border-neon-blue/40 bg-neon-blue/10',
  medium: 'text-amber-400 border-amber-400/40 bg-amber-400/10',
  high: 'text-orange-400 border-orange-400/40 bg-orange-400/10',
  critical: 'text-red-400 border-red-400/40 bg-red-400/10',
}

export function NotificationsBell() {
  const { t } = useI18n()
  const { items, count } = useNotifications()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!ref.current?.contains(event.target as Node)) setOpen(false)
    }
    function handleEsc(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleEsc)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleEsc)
    }
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={t('common.alerts')}
        aria-haspopup="menu"
        aria-expanded={open}
        className="relative grid size-8 place-items-center rounded-lg border border-border bg-card/40 text-muted-foreground transition-colors hover:border-neon-green/40 hover:text-foreground"
      >
        <Bell className="size-3.5" />
        {count > 0 && (
          <span className="absolute -right-1 -top-1 grid min-w-4 place-items-center rounded-full border border-background bg-red-500 px-1 text-[10px] font-bold leading-4 text-white">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-[min(20rem,calc(100vw-2rem))] origin-top-right overflow-hidden rounded-xl border border-border bg-card shadow-2xl shadow-black/50"
        >
          <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
              {t('common.alerts')}
            </p>
            <span className="text-[10px] font-semibold text-muted-foreground">
              {count}
            </span>
          </div>

          {items.length === 0 ? (
            <p className="px-3 py-6 text-center text-xs text-muted-foreground">
              Nenhum alerta no momento.
            </p>
          ) : (
            <ul className="max-h-80 overflow-y-auto">
              {items.map((item) => {
                const Icon = ICONS[item.code] ?? AlertTriangle
                const when =
                  item.dayOffset === 0
                    ? 'hoje'
                    : item.dayOffset === 1
                      ? 'amanha'
                      : 'em 2 dias'

                return (
                  <li
                    key={item.id}
                    className="flex gap-2.5 border-b border-border/60 px-3 py-2.5 last:border-0 hover:bg-muted/40"
                  >
                    <span
                      className={
                        'mt-0.5 grid size-6 shrink-0 place-items-center rounded-md border ' +
                        TONE[item.severity]
                      }
                    >
                      <Icon className="size-3.5" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold leading-snug text-foreground">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {item.farmName}
                        {item.region ? ' - ' + item.region : ''}
                      </p>
                      <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                        {item.detail}
                      </p>
                      <p className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground/70">
                        {when}
                      </p>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
