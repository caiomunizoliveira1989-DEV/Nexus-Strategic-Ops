'use client'

import { useI18n } from '@/lib/context/i18n-context'
import { useView } from '@/lib/context/view-context'
import { usePathname, useRouter } from 'next/navigation'
import { NAV_TABS, type ViewId } from '@/components/dashboard/top-nav'

export function BottomNav() {
const { t } = useI18n()
const { active, setActive } = useView()
const router = useRouter()
const pathname = usePathname()

const handleSelect = (view: ViewId) => {
    setActive(view)
    if (pathname !== '/') router.push('/')
}

return (
    <nav
    aria-label={t('common.views')}
    className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
    >
    <ul className="flex items-stretch justify-around">
        {NAV_TABS.map((tab) => {
        const Icon = tab.icon
        const isActive = tab.id === active

        return (
            <li key={tab.id} className="flex-1">
            <button
                type="button"
                onClick={() => handleSelect(tab.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`flex w-full flex-col items-center gap-1 px-1 py-2.5 text-[10px] font-medium transition-colors ${
                isActive
                    ? 'text-neon-green'
                    : 'text-muted-foreground active:text-foreground'
                }`}
            >
                <Icon className="size-5 shrink-0" />
                <span className="truncate">{t(tab.key)}</span>
            </button>
            </li>
        )
        })}
    </ul>
    </nav>
)
}