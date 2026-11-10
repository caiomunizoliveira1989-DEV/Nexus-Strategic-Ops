import type { ComplianceDashboardData } from '@/lib/entities/compliance'

export const MOCK_COMPLIANCE: ComplianceDashboardData = {
  header: {
    presenterName: 'Sarah Chen',
  },
  map: {
    name: 'Amazon Forest Reserve - Area A',
    boundaryLabel: 'Boundary Map',
    coordinates: '3.46 S, 60.01 W',
    imageSrc: '/amazon-satellite.png',
    imageAlt: 'Imagem de satélite da Reserva Florestal Amazônica - Área A',
    boundaryPath:
      'M150 70 L250 90 L270 200 L230 280 L255 360 L200 440 L150 400 L130 300 L100 220 L120 140 Z',
  },
  checklist: {
    sectionTitle: 'Regulatory Compliance',
    completionPct: 75,
    items: [
      {
        id: 'environmental-permit',
        title: 'Environmental Permit #3411',
        status: 'verified',
        verifiedAt: null,
      },
      {
        id: 'land-use-certification',
        title: 'Land Use Certification',
        status: 'pending',
        verifiedAt: null,
      },
      {
        id: 'deforestation-monitoring',
        title: 'Deforestation Monitoring',
        status: 'verified',
        verifiedAt: '2023-01-14T00:00:00.000Z',
      },
      {
        id: 'water-usage-reports',
        title: 'Water Usage Reports',
        status: 'pending',
        verifiedAt: '2023-01-08T00:00:00.000Z',
      },
      {
        id: 'legal-documentation',
        title: 'Legal Documentation',
        status: 'verified',
        verifiedAt: null,
      },
    ],
  },
  carbon: {
    growthPct: 12.5,
    currentBalanceTons: 1450,
    points: [
      { monthLabel: 'Jan', balanceTons: 250 },
      { monthLabel: 'Feb', balanceTons: 420 },
      { monthLabel: 'Mar', balanceTons: 360 },
      { monthLabel: 'Apr', balanceTons: 520 },
      { monthLabel: 'May', balanceTons: 700 },
      { monthLabel: 'Jun', balanceTons: 760 },
      { monthLabel: 'Jul', balanceTons: 950 },
      { monthLabel: 'Aug', balanceTons: 1080 },
      { monthLabel: 'Sep', balanceTons: 1180 },
      { monthLabel: 'Oct', balanceTons: 1320 },
      { monthLabel: 'Nov', balanceTons: 1620 },
      { monthLabel: 'Dec', balanceTons: 1850 },
    ],
  },
}