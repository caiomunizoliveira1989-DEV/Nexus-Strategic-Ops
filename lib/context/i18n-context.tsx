'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  DEFAULT_LOCALE,
  dictionaries,
  isLocale,
  type Locale,
  type TranslationKey,
} from '@/lib/i18n/dictionary'

const STORAGE_KEY = 'nexus.locale'

type Vars = Record<string, string | number>

type I18nContextValue = {
  locale: Locale
  setLocale: (next: Locale) => void
  t: (key: TranslationKey, vars?: Vars) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

function interpolate(template: string, vars?: Vars): string {
  if (!vars) return template
  return template.replace(/\{(\w+)\}/g, (_match, name: string) =>
    String(vars[name] ?? ''),
  )
}

function detectInitialLocale(): Locale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored && isLocale(stored)) return stored
  } catch {
    // ignora
  }

  const browser = window.navigator.language.slice(0, 2).toLowerCase()
  if (isLocale(browser)) return browser

  return DEFAULT_LOCALE
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setLocaleState(detectInitialLocale())
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    document.documentElement.lang = locale === 'pt' ? 'pt-BR' : locale
  }, [locale, ready])

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)

    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // ignora
    }
  }, [])

  const t = useCallback(
    (key: TranslationKey, vars?: Vars) => {
      const table = dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE]
      const template = table[key] ?? dictionaries[DEFAULT_LOCALE][key] ?? key
      return interpolate(template, vars)
    },
    [locale],
  )

  const value = useMemo(
    () => ({ locale, setLocale, t }),
    [locale, setLocale, t],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext)

  if (!context) {
    throw new Error('useI18n precisa estar dentro de I18nProvider')
  }

  return context
}
