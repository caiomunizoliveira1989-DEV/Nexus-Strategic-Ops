'use client'

import {
  Activity,
  AlertTriangle,
  CloudRain,
  Droplets,
  MapPin,
  Sprout,
  Wind,
} from 'lucide-react'
import dynamic from 'next/dynamic'

const AgricultureMapPanel = dynamic(
  () =>
    import('@/components/dashboard/agriculture-map-panel').then(
      (mod) => mod.AgricultureMapPanel,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="grid h-full min-h-[22.5rem] w-full place-items-center rounded-xl bg-card/40 text-xs text-muted-foreground">
        Carregando mapa...
      </div>
    ),
  },
)
import { useAgricultureData } from '@/lib/hooks/use-agriculture-data'
import { useI18n } from '@/lib/context/i18n-context'
import { weatherCodeKey } from '@/lib/i18n/dictionary'
import type { AlertCode, FeedCode, Severity } from '@/lib/services/agriculture-derived'

const severityBox: Record<Severity, string> = {
  high: 'border-red-500/40 bg-red-500/10 text-red-400',
  medium: 'border-amber-500/40 bg-amber-500/10 text-amber-400',
  low: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
}

const alertTitleKey: Record<AlertCode, `alerts.${AlertCode}.title`> = {
  storm: 'alerts.storm.title',
  rain: 'alerts.rain.title',
  windHigh: 'alerts.windHigh.title',
  windMedium: 'alerts.windMedium.title',
  fungus: 'alerts.fungus.title',
  drought: 'alerts.drought.title',
  soilLow: 'alerts.soilLow.title',
  stable: 'alerts.stable.title',
}

const alertDetailKey: Record<AlertCode, `alerts.${AlertCode}.detail`> = {
  storm: 'alerts.storm.detail',
  rain: 'alerts.rain.detail',
  windHigh: 'alerts.windHigh.detail',
  windMedium: 'alerts.windMedium.detail',
  fungus: 'alerts.fungus.detail',
  drought: 'alerts.drought.detail',
  soilLow: 'alerts.soilLow.detail',
  stable: 'alerts.stable.detail',
}

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

const panelBase =
  'rounded-xl border border-border bg-card/50 transition-all duration-200 ease-out will-change-transform hover:z-30 hover:border-neon-green/40 hover:shadow-2xl hover:shadow-black/40 lg:hover:scale-[1.04]'

export function AgricultureView() {
  const { location, weather, derived, loading } = useAgricultureData()
  const { t } = useI18n()

  const soilMoisture = derived?.soilMoisture ?? 0
  const cropHealth = derived?.cropHealth ?? 0
  const ndvi = derived?.ndvi ?? 0
  const pestRisk: Severity = derived?.pestRisk ?? 'low'
  const alerts = derived?.alerts ?? []
  const feed = derived?.feed ?? []

  const activeAlerts = alerts.filter((item) => item.severity !== 'low').length

  const kpis = [
    {
      label: t('agri.soilMoisture'),
      value: `${soilMoisture}%`,
      hint: t('agri.hint.soil'),
      icon: Droplets,
    },
    {
      label: t('agri.cropHealth'),
      value: `${cropHealth}%`,
      hint: t('agri.hint.crop'),
      icon: Sprout,
    },
    {
      label: t('agri.activeAlerts'),
      value: `${activeAlerts}`,
      hint: t('agri.hint.alerts'),
      icon: AlertTriangle,
    },
    {
      label: t('agri.pestRisk'),
      value: t(`severity.${pestRisk}`),
      hint: t('agri.hint.pest'),
      icon: Activity,
    },
  ]

  return (
    <div className="flex min-h-full w-full flex-col gap-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground lg:text-xl">
            {t('agri.title')}
          </h2>
          <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground lg:text-sm">
            <MapPin className="size-3.5" />
            {location.label}
            <span className="text-muted-foreground/60">
              {location.lat.toFixed(3)}, {location.lng.toFixed(3)}
            </span>
          </p>
        </div>

        {loading && (
          <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground lg:text-xs">
            <span className="size-1.5 animate-pulse rounded-full bg-neon-green" />
            {t('agri.syncing')}
          </span>
        )}
      </header>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((item) => {
          const Icon = item.icon
          return (
            <div
              key={item.label}
              className="relative rounded-xl border border-border bg-card/50 p-4 transition-all duration-200 ease-out will-change-transform hover:border-neon-green/40 hover:shadow-2xl hover:shadow-black/40 lg:hover:z-40 lg:hover:scale-[1.45] xl:hover:scale-[1.55]"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-[11px] uppercase leading-tight tracking-wide text-muted-foreground lg:text-xs">
                  {item.label}
                </span>
                <Icon className="size-4 shrink-0 text-neon-green" />
              </div>
              <p className="mt-1.5 text-2xl font-bold leading-none text-foreground lg:text-3xl">
                {loading ? '--' : item.value}
              </p>
              <p className="mt-1.5 text-[11px] text-muted-foreground lg:text-xs">
                {item.hint}
              </p>
            </div>
          )
        })}
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 items-stretch gap-4 lg:gap-0 lg:grid-cols-[minmax(0,1fr)_23.75rem] xl:grid-cols-[minmax(0,1fr)_27.5rem] 2xl:grid-cols-[minmax(0,1fr)_31.25rem]">
        <div className="relative h-full min-h-[22.5rem] overflow-hidden rounded-xl border border-border lg:min-h-[33.75rem] xl:min-h-[38.75rem]">
          <AgricultureMapPanel />

          <div className="pointer-events-none absolute bottom-3 left-3 z-[500] flex flex-wrap gap-2">
            <span className="rounded-md border border-border bg-card/95 px-2.5 py-1 text-[11px] text-muted-foreground backdrop-blur lg:text-xs">
              {t('agri.soilMoisture')}{' '}
              <strong className="text-foreground">{soilMoisture}%</strong>
            </span>
            <span className="rounded-md border border-border bg-card/95 px-2.5 py-1 text-[11px] text-muted-foreground backdrop-blur lg:text-xs">
              NDVI <strong className="text-foreground">{ndvi}</strong>
            </span>
            <span
              className={`rounded-md border px-2.5 py-1 text-[11px] backdrop-blur lg:text-xs ${severityBox[pestRisk]}`}
            >
              {t('agri.pestRisk')}{' '}
              <strong>{t(`severity.${pestRisk}`)}</strong>
            </span>
          </div>
        </div>

        <aside className="flex min-h-0 flex-col gap-4 lg:pl-4">
          <section className={`${panelBase} origin-right p-4`}>
            <header className="mb-3 flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-foreground lg:text-base">
                {t('agri.feed')}
              </h3>
              <span className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-neon-green">
                <span className="size-1.5 animate-pulse rounded-full bg-neon-green" />
                {t('agri.live')}
              </span>
            </header>
            <ul className="space-y-2.5">
              {feed.map((item) => (
                <li
                  key={item.id}
                  className="border-l-2 border-neon-green/40 pl-2.5"
                >
                  <p className="text-xs font-medium text-foreground lg:text-sm">
                    {t(feedTitleKey[item.code])}
                  </p>
                  <p className="text-[11px] text-muted-foreground lg:text-xs">
                    {t(feedDetailKey[item.code], {
                      value: item.value ?? 0,
                      temp: item.temp ?? 0,
                      humidity: item.humidity ?? 0,
                      days: item.days ?? 0,
                      time: item.time ?? '--:--',
                    })}
                  </p>
                  <p className="text-[10px] text-muted-foreground/60">
                    {item.minutesAgo === 0
                      ? t('agri.now')
                      : t('agri.minutesAgo', { minutes: item.minutesAgo })}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <section className={`${panelBase} origin-right p-4`}>
            <header className="mb-3 flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-foreground lg:text-base">
                {t('agri.alerts')}
              </h3>
              <span className="text-[10px] text-muted-foreground lg:text-xs">
                {t('agri.activeCount', { count: alerts.length })}
              </span>
            </header>
            <ul className="space-y-2">
              {alerts.map((alert) => (
                <li
                  key={alert.id}
                  className={`rounded-lg border px-2.5 py-2 ${severityBox[alert.severity]}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold lg:text-sm">
                      {t(alertTitleKey[alert.code])}
                    </p>
                    <span className="text-[9px] uppercase tracking-wide opacity-80">
                      {alert.source}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] opacity-90 lg:text-xs">
                    {t(alertDetailKey[alert.code], { value: alert.value })}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <section
            className={`${panelBase} flex min-h-0 flex-1 origin-right flex-col p-4`}
          >
            <header className="mb-3 flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-foreground lg:text-base">
                {t('agri.weather')}
              </h3>
              <span className="flex min-w-0 items-center gap-1 text-[10px] text-muted-foreground lg:text-xs">
                <MapPin className="size-3 shrink-0" />
                <span className="truncate">{location.label}</span>
              </span>
            </header>

            {weather ? (
              <>
                <div className="flex items-end justify-between gap-2">
                  <div>
                    <p className="text-2xl font-bold leading-none text-foreground lg:text-3xl">
                      {Math.round(weather.temperature)}C
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground lg:text-xs">
                      {t(weatherCodeKey(weather.code))}
                    </p>
                  </div>
                  <div className="space-y-0.5 text-right text-[10px] text-muted-foreground lg:text-xs">
                    <p className="flex items-center justify-end gap-1">
                      <Droplets className="size-3" />{' '}
                      {Math.round(weather.humidity)}%
                    </p>
                    <p className="flex items-center justify-end gap-1">
                      <Wind className="size-3" />{' '}
                      {Math.round(weather.windSpeed)} km/h
                    </p>
                    <p className="flex items-center justify-end gap-1">
                      <CloudRain className="size-3" /> {weather.precipitation} mm
                    </p>
                  </div>
                </div>

                <ul className="mt-3 flex-1 space-y-1 border-t border-border pt-2">
                  {weather.daily.map((day) => (
                    <li
                      key={day.date}
                      className="flex items-center justify-between text-[10px] lg:text-xs"
                    >
                      <span className="text-muted-foreground">
                        {new Date(`${day.date}T12:00:00`).toLocaleDateString(
                          undefined,
                          { weekday: 'short' },
                        )}
                      </span>
                      <span className="text-foreground">
                        {Math.round(day.max)} / {Math.round(day.min)}
                      </span>
                      <span className="text-muted-foreground">
                        {day.precipitation.toFixed(1)} mm
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="py-4 text-[11px] text-muted-foreground">
                {t('agri.loadingWeather')}
              </p>
            )}
          </section>
        </aside>
      </div>
    </div>
  )
}

export default AgricultureView
