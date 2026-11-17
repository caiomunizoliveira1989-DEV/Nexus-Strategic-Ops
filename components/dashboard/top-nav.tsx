'use client'

import { useSession } from 'next-auth/react'
import { useCallback } from 'react'
import {
  LayoutDashboard,
  Leaf,
  ShieldCheck,
  Target,
  Truck,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { UserMenu } from '@/components/layout/user-menu'
import { NotificationsBell } from '@/components/layout/notifications-bell'
import { useI18n } from '@/lib/context/i18n-context'
import { useView } from '@/lib/context/view-context'
import { usePathname, useRouter } from 'next/navigation'
import type { TranslationKey } from '@/lib/i18n/dictionary'

export type ViewId =
  | 'dashboard'
  | 'agriculture'
  | 'strategy'
  | 'compliance'
  | 'logistics'

export type TabId = ViewId

export const NAV_TABS: ReadonlyArray<{
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
  const { active: contextView, setActive: setContextView } = useView()
  const router = useRouter()
  const pathname = usePathname()

  const { data: session } = useSession()
  const userName = session?.user?.name ?? props.userName
  const userRole =
    (session?.user as { role?: string } | undefined)?.role ?? props.userRole

  const current =
    props.activeView ??
    props.activeTab ??
    props.currentView ??
    props.view ??
    contextView

  const notify =
    props.onNavigate ??
    props.onTabChange ??
    props.onViewChange ??
    props.onSelect ??
    setContextView

  const handleSelect = useCallback(
    (view: ViewId) => {
      setContextView(view)
      notify?.(view)
      if (pathname !== '/') router.push('/')
    },
    [notify, pathname, router, setContextView],
  )

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[112.5rem] items-center gap-3 px-4 py-3 lg:px-6">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-lg border border-neon-green/40 bg-neon-green/10">
            <Leaf className="size-4 text-neon-green" />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-bold tracking-wide text-foreground">
              NEXUS
            </p>
            <p className="hidden text-[9px] uppercase tracking-[0.18em] text-muted-foreground sm:block">
              {t('brand.tagline')}
            </p>
          </div>
        </div>

        <nav
          aria-label={t('common.views')}
          className="ml-auto hidden items-center gap-1 lg:flex"
        >
          {NAV_TABS.map((tab) => {
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

        <div className="ml-auto flex shrink-0 items-center gap-2 lg:ml-0">
          <NotificationsBell />
          <UserMenu name={userName} role={userRole} />
        </div>
      </div>
    </header>
  )
}

export default TopNav