'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

export type MapLocation = {
  lat: number
  lng: number
  label: string
}

const STORAGE_KEY = 'nexus.map.location'

const DEFAULT_LOCATION: MapLocation = {
  lat: -22.7253,
  lng: -47.6492,
  label: 'Piracicaba, SP',
}

type LocationContextValue = {
  location: MapLocation
  setLocation: (next: MapLocation) => void
  resetLocation: () => void
  isHydrated: boolean
}

const LocationContext = createContext<LocationContextValue | null>(null)

function readStored(): MapLocation {
  if (typeof window === 'undefined') return DEFAULT_LOCATION

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_LOCATION

    const parsed = JSON.parse(raw) as Partial<MapLocation>

    if (
      typeof parsed.lat !== 'number' ||
      typeof parsed.lng !== 'number' ||
      typeof parsed.label !== 'string'
    ) {
      return DEFAULT_LOCATION
    }

    return { lat: parsed.lat, lng: parsed.lng, label: parsed.label }
  } catch {
    return DEFAULT_LOCATION
  }
}

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocationState] = useState<MapLocation>(DEFAULT_LOCATION)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setLocationState(readStored())
    setIsHydrated(true)
  }, [])

  const setLocation = useCallback((next: MapLocation) => {
    setLocationState(next)

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      // localStorage indisponivel: segue apenas em memoria
    }
  }, [])

  const resetLocation = useCallback(() => {
    setLocationState(DEFAULT_LOCATION)

    try {
      window.localStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignora
    }
  }, [])

  const value = useMemo(
    () => ({ location, setLocation, resetLocation, isHydrated }),
    [location, setLocation, resetLocation, isHydrated],
  )

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  )
}

export function useLocation(): LocationContextValue {
  const context = useContext(LocationContext)

  if (!context) {
    throw new Error('useLocation precisa estar dentro de LocationProvider')
  }

  return context
}
