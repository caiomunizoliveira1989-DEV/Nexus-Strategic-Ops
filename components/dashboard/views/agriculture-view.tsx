'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic' // CORREÇÃO 1: Importação do dynamic adicionada
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  type TooltipContentProps,
  XAxis,
  YAxis,
} from 'recharts'
import {
  Activity,
  AlertTriangle,
  Bug,
  CheckCircle2,
  Cloud,
  CloudRain,
  Droplets,
  Leaf,
  Satellite,
  Sun,
  TrendingUp,
  Wind,
  type LucideIcon,
} from 'lucide-react'
import { Panel } from '@/components/dashboard/panel'
import type {
  ActivityFeedItem,
  AgricultureKpi,
  FieldAlert,
  WeatherSnapshot,
  YieldForecast,
} from '@/lib/entities/agri-telemetry'
import type {
  ActivityDisplay,
  ActivityVisual,
  AlertDisplay,
  AlertVisual,
  KpiDisplay,
  KpiVisual,
  YieldForecastDisplay,
} from '@/lib/entities/agri-presentation'
import {
  MOCK_ACTIVITY,
  MOCK_ALERTS,
  MOCK_KPIS,
  MOCK_LOCATION,
  MOCK_PLOTS,
  MOCK_WEATHER,
  MOCK_YIELDS,
} from '@/lib/mock/agriculture'

const RealMap = dynamic(
  () => import('@/components/RealMap').then((mod) => mod.RealMap),
  { ssr: false }
);

type Tone = 'blue' | 'green' | 'red' | 'amber'

const toneStyles: Record<
  Tone,
  { dot: string; ring: string; text: string; chip: string; shadow: string }
> = {
  blue: {
    dot: 'bg-neon-blue',
    ring: 'bg-neon-blue/60',
    text: 'text-neon-blue',
    chip: 'border-neon-blue/40 bg-neon-blue/10',
    shadow: 'drop-shadow-[0_0_10px_var(--neon-blue)]',
  },
  green: {
    dot: 'bg-neon-green',
    ring: 'bg-neon-green/60',
    text: 'text-neon-green',
    chip: 'border-neon-green/40 bg-neon-green/10',
    shadow: 'drop-shadow-[0_0_10px_var(--neon-green)]',
  },
  red: {
    dot: 'bg-neon-red',
    ring: 'bg-neon-red/60',
    text: 'text-neon-red',
    chip: 'border-neon-red/40 bg-neon-red/10',
    shadow: 'drop-shadow-[0_0_10px_var(--neon-red)]',
  },
  amber: {
    dot: 'bg-neon-amber',
    ring: 'bg-neon-amber/60',
    text: 'text-neon-amber',
    chip: 'border-neon-amber/40 bg-neon-amber/10',
    shadow: 'drop-shadow-[0_0_10px_var(--neon-amber)]',
  },
}

const KPI_VISUALS: Record<string, KpiVisual> = {
  'soil-moisture': {
    icon: 'droplets',
    accent: 'blue',
    sparkline: [38, 41, 39, 44, 42, 46, 43, 45],
  },
  'crop-health-index': {
    icon: 'leaf',
    accent: 'green',
    sparkline: [88, 90, 89, 91, 92, 93, 93, 94],
  },
  'active-weather-alerts': {
    icon: 'alert-triangle',
    accent: 'amber',
    sparkline: [1, 1, 2, 2, 1, 2, 3, 3],
  },
  'pest-risk-zones': {
    icon: 'bug',
    accent: 'red',
    sparkline: [0, 1, 1, 1, 2, 1, 2, 2],
  },
}

const ACTIVITY_VISUALS: Record<string, ActivityVisual> = {
  pest_detection: { icon: 'bug', accent: 'red' },
  irrigation: { icon: 'droplets', accent: 'blue' },
  ndvi_recalc: { icon: 'leaf', accent: 'green' },
  weather: { icon: 'cloud-rain', accent: 'amber' },
  inspection: { icon: 'check-circle', accent: 'green' },
}

const ALERT_VISUALS: Record<string, AlertVisual> = {
  low: { icon: 'droplets', accent: 'blue' },
  medium: { icon: 'cloud-rain', accent: 'amber' },
  high: { icon: 'bug', accent: 'red' },
  critical: { icon: 'bug', accent: 'red' },
}

const VISUAL_ICONS: Record<string, LucideIcon> = {
  droplets: Droplets,
  leaf: Leaf,
  'alert-triangle': AlertTriangle,
  bug: Bug,
  'cloud-rain': CloudRain,
  'check-circle': CheckCircle2,
}

const ACTIVITY_REFERENCE_TIME =
  Math.max(...MOCK_ACTIVITY.map((item) => Date.parse(item.occurredAt))) + 2 * 60 * 1000

function toKpiDisplay(kpi: AgricultureKpi, visual: KpiVisual): KpiDisplay {
  const isPositiveMetric =
    kpi.id === 'soil-moisture' || kpi.id === 'crop-health-index'

  return {
    id: kpi.id,
    label: kpi.label,
    valueLabel: `${kpi.trend.value}${kpi.unit ?? ''}`,
    deltaLabel: kpi.trend.deltaLabel,
    deltaDirection: isPositiveMetric
      ? 'up'
      : kpi.trend.deltaPct === 0
        ? 'flat'
        : 'down',
    visual,
  }
}

function toActivityDisplay(
  item: ActivityFeedItem,
  visual: ActivityVisual,
): ActivityDisplay {
  const elapsedMinutes = Math.max(
    0,
    Math.floor((ACTIVITY_REFERENCE_TIME - Date.parse(item.occurredAt)) / 60_000),
  )

  return {
    id: item.id,
    title: item.title,
    description: item.description,
    timeLabel: `${elapsedMinutes}m ago`,
    visual,
  }
}

function toAlertDisplay(alert: FieldAlert, visual: AlertVisual): AlertDisplay {
  return {
    id: alert.id,
    title: alert.title,
    description: alert.description,
    severityLabel:
      alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1),
    visual,
  }
}

function getAlertAreaLabel(plotId: string): string {
  const plot = MOCK_PLOTS.find((item) => item.id === plotId)
  if (!plot) {
    throw new Error(`No plot found for alert plot ID "${plotId}"`)
  }
  return plot.name
}

function toRelativeTimeLabel(timestamp: string, referenceTime: number): string {
  const elapsedMinutes = Math.max(
    0,
    Math.floor((referenceTime - Date.parse(timestamp)) / 60_000),
  )

  if (elapsedMinutes < 60) return `${elapsedMinutes}m ago`

  const elapsedHours = Math.floor(elapsedMinutes / 60)
  if (elapsedHours < 24) return `${elapsedHours}h ago`

  return `${Math.floor(elapsedHours / 24)}d ago`
}

function toYieldDisplay(forecast: YieldForecast): YieldForecastDisplay {
  return {
    id: forecast.id,
    plotId: forecast.plotId,
    cropLabel: forecast.crop,
    expectedLabel: `${forecast.expectedTons.toFixed(1)} t/ha`,
    confidenceLabel: `${forecast.confidencePct}%`,
    windowLabel: new Date(`${forecast.harvestWindow}-01T00:00:00`).toLocaleDateString(
      'en-US',
      { month: 'short', year: 'numeric' },
    ),
  }
}

const kpis = MOCK_KPIS.map((k) => toKpiDisplay(k, KPI_VISUALS[k.id]))
const activities = MOCK_ACTIVITY.map((a) =>
  toActivityDisplay(a, ACTIVITY_VISUALS[a.type]),
)
const ALERT_REFERENCE_TIME =
  Math.max(...MOCK_ALERTS.map((alert) => Date.parse(alert.detectedAt))) +
  2 * 60 * 1000
const alerts = MOCK_ALERTS.map((al) =>
  ({
    ...toAlertDisplay(al, ALERT_VISUALS[al.severity]),
    areaLabel: getAlertAreaLabel(al.plotId),
    timeLabel: toRelativeTimeLabel(al.detectedAt, ALERT_REFERENCE_TIME),
  }),
)
const yields = MOCK_YIELDS.map((forecast) => toYieldDisplay(forecast))

/* ---------------- Map markers ---------------- */

type Marker = {
  id: string
  label: string
  value: string
  detail: string
  tone: Tone
  Icon: typeof Droplets
  top: string
  left: string
}

const AGRICULTURE_MARKERS: Marker[] = [
  {
    id: 'soil',
    label: 'Soil Moisture',
    value: '42%',
    detail: 'Plot 3A · Optimal',
    tone: 'blue',
    Icon: Droplets,
    top: '34%',
    left: '24%',
  },
  {
    id: 'ndvi',
    label: 'NDVI Index',
    value: '0.81',
    detail: 'Plot 1B · Vigorous canopy',
    tone: 'green',
    Icon: Leaf,
    top: '58%',
    left: '52%',
  },
  {
    id: 'pest',
    label: 'Pest Risk',
    value: 'High',
    detail: 'Plot 4B · Action needed',
    tone: 'red',
    Icon: Bug,
    top: '40%',
    left: '72%',
  },
]

/* ---------------- Yield prediction vs historical ---------------- */

type YieldDataPoint = {
  month: string
  historical: number
  predicted: number
}

const AGRICULTURE_YIELD_DATA: YieldDataPoint[] = [
  { month: 'Mar', historical: 3.2, predicted: 3.4 },
  { month: 'Apr', historical: 4.1, predicted: 4.6 },
  { month: 'May', historical: 4.8, predicted: 5.5 },
  { month: 'Jun', historical: 5.6, predicted: 6.4 },
  { month: 'Jul', historical: 7.2, predicted: 8.1 },
  { month: 'Aug', historical: 8.4, predicted: 9.6 },
  { month: 'Sep', historical: 9.1, predicted: 10.4 },
]

const AGRICULTURE_YIELD_CHART_DATA = AGRICULTURE_YIELD_DATA.map((point) => {
  const forecast = yields.find((item) => item.windowLabel.startsWith(point.month))
  return forecast
    ? { ...point, predicted: Number(forecast.expectedLabel.split(' ')[0]) }
    : point
})

/* ---------------- Activity feed / alerts ---------------- */

/* ---------------- Weather (Open-Meteo) ---------------- */

type WeatherLocation = {
  latitude: number
  longitude: number
  city: string
  country: string
}

const AGRICULTURE_WEATHER_LOCATION: WeatherLocation = {
  latitude: -23.55,
  longitude: -46.63,
  city: MOCK_WEATHER.city,
  country: MOCK_WEATHER.country,
}

type OpenMeteoResponse = {
  current: {
    time: string
    temperature_2m: number
    relative_humidity_2m: number
    weather_code: number
    wind_speed_10m: number
  }
  daily: {
    time: string[]
    weather_code: number[]
    temperature_2m_max: number[]
    precipitation_probability_max: number[]
  }
}

type ForecastDay = {
  day: string
  Icon: typeof Sun
  temp: string
  rain: string
  tone: Tone
}

function weatherCodeToCondition(code: number): string {
  if (code === 0) return 'Ensolarado'
  if (code <= 3) return 'Parcialmente nublado'
  if (code <= 48) return 'Neblina'
  if (code <= 55) return 'Garoa'
  if (code <= 65) return 'Chuvoso'
  if (code <= 75) return 'Neve'
  if (code <= 82) return 'Pancadas de chuva'
  if (code <= 99) return 'Tempestade'
  return 'Indefinido'
}

function weatherCodeToIcon(code: number): typeof Sun {
  if (code === 0) return Sun
  if (code <= 3) return Cloud
  if (code <= 48) return Cloud
  if (code <= 82) return CloudRain
  return CloudRain
}

function weatherCodeToTone(code: number): Tone {
  if (code === 0) return 'green'
  if (code <= 3) return 'green'
  if (code <= 65) return 'blue'
  return 'amber'
}

function formatForecastDays(daily: OpenMeteoResponse['daily']): ForecastDay[] {
  const today = new Date().toLocaleDateString('pt-BR')

  return daily.time.slice(0, 5).map((dateStr, index) => {
    const date = new Date(`${dateStr}T12:00:00`)
    const dayLabel =
      date.toLocaleDateString('pt-BR') === today
        ? 'Hoje'
        : date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')

    return {
      day: dayLabel.charAt(0).toUpperCase() + dayLabel.slice(1),
      Icon: weatherCodeToIcon(daily.weather_code[index]),
      temp: `${Math.round(daily.temperature_2m_max[index])}°`,
      rain: `${daily.precipitation_probability_max[index] ?? 0}%`,
      tone: weatherCodeToTone(daily.weather_code[index]),
    }
  })
}

type ChartTooltipProps = {
  active?: boolean
  payload?: TooltipContentProps<number, string>['payload']
  label?: TooltipContentProps<number, string>['label']
}

function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-popover/95 px-3 py-2 text-xs shadow-lg backdrop-blur-md">
      <p className="mb-1 font-semibold text-foreground">{label}</p>
      {payload.map((p, index) => (
        <p key={p.name ?? index} className="flex items-center gap-2 text-muted-foreground">
          <span
            className="size-2 rounded-full"
            style={{ background: p.color || p.stroke || p.fill }}
          />
          {p.name}: <span className="font-semibold text-foreground">{p.value} t/ha</span>
        </p>
      ))}
    </div>
  )
}

export function AgricultureView() {
  const [active, setActive] = useState<string>('ndvi')
  
  // CORREÇÃO 2: Inicia como null para evitar erro de hidratação no servidor do Vercel
  const [now, setNow] = useState<Date | null>(null)
  
  const [weather, setWeather] = useState<OpenMeteoResponse | null>(null)
  const [weatherSnapshot, setWeatherSnapshot] = useState<WeatherSnapshot | null>(
    MOCK_WEATHER,
  )
  const [weatherLoading, setWeatherLoading] = useState(true)
  const [weatherError, setWeatherError] = useState<string | null>(null)

  useEffect(() => {
    // CORREÇÃO 2: Define a data apenas quando o componente é montado no cliente
    setNow(new Date())
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    async function fetchWeather() {
      setWeatherLoading(true)
      setWeatherError(null)

      try {
        const params = new URLSearchParams({
          latitude: String(AGRICULTURE_WEATHER_LOCATION.latitude),
          longitude: String(AGRICULTURE_WEATHER_LOCATION.longitude),
          current: 'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m',
          daily: 'weather_code,temperature_2m_max,precipitation_probability_max',
          timezone: 'America/Sao_Paulo',
          forecast_days: '5',
        })

        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?${params.toString()}`,
          { signal: controller.signal },
        )

        if (!response.ok) {
          throw new Error('Failed to fetch weather data')
        }

        const data: OpenMeteoResponse = await response.json()
        setWeather(data)
        setWeatherSnapshot({
          city: AGRICULTURE_WEATHER_LOCATION.city,
          country: AGRICULTURE_WEATHER_LOCATION.country,
          observedAt: data.current.time,
          temperatureC: data.current.temperature_2m,
          condition: weatherCodeToCondition(data.current.weather_code),
        })
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return
        setWeatherError('Unable to load weather data')
      } finally {
        setWeatherLoading(false)
      }
    }

    fetchWeather()
    return () => controller.abort()
  }, [])

  const currentWeatherCode = weather?.current.weather_code ?? 0
  const CurrentWeatherIcon = weatherCodeToIcon(currentWeatherCode)
  const forecast = weather ? formatForecastDays(weather.daily) : []

  // CORREÇÃO 2: Só formata a data se `now` não for null
  const formattedDate = now ? now.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }) : 'Carregando...'
  
  const formattedTime = now ? now.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }) : '--:--:--'

  return (
    <div className="space-y-6">
      {/* Linha de KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => {
          const s = toneStyles[k.visual.accent]
          const Icon = VISUAL_ICONS[k.visual.icon]
          const data = k.visual.sparkline.map((v, i) => ({ i, v }))
          return (
            <Panel key={k.label} className="p-4">
              <div className="flex items-start justify-between">
                <span
                  className={`flex size-10 items-center justify-center rounded-xl border ${s.chip}`}
                >
                  <Icon className={`size-5 ${s.text}`} />
                </span>
                <span
                  className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                    k.deltaDirection === 'up'
                      ? 'bg-neon-green/10 text-neon-green'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {k.deltaDirection === 'up' && <TrendingUp className="size-3" />}
                  {k.deltaLabel}
                </span>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">{k.label}</p>
              <div className="flex items-end justify-between gap-2">
                <p className="text-2xl font-bold text-foreground">
                  {k.valueLabel.endsWith('%') ? k.valueLabel.slice(0, -1) : k.valueLabel}
                  {k.valueLabel.endsWith('%') && (
                    <span className="ml-0.5 text-sm font-medium text-muted-foreground">
                      %
                    </span>
                  )}
                </p>
                <div className="h-9 w-20">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                      <defs>
                        <linearGradient
                          id={`spark-${k.label}`}
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor={`var(--neon-${k.visual.accent})`}
                            stopOpacity={0.5}
                          />
                          <stop
                            offset="100%"
                            stopColor={`var(--neon-${k.visual.accent})`}
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <Area
                        type="monotone"
                        dataKey="v"
                        stroke={`var(--neon-${k.visual.accent})`}
                        fill={`url(#spark-${k.label})`}
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Panel>
          )
        })}
      </div>

      {/* Mapa principal + painel lateral */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Panel className="overflow-hidden p-0">
            {/* Cabeçalho do mapa */}
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <Satellite className="size-5 text-neon-green" />
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    {`Crop Monitoring · ${MOCK_LOCATION.farmName}`}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {`${MOCK_LOCATION.city}, ${MOCK_LOCATION.state} · ${Math.abs(MOCK_LOCATION.latitude).toFixed(2)}° S, ${Math.abs(MOCK_LOCATION.longitude).toFixed(2)}° W`}
                  </p>
                </div>
              </div>
              <span className="flex items-center gap-1.5 rounded-full border border-neon-red/40 bg-neon-red/10 px-2.5 py-1 text-xs font-semibold text-neon-red">
                <span className="size-2 rounded-full bg-neon-red animate-live" />
                LIVE
              </span>
            </div>

            <RealMap className="aspect-[16/10] w-full min-h-[320px] border-0" />

            {/* Legenda selecionável */}
            <div className="grid grid-cols-3 gap-px bg-border">
              {AGRICULTURE_MARKERS.map((m) => {
                const s = toneStyles[m.tone]
                const isActive = active === m.id
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setActive(m.id)}
                    className={`flex items-center gap-3 bg-card px-4 py-3 text-left transition-colors hover:bg-accent ${
                      isActive ? 'bg-accent' : ''
                    }`}
                  >
                    <span
                      className={`flex size-9 shrink-0 items-center justify-center rounded-lg border ${s.chip}`}
                    >
                      <m.Icon className={`size-4 ${s.text}`} />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-xs text-muted-foreground">
                        {m.label}
                      </span>
                      <span className={`block text-base font-bold ${s.text}`}>
                        {m.value}
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>
          </Panel>
        </div>

        {/* Painel lateral: Activity Feed / Recent Alerts */}
        <div className="space-y-6">
          <Panel className="flex flex-col">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-base font-semibold text-foreground">
                <Activity className="size-4 text-neon-green" />
                Activity Feed
              </h3>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-neon-green">
                <span className="size-2 rounded-full bg-neon-green animate-live" />
                Live
              </span>
            </div>

            <div className="relative space-y-4 pl-1">
              {/* Linha do tempo */}
              <span className="absolute left-[15px] top-2 bottom-2 w-px bg-border" />
              {activities.map((f) => {
                const s = toneStyles[f.visual.accent]
                const Icon = VISUAL_ICONS[f.visual.icon]
                return (
                  <div key={f.id} className="relative flex gap-3">
                    <span
                      className={`relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full border ${s.chip}`}
                    >
                      <Icon className={`size-3.5 ${s.text}`} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-foreground">
                          {f.title}
                        </p>
                        <span className="shrink-0 text-[10px] text-muted-foreground">
                          {f.timeLabel}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{f.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            <button
              type="button"
              className="mt-4 w-full rounded-lg border border-border py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-neon-green/50 hover:text-neon-green"
            >
              View all activity
            </button>
          </Panel>

          <Panel className="flex flex-col">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-base font-semibold text-foreground">
                <AlertTriangle className="size-4 text-neon-amber" />
                Alertas
              </h3>
            </div>

            <div className="max-h-64 space-y-4 overflow-y-auto pr-1">
              {alerts.map((alert) => {
                const s = toneStyles[alert.visual.accent]
                const Icon = VISUAL_ICONS[alert.visual.icon]
                return (
                  <div key={alert.id} className="flex gap-3">
                    <span
                      className={`flex size-7 shrink-0 items-center justify-center rounded-full border ${s.chip}`}
                    >
                      <Icon className={`size-3.5 ${s.text}`} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-foreground">
                          {alert.title}
                        </p>
                        <span className="shrink-0 text-[10px] text-muted-foreground">
                          {alert.timeLabel}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {alert.areaLabel}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {alert.severityLabel}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </Panel>

          {/* Previsão do tempo */}
          <Panel>
            <div className="mb-3 flex items-start justify-between gap-3">
              <h3 className="flex items-center gap-2 text-base font-semibold text-foreground">
                <Cloud className="size-4 text-neon-blue" />
                Weather Forecast
              </h3>
              <div className="text-right">
                <p className="text-xs font-medium text-muted-foreground">
                  {weatherSnapshot
                    ? `${weatherSnapshot.city}, ${weatherSnapshot.country}`
                    : `${AGRICULTURE_WEATHER_LOCATION.city}, ${AGRICULTURE_WEATHER_LOCATION.country}`}
                </p>
                <p className="text-[11px] capitalize text-muted-foreground">
                  {formattedDate}
                </p>
                <p className="font-mono text-sm font-semibold tabular-nums text-foreground" suppressHydrationWarning>
                  {formattedTime}
                </p>
              </div>
            </div>

            <div className="mb-4 flex items-center justify-between rounded-xl border border-neon-blue/30 bg-neon-blue/5 p-3">
              <div className="flex items-center gap-3">
                <CurrentWeatherIcon className="size-8 text-neon-amber drop-shadow-[0_0_10px_var(--neon-amber)]" />
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {weatherLoading
                      ? '—'
                      : weatherError
                        ? '—'
                        : `${Math.round(weatherSnapshot?.temperatureC || 0)}°C`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {weatherLoading
                      ? 'Carregando...'
                      : weatherError
                        ? weatherError
                        : weatherSnapshot?.condition ?? weatherCodeToCondition(currentWeatherCode)}
                  </p>
                </div>
              </div>
              <div className="space-y-1 text-right text-xs text-muted-foreground">
                <p className="flex items-center justify-end gap-1.5">
                  <Droplets className="size-3.5 text-neon-blue" /> Umidade{' '}
                  {weatherLoading || weatherError || !weather
                    ? '—'
                    : `${weather.current.relative_humidity_2m}%`}
                </p>
                <p className="flex items-center justify-end gap-1.5">
                  <Wind className="size-3.5 text-neon-cyan" /> Vento{' '}
                  {weatherLoading || weatherError || !weather
                    ? '—'
                    : `${Math.round(weather.current.wind_speed_10m)} km/h`}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-1">
              {weatherLoading
                ? Array.from({ length: 5 }).map((_, index) => (
                    <div
                      key={index}
                      className="flex flex-col items-center gap-1 rounded-lg border border-border bg-card/60 py-2"
                    >
                      <span className="text-[10px] text-muted-foreground">—</span>
                      <Cloud className="size-4 text-muted-foreground" />
                      <span className="text-xs font-semibold text-muted-foreground">
                        —
                      </span>
                      <span className="text-[10px] text-muted-foreground">—</span>
                    </div>
                  ))
                : forecast.map((d) => {
                    const s = toneStyles[d.tone]
                    return (
                      <div
                        key={d.day}
                        className="flex flex-col items-center gap-1 rounded-lg border border-border bg-card/60 py-2"
                      >
                        <span className="text-[10px] text-muted-foreground">
                          {d.day}
                        </span>
                        <d.Icon className={`size-4 ${s.text}`} />
                        <span className="text-xs font-semibold text-foreground">
                          {d.temp}
                        </span>
                        <span className="text-[10px] text-neon-blue">{d.rain}</span>
                      </div>
                    )
                  })}
            </div>
          </Panel>
        </div>
      </div>

      {/* Gráfico: Previsão de Safra vs Histórico */}
      <Panel>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-foreground">
              Yield Prediction vs. Historical Data
            </h3>
            <p className="text-xs text-muted-foreground">
              Maize · tons per hectare · 2024 season
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span className="size-2.5 rounded-sm bg-neon-blue" /> Historical
            </span>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span className="size-2.5 rounded-full bg-neon-green" /> Predicted
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={AGRICULTURE_YIELD_CHART_DATA}
              margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
            >
              <defs>
                <linearGradient id="predArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--neon-green)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--neon-green)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border)"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                unit="t"
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'var(--accent)', opacity: 0.4 }} />
              <Bar
                dataKey="historical"
                name="Historical"
                radius={[4, 4, 0, 0]}
                barSize={22}
              >
                {AGRICULTURE_YIELD_CHART_DATA.map((_, i) => (
                  <Cell key={i} fill="var(--neon-blue)" fillOpacity={0.55} />
                ))}
              </Bar>
              <Area
                type="monotone"
                dataKey="predicted"
                name="Predicted"
                stroke="var(--neon-green)"
                fill="url(#predArea)"
                strokeWidth={2.5}
                dot={{ r: 3, fill: 'var(--neon-green)' }}
                activeDot={{ r: 5 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </Panel>
    </div>
  )
}
