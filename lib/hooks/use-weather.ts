'use client'

import { useEffect, useState } from 'react'
import { fetchWeather, type WeatherSnapshot } from '@/lib/services/weather'

export function useWeather(lat: number, lng: number) {
  const [data, setData] = useState<WeatherSnapshot | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    setLoading(true)
    setError(null)

    fetchWeather(lat, lng)
      .then((snapshot) => {
        if (!cancelled) {
          setData(snapshot)
          setLoading(false)
        }
      })
      .catch((caught: unknown) => {
        if (!cancelled) {
          setError(caught instanceof Error ? caught.message : 'Erro no clima')
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [lat, lng])

  return { data, loading, error }
}
