import type { WeatherSnapshot } from './weather'

export type Severity = 'high' | 'medium' | 'low'

export type AlertCode =
  | 'storm'
  | 'rain'
  | 'windHigh'
  | 'windMedium'
  | 'fungus'
  | 'drought'
  | 'soilLow'
  | 'stable'

export type FeedCode = 'sync' | 'forecast' | 'rain' | 'wind' | 'ndvi'

export type AgriAlert = {
  id: string
  code: AlertCode
  severity: Severity
  source: string
  value: number
}

export type FeedEvent = {
  id: string
  code: FeedCode
  minutesAgo: number
  value?: number
  temp?: number
  humidity?: number
  days?: number
  time?: string
}

export type AgricultureDerived = {
  soilMoisture: number
  cropHealth: number
  ndvi: number
  pestRisk: Severity
  alerts: AgriAlert[]
  feed: FeedEvent[]
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function deriveAgriculture(
  snapshot: WeatherSnapshot,
): AgricultureDerived {
  const humidity = snapshot.humidity
  const wind = snapshot.windSpeed
  const rain = snapshot.precipitation
  const code = snapshot.code
  const temp = snapshot.temperature

  const soilMoisture = Math.round(clamp(humidity * 0.6 + rain * 8, 0, 100))

  const cropHealth = Math.round(
    clamp(
      100 - Math.abs(humidity - 65) * 0.8 - Math.max(0, rain - 20),
      0,
      100,
    ),
  )

  const ndvi = Number(clamp(0.3 + (cropHealth / 100) * 0.6, 0, 1).toFixed(2))

  const pestRisk: Severity =
    humidity > 80 ? 'high' : humidity > 60 ? 'medium' : 'low'

  const alerts: AgriAlert[] = []

  if (code >= 80 || rain >= 10) {
    alerts.push({
      id: 'storm',
      code: 'storm',
      severity: 'high',
      source: 'INMET',
      value: Number(rain.toFixed(1)),
    })
  } else if (code >= 61 || rain >= 2) {
    alerts.push({
      id: 'rain',
      code: 'rain',
      severity: 'medium',
      source: 'INMET',
      value: Number(rain.toFixed(1)),
    })
  }

  if (wind >= 40) {
    alerts.push({
      id: 'wind-high',
      code: 'windHigh',
      severity: 'high',
      source: 'INMET',
      value: Math.round(wind),
    })
  } else if (wind >= 25) {
    alerts.push({
      id: 'wind-medium',
      code: 'windMedium',
      severity: 'medium',
      source: 'INMET',
      value: Math.round(wind),
    })
  }

  if (humidity >= 85) {
    alerts.push({
      id: 'fungus',
      code: 'fungus',
      severity: 'medium',
      source: 'Embrapa',
      value: Math.round(humidity),
    })
  }

  if (humidity <= 35 && rain === 0) {
    alerts.push({
      id: 'drought',
      code: 'drought',
      severity: 'medium',
      source: 'INMET',
      value: Math.round(humidity),
    })
  }

  if (soilMoisture < 30) {
    alerts.push({
      id: 'soil-low',
      code: 'soilLow',
      severity: 'low',
      source: 'CEMADEN',
      value: soilMoisture,
    })
  }

  if (alerts.length === 0) {
    alerts.push({
      id: 'stable',
      code: 'stable',
      severity: 'low',
      source: 'INMET',
      value: 0,
    })
  }

  const now = new Date()
  const clock = `${String(now.getHours()).padStart(2, '0')}:${String(
    now.getMinutes(),
  ).padStart(2, '0')}`

  const feed: FeedEvent[] = [
    {
      id: 'sync',
      code: 'sync',
      minutesAgo: 0,
      temp: Math.round(temp),
      humidity: Math.round(humidity),
    },
    {
      id: 'forecast',
      code: 'forecast',
      minutesAgo: 2,
      days: snapshot.daily.length,
    },
  ]

  if (rain > 0) {
    feed.push({
      id: 'rain',
      code: 'rain',
      minutesAgo: 6,
      value: Number(rain.toFixed(1)),
    })
  }

  if (wind > 0) {
    feed.push({
      id: 'wind',
      code: 'wind',
      minutesAgo: 9,
      value: Math.round(wind),
      time: clock,
    })
  }

  feed.push({
    id: 'ndvi',
    code: 'ndvi',
    minutesAgo: 14,
    value: ndvi,
  })

  return { soilMoisture, cropHealth, ndvi, pestRisk, alerts, feed }
}
