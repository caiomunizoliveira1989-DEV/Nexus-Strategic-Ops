'use client'

import { useView } from '@/lib/context/view-context'
import { HomeView } from '@/components/dashboard/views/home-view'
import { AgricultureView } from '@/components/dashboard/views/agriculture-view'
import { StrategyView } from '@/components/dashboard/views/strategy-view'
import { ComplianceView } from '@/components/dashboard/views/compliance-view'
import { LogisticsView } from '@/components/dashboard/views/logistics-view'

export default function Page() {
  const { active } = useView()

  return (
    <div key={active} className="animate-view">
      {active === 'dashboard' && <HomeView />}
      {active === 'agriculture' && <AgricultureView />}
      {active === 'strategy' && <StrategyView />}
      {active === 'compliance' && <ComplianceView />}
      {active === 'logistics' && <LogisticsView />}
    </div>
  )
}
