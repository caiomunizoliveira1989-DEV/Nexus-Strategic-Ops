export type DailyForecast = {
  date: string
  code: number
  max: number
  min: number
  precipitation: number
}

export type WeatherSnapshot = {
  temperature: number
  humidity: number
  windSpeed: number
  precipitation: number
  code: number
  daily: DailyForecast[]
  fetchedAt: string
}

const API = 'https://api.open-meteo.com/v1/forecast'

export async function fetchWeather(
  lat: number,
  lng: number,
): Promise<WeatherSnapshot> {
  const params = new URLSearchParams({
    latitude: lat.toFixed(4),
    longitude: lng.toFixed(4),
    current: 'temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation,weather_code',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum',
    timezone: 'auto',
    forecast_days: '5',
  })

  const response = await fetch(`${API}?${params.toString()}`)

  if (!response.ok) {
    throw new Error(`Open-Meteo respondeu ${response.status}`)
  }

  const data = (await response.json()) as {
    current?: Record<string, number>
    daily?: {
      time?: string[]
      weather_code?: number[]
      temperature_2m_max?: number[]
      temperature_2m_min?: number[]
      precipitation_sum?: number[]
    }
  }

  const current = data.current ?? {}
  const daily = data.daily ?? {}

  const dates = daily.time ?? []
  const codes = daily.weather_code ?? []
  const maxes = daily.temperature_2m_max ?? []
  const mins = daily.temperature_2m_min ?? []
  const rains = daily.precipitation_sum ?? []

  const forecast: DailyForecast[] = dates.map((date, index) => ({
    date,
    code: codes[index] ?? 0,
    max: maxes[index] ?? 0,
    min: mins[index] ?? 0,
    precipitation: rains[index] ?? 0,
  }))

  return {
    temperature: current.temperature_2m ?? 0,
    humidity: current.relative_humidity_2m ?? 0,
    windSpeed: current.wind_speed_10m ?? 0,
    precipitation: current.precipitation ?? 0,
    code: current.weather_code ?? 0,
    daily: forecast,
    fetchedAt: new Date().toISOString(),
  }
}

export function describeWeather(code: number): string {
  if (code === 0) return 'Ceu limpo'
  if (code <= 2) return 'Parcialmente nublado'
  if (code === 3) return 'Nublado'
  if (code <= 48) return 'Nevoeiro'
  if (code <= 57) return 'Garoa'
  if (code <= 67) return 'Chuva'
  if (code <= 77) return 'Neve'
  if (code <= 82) return 'Pancadas de chuva'
  if (code <= 86) return 'Pancadas de neve'
  return 'Tempestade'
}
