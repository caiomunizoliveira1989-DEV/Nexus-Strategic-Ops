'use client'

import Link from 'next/link'
import { ArrowLeft, Check, Globe } from 'lucide-react'
import { useI18n } from '@/lib/context/i18n-context'
import { LOCALE_OPTIONS } from '@/lib/i18n/dictionary'

export default function SettingsPage() {
  const { locale, setLocale, t } = useI18n()

  return (
    <div className="w-full">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
        <header className="flex items-center gap-3">
          <Link
            href="/"
            aria-label="Voltar"
            className="grid size-8 shrink-0 place-items-center rounded-lg border border-border bg-card/40 text-muted-foreground transition-colors hover:border-neon-green/40 hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-lg font-semibold text-foreground lg:text-xl">
              {t('common.settings')}
            </h1>
            <p className="text-[11px] text-muted-foreground lg:text-xs">
              {t('common.language')}
            </p>
          </div>
        </header>

        <section className="rounded-xl border border-border bg-card/50 p-4">
          <header className="mb-3 flex items-center gap-2">
            <Globe className="size-3.5 text-neon-green" />
            <h2 className="text-sm font-semibold text-foreground lg:text-base">
              {t('common.language')}
            </h2>
          </header>
          <ul className="space-y-1">
            {LOCALE_OPTIONS.map((option) => {
              const active = option.value === locale
              return (
                <li key={option.value}>
                  <button
                    type="button"
                    onClick={() => setLocale(option.value)}
                    className={
                      'flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-xs transition-colors ' +
                      (active
                        ? 'border-neon-green/40 bg-neon-green/10 text-neon-green'
                        : 'border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground')
                    }
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-5 text-[10px] font-bold">{option.short}</span>
                      {option.label}
                    </span>
                    {active && <Check className="size-3.5" />}
                  </button>
                </li>
              )
            })}
          </ul>
        </section>
      </div>
    </div>
  )
}
