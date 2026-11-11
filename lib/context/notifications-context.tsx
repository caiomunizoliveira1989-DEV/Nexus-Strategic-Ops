'use client'

import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { FARMS } from '@/lib/data/farms'
import {
  buildNotifications,
  type AppNotification,
} from '@/lib/services/notifications'

type NotificationsValue = {
  items: AppNotification[]
  count: number
}

const NotificationsContext = createContext<NotificationsValue | null>(null)

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const value = useMemo<NotificationsValue>(() => {
    const items = buildNotifications(FARMS)
    return { items, count: items.length }
  }, [])

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotifications(): NotificationsValue {
  const ctx = useContext(NotificationsContext)
  if (!ctx) {
    throw new Error('useNotifications precisa estar dentro de um NotificationsProvider')
  }
  return ctx
}
