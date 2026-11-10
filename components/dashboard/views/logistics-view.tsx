'use client'

import { useEffect, useState } from 'react'
import {
  AlertTriangle,
  Bell,
  CloudRain,
  Layers,
  ListChecks,
  MoreHorizontal,
  Repeat,
  Ship as ShipIcon,
  type LucideIcon,
} from 'lucide-react'
import { Panel } from '@/components/dashboard/panel'
import type {
  LogisticsMap,
  LogisticsWeather,
  MapLegendTone,
  Ship,
  ShipStatus,
  Suggestion,
  SuggestionKind,
  SuggestionTone,
  WeatherRow,
} from '@/lib/entities/logistics'
import { MOCK_LOGISTICS } from '@/lib/mock/logistics'

type SuggestionIcon = LucideIcon

const SUGGESTION_ICONS: Record<SuggestionKind, SuggestionIcon> = {
  rerouting: Repeat,
  diplomatic_alert: Bell,
  compliance_update: AlertTriangle,
  risk_levels: ListChecks,
}

const SUGGESTION_TONE_CLASSES: Record<SuggestionTone, string> = {
  red: 'border-neon-red/40 text-neon-red',
  amber: 'border-neon-amber/40 text-neon-amber',
}

const LEGEND_TONE_CLASSES: Record<MapLegendTone, string> = {
  red: 'text-neon-red',
  amber: 'text-neon-amber',
  cyan: 'text-neon-cyan',
}

const WEATHER_TONE_CLASSES: Record<WeatherRow['tone'], string> = {
  default: 'text-foreground',
  cyan: 'text-neon-cyan',
}

const SHIP_STATUS_LABELS: Record<ShipStatus, string> = {
  en_route: 'En Route',
  conflict_zone: 'Conflict Zone',
}

const SHIP_STATUS_TONES: Record<ShipStatus, string> = {
  en_route: 'text-neon-cyan',
  conflict_zone: 'text-neon-red',
}

type WeatherDisplay = {
  title: string
  summary: string
  rows: { label: string; value: string; toneClass: string }[]
  legend: { label: string; value: string; toneClass: string }[]
}

type ShipDisplay = {
  id: string
  name: string
  eta: string
  statusLabel: string
  toneClass: string
}

type SuggestionDisplay = {
  id: string
  title: string
  description: string
  badge: string
  toneClass: string
  Icon: SuggestionIcon
}

type MapDisplay = {
  imageSrc: string
  imageAlt: string
  activeRoutes: string[]
  alternativeRoute: string
  conflicts: { id: string; label: string; x: number; y: number }[]
}

function formatToday(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function toMapDisplay(map: LogisticsMap): MapDisplay {
  return {
    imageSrc: map.imageSrc,
    imageAlt: map.imageAlt,
    activeRoutes: map.activeRoutes,
    alternativeRoute: map.alternativeRoute,
    conflicts: map.conflicts,
  }
}

function toWeatherDisplay(weather: LogisticsWeather): WeatherDisplay {
  return {
    title: weather.title,
    summary: weather.summary,
    rows: weather.rows.map((row) => ({
      label: row.label,
      value: row.value,
      toneClass: WEATHER_TONE_CLASSES[row.tone],
    })),
    legend: weather.legend.map((item) => ({
      label: item.label,
      value: item.value,
      toneClass: LEGEND_TONE_CLASSES[item.tone],
    })),
  }
}

function toShipDisplay(ship: Ship): ShipDisplay {
  return {
    id: ship.id,
    name: ship.name,
    eta: ship.eta,
    statusLabel: SHIP_STATUS_LABELS[ship.status],
    toneClass: SHIP_STATUS_TONES[ship.status],
  }
}

function toSuggestionDisplay(suggestion: Suggestion): SuggestionDisplay {
  return {
    id: suggestion.id,
    title: suggestion.title,
    description: suggestion.description,
    badge: suggestion.badge,
    toneClass: SUGGESTION_TONE_CLASSES[suggestion.tone],
    Icon: SUGGESTION_ICONS[suggestion.kind],
  }
}

function der3t24NpUrJMNunMMASmhAM953bFGeLXzN7(data: typeof MOCK_LOGISTICS) {
  return {
    map: toMapDisplay(data.map),
    weather: toWeatherDisplay(data.weather),
    ships: data.ships.map(toShipDisplay),
    suggestions: data.suggestions.map(toSuggestionDisplay),
  }
}

export function LogisticsView() {
  const [todayLabel, setTodayLabel] = useState<string | null>(null)

  useEffect(() => {
    setTodayLabel(formatToday(new Date()))
  }, [])

  const logisticsPresentation = der3t24NpUrJMNunMMASmhAM953bFGeLXzN7(MOCK_LOGISTICS)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Logistics Overview{' '}
          <span className="font-normal text-muted-foreground">
            | {MOCK_LOGISTICS.header.presenterName} | {todayLabel ?? ''}
          </span>
        </h1>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-border bg-[#0a1018]">
        <img
          src={logisticsPresentation.map.imageSrc}
          alt={logisticsPresentation.map.imageAlt}
          className="absolute inset-0 size-full object-cover opacity-60"
        />
        <button className="absolute right-4 top-4 z-10 flex items-center gap-2 rounded-lg border border-neon-green/40 bg-background/70 px-3 py-2 text-sm text-neon-green backdrop-blur transition-colors hover:bg-neon-green/10">
          <Layers className="size-4" /> Layers ▾
        </button>

        <svg
          viewBox="0 0 960 460"
          className="relative h-[460px] w-full"
          preserveAspectRatio="xMidYMid slice"
        >
          {logisticsPresentation.map.activeRoutes.map((d, i) => (
            <path
              key={i}
              d={d}
              fill="none"
              stroke="var(--neon-cyan)"
              strokeWidth="1.6"
              opacity="0.7"
            />
          ))}
          <path
            d={logisticsPresentation.map.alternativeRoute}
            fill="none"
            stroke="var(--neon-amber)"
            strokeWidth="2"
            strokeDasharray="6 6"
            opacity="0.9"
            style={{ animation: 'route-dash 4s linear infinite' }}
          />

          {logisticsPresentation.map.conflicts.map((conflict) => (
            <g key={conflict.id}>
              <circle
                cx={conflict.x}
                cy={conflict.y}
                r="22"
                fill="var(--neon-red)"
                opacity="0.18"
              />
              <circle cx={conflict.x} cy={conflict.y} r="6" fill="var(--neon-red)">
                <animate
                  attributeName="opacity"
                  from="1"
                  to="0.4"
                  dur="1.5s"
                  repeatCount="indefinite"
                />
              </circle>
              <rect
                x={conflict.x + 12}
                y={conflict.y - 12}
                width={conflict.label.length * 7 + 14}
                height="20"
                rx="4"
                fill="var(--background)"
                opacity="0.85"
              />
              <text
                x={conflict.x + 19}
                y={conflict.y + 2}
                fill="var(--foreground)"
                fontSize="11"
              >
                {conflict.label}
              </text>
            </g>
          ))}
        </svg>

        <Panel className="absolute left-4 top-4 z-10 w-72 max-w-[80%] bg-background/85 backdrop-blur">
          <div className="mb-2 flex items-center justify-between">
            <span className="flex items-center gap-2 text-base font-semibold text-foreground">
              <CloudRain className="size-5 text-neon-cyan" />{' '}
              {logisticsPresentation.weather.title}
            </span>
            <MoreHorizontal className="size-4 text-muted-foreground" />
          </div>
          <p className="mb-3 text-xs text-muted-foreground">
            {logisticsPresentation.weather.summary}
          </p>
          <ul className="space-y-2 border-t border-border pt-3 text-xs">
            {logisticsPresentation.weather.rows.map((row, i) => (
              <li key={i} className="flex items-center justify-between">
                <span className="text-muted-foreground">{row.label}</span>
                <span className={row.toneClass}>{row.value}</span>
              </li>
            ))}
          </ul>
          <ul className="mt-3 space-y-2 border-t border-border pt-3 text-xs">
            {logisticsPresentation.weather.legend.map((item, i) => (
              <li key={i} className="flex items-center justify-between">
                <span className="text-muted-foreground">{item.label}</span>
                <span className={`font-medium ${item.toneClass}`}>
                  {item.value}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Panel>
          <div className="mb-4 flex items-center gap-2">
            <ShipIcon className="size-5 text-neon-cyan" />
            <h3 className="text-base font-semibold text-foreground">
              ETA &amp; Status
            </h3>
          </div>
          <div className="grid grid-cols-[1fr_auto_auto] gap-x-4 border-b border-border pb-2 text-xs text-muted-foreground">
            <span>Ship</span>
            <span>ETA</span>
            <span className="text-right">Status</span>
          </div>
          <ul>
            {logisticsPresentation.ships.map((ship) => (
              <li
                key={ship.id}
                className="grid grid-cols-[1fr_auto_auto] items-center gap-x-4 border-b border-border py-3 text-sm last:border-b-0"
              >
                <span className="text-foreground">Ship: {ship.name}</span>
                <span className="text-muted-foreground">{ship.eta}</span>
                <span className={`text-right font-medium ${ship.toneClass}`}>
                  {ship.statusLabel}
                </span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel>
          <div className="mb-1 flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-md bg-neon-amber/15 text-neon-amber">
              ⚙
            </span>
            <h3 className="text-base font-semibold text-foreground">
              Diplomatic AI Suggestions
            </h3>
          </div>
          <p className="mb-4 text-xs italic text-muted-foreground">
            &quot;AI recommendations based on Geopolitical Risk Assessment&quot;
          </p>
          <ul className="space-y-1">
            {logisticsPresentation.suggestions.map((suggestion) => {
              const Icon = suggestion.Icon
              return (
                <li
                  key={suggestion.id}
                  className="flex items-start gap-3 border-b border-border py-3 last:border-b-0"
                >
                  <Icon className="mt-0.5 size-4 shrink-0 text-neon-red" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {suggestion.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {suggestion.description}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-semibold ${suggestion.toneClass}`}
                  >
                    {suggestion.badge}
                  </span>
                </li>
              )
            })}
          </ul>
        </Panel>
      </div>
    </div>
  )
}