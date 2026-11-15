'use client'

import { useI18n } from '@/lib/context/i18n-context'
import { useAgricultureData } from '@/lib/hooks/use-agriculture-data'
import type { FeedCode } from '@/lib/services/agriculture-derived'

type Derived = NonNullable<ReturnType<typeof useAgricultureData>['derived']>
export type ItemFeed = Derived['feed'][number]

const feedTitleKey: Record<FeedCode, `feed.${FeedCode}.title`> = {
sync: 'feed.sync.title',
forecast: 'feed.forecast.title',
rain: 'feed.rain.title',
wind: 'feed.wind.title',
ndvi: 'feed.ndvi.title',
}

const feedDetailKey: Record<FeedCode, `feed.${FeedCode}.detail`> = {
sync: 'feed.sync.detail',
forecast: 'feed.forecast.detail',
rain: 'feed.rain.detail',
wind: 'feed.wind.detail',
ndvi: 'feed.ndvi.detail',
}

type Props = {
feed: ItemFeed[]
className?: string
}

export function FeedAtividades({
feed,
className = 'rounded-xl border border-border bg-card p-4',
}: Props) {
const { t } = useI18n()

return (
    <section className={className}>
    <header className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-base font-semibold text-foreground lg:text-lg">
        {t('agri.feed')}
        </h3>
        <span className="flex items-center gap-1 text-[11px] uppercase tracking-wide text-neon-green lg:text-xs">
        <span className="size-1.5 animate-pulse rounded-full bg-neon-green" />
        {t('agri.live')}
        </span>
    </header>
    <ul className="space-y-2.5">
        {feed.map((item) => (
        <li key={item.id} className="border-l-2 border-neon-green/40 pl-2.5">
            <p className="text-sm font-medium text-foreground lg:text-base">
            {t(feedTitleKey[item.code])}
            </p>
            <p className="text-xs text-muted-foreground lg:text-sm">
            {t(feedDetailKey[item.code], {
                value: item.value ?? 0,
                temp: item.temp ?? 0,
                humidity: item.humidity ?? 0,
                days: item.days ?? 0,
                time: item.time ?? '--:--',
            })}
            </p>
            <p className="text-[11px] text-muted-foreground/60 lg:text-xs">
            {item.minutesAgo === 0
                ? t('agri.now')
                : t('agri.minutesAgo', { minutes: item.minutesAgo })}
            </p>
        </li>
        ))}
    </ul>
    </section>
)
}

export function FeedAtividadesAuto({ className }: { className?: string }) {
const { derived } = useAgricultureData()
return <FeedAtividades feed={derived?.feed ?? []} className={className} />
}