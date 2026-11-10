import type { LogisticsDashboardData } from '@/lib/entities/logistics'

export const MOCK_LOGISTICS: LogisticsDashboardData = {
  header: {
    presenterName: 'Sarah Chen',
  },
  map: {
    imageSrc: '/world-dark.png',
    imageAlt: 'Mapa-múndi de logística global',
    activeRoutes: [
      'M180 250 Q320 150 520 175 T860 230',
      'M180 250 Q300 320 520 215 T880 300',
      'M520 175 Q700 120 860 230',
    ],
    alternativeRoute:
      'M540 175 Q560 320 540 420 Q520 460 560 440 Q760 360 800 220',
    conflicts: [
      { id: 'suez', label: 'Suez', x: 540, y: 175 },
      { id: 'yemen', label: 'Yemen', x: 560, y: 215 },
      { id: 'taiwan-strait', label: 'Taiwan Strait', x: 790, y: 195 },
    ],
  },
  weather: {
    title: 'Weather Alerts',
    summary: 'Cyclone warning in Pacific, heavy storms near India',
    rows: [
      { label: 'Detailed', value: '15-21°', tone: 'default' },
      { label: 'Cyclone warning', value: '38°', tone: 'default' },
      { label: 'Deaning', value: '13°', tone: 'default' },
      { label: 'Storms', value: '15 rm', tone: 'default' },
      { label: 'India', value: 'Nearstorna', tone: 'cyan' },
      { label: 'Storms', value: 'North r/a', tone: 'default' },
    ],
    legend: [
      { label: 'Conflict Zones', value: 'Red', tone: 'red' },
      { label: 'Safe alternative route', value: 'Risk', tone: 'amber' },
      { label: 'Diplomatic alerts', value: 'Alerts', tone: 'amber' },
      { label: 'Compliance updates', value: 'Red', tone: 'red' },
      { label: 'Active ships (alt)', value: 'Orange', tone: 'amber' },
      { label: 'Active ships', value: 'Blue', tone: 'cyan' },
    ],
  },
  ships: [
    { id: 'polaris-1', name: 'Polaris (Hkg-Rot)', eta: '12d 6h', status: 'en_route' },
    { id: 'challenger-1', name: 'Challenger (LA-Sgp)', eta: '19d 1h', status: 'conflict_zone' },
    { id: 'rumatun-1', name: 'Rumatun (HK-Sgp)', eta: '12d 19h', status: 'en_route' },
    { id: 'challenger-2', name: 'Challenger (LA-Sgp)', eta: '19d 19h', status: 'conflict_zone' },
    { id: 'paria-1', name: 'Paria (Hkg-Rot)', eta: '12d 6h', status: 'en_route' },
  ],
  suggestions: [
    {
      id: 'rerouting-cape',
      kind: 'rerouting',
      title: 'Rerouting needed via Cape of Good Hope',
      description: 'Rerouting needed via Cape of Good Hope.',
      badge: 'Needed',
      tone: 'red',
    },
    {
      id: 'diplomatic-alerts',
      kind: 'diplomatic_alert',
      title: 'Diplomatic alerts',
      description: 'Rerouting alerts for via Cape of Good Hope.',
      badge: 'Alerts',
      tone: 'amber',
    },
    {
      id: 'compliance-updates',
      kind: 'compliance_update',
      title: 'Compliance updates',
      description:
        'Compliance updates with risk levels and recommended actions.',
      badge: 'Medium',
      tone: 'amber',
    },
    {
      id: 'risk-levels',
      kind: 'risk_levels',
      title: 'Compliance updates',
      description: 'Risk levels and recommended actions.',
      badge: 'Levels',
      tone: 'amber',
    },
  ],
}