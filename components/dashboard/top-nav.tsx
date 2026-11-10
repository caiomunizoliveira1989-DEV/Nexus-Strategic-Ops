'use client'

import { useCallback, useState } from 'react'
import {
  Bell,
  LayoutDashboard,
  Leaf,
  Search,
  ShieldCheck,
  Target,
  Truck,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { UserMenu } from '@/components/layout/user-menu'
import { useI18n } from '@/lib/context/i18n-context'
import type { TranslationKey } from '@/lib/i18n/dictionary'

export type ViewId =
  | 'dashboard'
  | 'agriculture'
  | 'strategy'
  | 'compliance'
  | 'logistics'

export type TabId = ViewId

const TABS: ReadonlyArray<{
  id: ViewId
  key: TranslationKey
  icon: LucideIcon
}> = [
  { id: 'dashboard', key: 'nav.dashboard', icon: LayoutDashboard },
  { id: 'agriculture', key: 'nav.agriculture', icon: Leaf },
  { id: 'strategy', key: 'nav.strategy', icon: Target },
  { id: 'compliance', key: 'nav.compliance', icon: ShieldCheck },
  { id: 'logistics', key: 'nav.logistics', icon: Truck },
]

export type TopNavProps = {
  activeView?: ViewId
  activeTab?: ViewId
  currentView?: ViewId
  view?: ViewId
  onNavigate?: (view: ViewId) => void
  onTabChange?: (view: ViewId) => void
  onViewChange?: (view: ViewId) => void
  onSelect?: (view: ViewId) => void
  userName?: string
  userRole?: string
  [key: string]: unknown
}

export function TopNav(props: TopNavProps) {
  const { t } = useI18n()
  const [internal, setInternal] = useState<ViewId>('agriculture')
  const [search, setSearch] = useState('')

  const current =
    props.activeView ??
    props.activeTab ??
    props.currentView ??
    props.view ??
    internal

  const notify =
    props.onNavigate ??
    props.onTabChange ??
    props.onViewChange ??
    props.onSelect

  const handleSelect = useCallback(
    (view: ViewId) => {
      setInternal(view)
      notify?.(view)
    },
    [notify],
  )

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[112.5rem] flex-wrap items-center gap-3 px-4 py-3 lg:px-6">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-lg border border-neon-green/40 bg-neon-green/10">
            <Leaf className="size-4 text-neon-green" />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-bold tracking-wide text-foreground">
              NEXUS
            </p>
            <p className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
              {t('brand.tagline')}
            </p>
          </div>
        </div>

        <nav
          aria-label={t('common.views')}
          className="order-3 flex w-full items-center gap-1 overflow-x-auto pb-1 lg:order-2 lg:w-auto lg:flex-1 lg:overflow-visible lg:pb-0"
        >
          {TABS.map((tab) => {
            const Icon = tab.icon
            const active = tab.id === current

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleSelect(tab.id)}
                aria-current={active ? 'page' : undefined}
                className={`flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors ${
                  active
                    ? 'bg-neon-green/15 text-neon-green'
                    : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                }`}
              >
                <Icon className="size-3.5 shrink-0" />
                <span>{t(tab.key)}</span>
              </button>
            )
          })}
        </nav>

        <div className="order-2 ml-auto flex items-center gap-2 lg:order-3">
          <form
            onSubmit={(event) => event.preventDefault()}
            className="hidden items-center gap-1.5 rounded-lg border border-border bg-card/40 px-2.5 py-1.5 md:flex"
          >
            <Search className="size-3.5 shrink-0 text-muted-foreground" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t('common.search')}
              className="w-28 bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground/70 lg:w-40"
            />
          </form>

          <button
            type="button"
            aria-label={t('common.alerts')}
            className="relative grid size-8 place-items-center rounded-lg border border-border bg-card/40 text-muted-foreground transition-colors hover:border-neon-green/40 hover:text-foreground"
          >
            <Bell className="size-3.5" />
            <span className="absolute -right-0.5 -top-0.5 grid size-4 place-items-center rounded-full bg-red-500 text-[9px] font-bold text-white">
              3
            </span>
          </button>

          <UserMenu name={props.userName} role={props.userRole} />
        </div>
      </div>
    </header>
  )
}

export default TopNav
