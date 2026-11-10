'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { FARMS as SEED, type FarmFeature } from '@/lib/data/farms'
import type { FarmsMeta } from '@/lib/data/farms-types'

const SEED_META: FarmsMeta = {
  total: Array.isArray(SEED.features) ? SEED.features.length : 0,
  seed: Array.isArray(SEED.features) ? SEED.features.length : 0,
  remote: 0,
  source: 'Base local',
  sourceUrl: '',
  syncedAt: '',
  live: false,
}

export type UseFarmsResult = {
  farms: FarmFeature[]
  meta: FarmsMeta
  loading: boolean
  error: string | null
  refresh: (token?: string) => Promise<boolean>
}

export function useFarms(): UseFarmsResult {
  const initial = Array.isArray(SEED.features) ? SEED.features : []

  const [farms, setFarms] = useState<FarmFeature[]>(initial)
  const [meta, setMeta] = useState<FarmsMeta>(SEED_META)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true

    fetch('/api/farms', { cache: 'no-store' })
      .then((response) => response.json())
      .then((body) => {
        if (!mounted.current) return
        if (!body || body.ok !== true) {
          setError(body?.error ?? 'resposta invalida')
          return
        }
        if (Array.isArray(body.features) && body.features.length) {
          setFarms(body.features)
          setMeta(body.meta as FarmsMeta)
        }
        setError(null)
      })
      .catch(() => {
        if (mounted.current) setError('API de fazendas indisponivel')
      })
      .finally(() => {
        if (mounted.current) setLoading(false)
      })

    return () => {
      mounted.current = false
    }
  }, [])

  const refresh = useCallback(async (token?: string) => {
    setLoading(true)

    try {
      const response = await fetch('/api/farms', {
        method: 'POST',
        headers: token ? { authorization: 'Bearer ' + token } : {},
      })

      const body = await response.json()

      if (!response.ok || body?.ok !== true) {
        setError(body?.error ?? 'falha ao sincronizar')
        return false
      }

      if (Array.isArray(body.meta?.source)) {
        setError(null)
        return true
      }

      const next = await fetch('/api/farms', { cache: 'no-store' }).then((r) => r.json())

      if (next?.ok === true && Array.isArray(next.features)) {
        setFarms(next.features)
        setMeta(next.meta as FarmsMeta)
      }

      setError(null)
      return true
    } catch {
      setError('falha ao sincronizar')
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  return { farms, meta, loading, error, refresh }
}
