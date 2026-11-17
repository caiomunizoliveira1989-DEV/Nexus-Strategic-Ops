import type { ReactNode } from 'react'
import { TopNav } from '@/components/dashboard/top-nav'
import { BottomNav } from '@/components/dashboard/bottom-nav'
import { ViewProvider } from '@/lib/context/view-context'
import { NotificationsProvider } from '@/lib/context/notifications-context'

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <ViewProvider>
      <NotificationsProvider>
        <div className="min-h-screen bg-background">
          <div
            className="pointer-events-none fixed inset-0 z-0 opacity-60"
            style={{
              background:
                'radial-gradient(900px 500px at 80% -10%, color-mix(in oklch, var(--neon-blue) 18%, transparent), transparent 60%), radial-gradient(700px 500px at 10% 110%, color-mix(in oklch, var(--neon-green) 12%, transparent), transparent 60%)',
            }}
          />
          <div className="relative z-10">
            <TopNav />
            <main className="mx-auto max-w-[112.5rem] px-4 py-6 pb-24 lg:px-6 lg:pb-6">
              {children}
            </main>
          </div>
          <BottomNav />
        </div>
      </NotificationsProvider>
    </ViewProvider>
  )
}