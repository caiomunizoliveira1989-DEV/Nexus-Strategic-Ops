'use client'

import { useMemo } from 'react'
import { useLocation } from '@/lib/context/location-context'
import { useWeather } from '@/lib/hooks/use-weather'
import {
  deriveAgriculture,
  type AgricultureDerived,
} from '@/lib/services/agriculture-derived'
import type { WeatherSnapshot } from '@/lib/services/weather'

export function useAgricultureData() {
  const { location, setLocation, isHydrated } = useLocation()
  const { data, loading, error } = useWeather(location.lat, location.lng)

  const derived: AgricultureDerived | null = useMemo(
    () => (data ? deriveAgriculture(data) : null),
    [data],
  )

  return {
    location,
    setLocation,
    isHydrated,
    weather: data as WeatherSnapshot | null,
    derived,
    loading,
    error,
  }
}
