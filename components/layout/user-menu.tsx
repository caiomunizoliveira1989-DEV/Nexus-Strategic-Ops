'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ChevronDown, LogOut, Settings, User } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { useI18n } from '@/lib/context/i18n-context'

type UserMenuProps = {
  name?: string
  role?: string
  initials?: string
}

export function UserMenu({ name, role, initials }: UserMenuProps) {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!ref.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    function handleEsc(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleEsc)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleEsc)
    }
  }, [])

  const displayName = name?.trim() || 'Caio Oliveira'
  const displayRole = role?.trim() || 'Analista'
  const badge =
    initials?.trim() ||
    displayName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('')

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-lg border border-border bg-card/40 px-2.5 py-1.5 text-left transition-colors hover:border-neon-green/40 hover:bg-card/70"
      >
        <span className="grid size-7 shrink-0 place-items-center rounded-full border border-neon-green/40 bg-neon-green/15 text-[11px] font-bold text-neon-green">
          {badge}
        </span>
        <span className="hidden min-w-0 flex-col leading-tight sm:flex">
          <span className="truncate text-xs font-semibold text-foreground">
            {displayName}
          </span>
          <span className="truncate text-[10px] text-muted-foreground">
            {displayRole}
          </span>
        </span>
        <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-xl border border-border bg-card shadow-2xl shadow-black/50"
        >
          <Link
            href="/profile"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="block border-b border-border px-3 py-2.5 transition-colors hover:bg-muted/40"
          >
            <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-muted-foreground">
              <User className="size-3" /> {t('common.profile')}
            </p>
            <p className="mt-1 truncate text-sm font-semibold text-foreground">
              {displayName}
            </p>
            <p className="truncate text-[11px] text-muted-foreground">
              {displayRole}
            </p>
          </Link>

          <div className="p-1.5">
            <Link
              href="/settings"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
            >
              <Settings className="size-3.5" /> {t('common.settings')}
            </Link>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-400"
            >
              <LogOut className="size-3.5" /> {t('common.signOut')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
