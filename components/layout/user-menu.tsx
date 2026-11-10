'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown, Globe, LogOut, Settings, User } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { useI18n } from '@/lib/context/i18n-context'
import { LOCALE_OPTIONS, type Locale } from '@/lib/i18n/dictionary'

type UserMenuProps = {
  name?: string
  role?: string
  initials?: string
}

export function UserMenu({ name, role, initials }: UserMenuProps) {
  const { locale, setLocale, t } = useI18n()
  const [open, setOpen] = useState(false)
  const [showLanguages, setShowLanguages] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!ref.current?.contains(event.target as Node)) {
        setOpen(false)
        setShowLanguages(false)
      }
    }

    function handleEsc(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
        setShowLanguages(false)
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
  const displayRole = role?.trim() || 'Analyst'
  const badge =
    initials?.trim() ||
    displayName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('')

  const current =
    LOCALE_OPTIONS.find((option) => option.value === locale) ?? LOCALE_OPTIONS[0]

  function handleSelect(next: Locale) {
    setLocale(next)
    setShowLanguages(false)
    setOpen(false)
  }

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
        <span className="ml-1 rounded border border-border px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
          {current.short}
        </span>
        <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-xl border border-border bg-card shadow-2xl shadow-black/50"
        >
          <div className="border-b border-border px-3 py-2.5">
            <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-muted-foreground">
              <User className="size-3" /> {t('common.profile')}
            </p>
            <p className="mt-1 truncate text-sm font-semibold text-foreground">
              {displayName}
            </p>
            <p className="truncate text-[11px] text-muted-foreground">
              {displayRole}
            </p>
          </div>

          <div className="border-b border-border">
            <button
              type="button"
              onClick={() => setShowLanguages((value) => !value)}
              className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-xs text-foreground transition-colors hover:bg-muted/40"
            >
              <span className="flex items-center gap-2">
                <Globe className="size-3.5 text-neon-green" />
                {t('common.language')}
              </span>
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                {current.label}
                <ChevronDown
                  className={`size-3 transition-transform ${showLanguages ? 'rotate-180' : ''}`}
                />
              </span>
            </button>

            {showLanguages && (
              <ul className="pb-1.5">
                {LOCALE_OPTIONS.map((option) => {
                  const active = option.value === locale

                  return (
                    <li key={option.value}>
                      <button
                        type="button"
                        onClick={() => handleSelect(option.value)}
                        className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-xs transition-colors hover:bg-muted/40 ${
                          active ? 'text-neon-green' : 'text-muted-foreground'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className="w-5 text-[10px] font-bold">
                            {option.short}
                          </span>
                          {option.label}
                        </span>
                        {active && <Check className="size-3.5" />}
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          <div className="p-1.5">
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
            >
              <Settings className="size-3.5" /> {t('common.settings')}
            </button>
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
