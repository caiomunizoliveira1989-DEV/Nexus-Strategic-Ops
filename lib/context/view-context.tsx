'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type ViewId =
  | 'dashboard'
  | 'agriculture'
  | 'strategy'
  | 'compliance'
  | 'logistics'

type ViewContextValue = {
  active: ViewId
  setActive: (view: ViewId) => void
}

const ViewContext = createContext<ViewContextValue | null>(null)

export function ViewProvider({ children }: { children: ReactNode }) {
  const [active, setActiveState] = useState<ViewId>('dashboard')
  const setActive = useCallback((view: ViewId) => setActiveState(view), [])
  const value = useMemo(() => ({ active, setActive }), [active, setActive])
  return <ViewContext.Provider value={value}>{children}</ViewContext.Provider>
}

export function useView(): ViewContextValue {
  const ctx = useContext(ViewContext)
  if (!ctx) {
    throw new Error('useView precisa estar dentro de um ViewProvider')
  }
  return ctx
}
