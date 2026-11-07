import type {
  ActivityFeedItem,
  AgricultureKpi,
  FarmLocation,
  FieldAlert,
  Plot,
  WeatherSnapshot,
  YieldForecast,
} from '@/lib/entities/agri-telemetry';

export const MOCK_KPIS: AgricultureKpi[] = [
  {
    id: 'soil-moisture',
    label: 'Soil Moisture',
    trend: { value: 42, deltaPct: 2.4, deltaLabel: '+2.4%' },
    unit: '%',
  },
  {
    id: 'crop-health-index',
    label: 'Crop Health Index',
    trend: { value: 94.2, deltaPct: 1.8, deltaLabel: '+1.8%' },
    unit: '%',
  },
  {
    id: 'active-weather-alerts',
    label: 'Active Weather Alerts',
    trend: { value: 3, deltaPct: 1, deltaLabel: '+1 today' },
  },
  {
    id: 'pest-risk-zones',
    label: 'Pest Risk Zones',
    trend: { value: 2, deltaPct: 0, deltaLabel: 'Plot 4B critical' },
  },
];

export const MOCK_PLOTS: Plot[] = [
  {
    id: 'plot-1b',
    farmId: 'santa-maria-do-monjolinho',
    name: 'Plot 1B',
    areaHectares: 12.5,
    crop: 'Maize',
    status: 'optimal',
    lastInspectionAt: '2026-11-06T18:57:31-03:00',
  },
  {
    id: 'plot-2a',
    farmId: 'santa-maria-do-monjolinho',
    name: 'Plot 2A',
    areaHectares: 9.2,
    crop: 'Soybeans',
    status: 'optimal',
    lastInspectionAt: '2026-11-06T18:23:00-03:00',
  },
  {
    id: 'plot-3',
    farmId: 'santa-maria-do-monjolinho',
    name: 'Plot 3',
    areaHectares: 15.8,
    crop: 'Maize',
    status: 'attention',
    lastInspectionAt: '2026-11-06T17:48:00-03:00',
  },
  {
    id: 'plot-4b',
    farmId: 'santa-maria-do-monjolinho',
    name: 'Plot 4B',
    areaHectares: 7.4,
    crop: 'Coffee',
    status: 'critical',
    lastInspectionAt: '2026-11-06T18:55:31-03:00',
  },
  {
    id: 'plot-5a',
    farmId: 'santa-maria-do-monjolinho',
    name: 'Plot 5A',
    areaHectares: 10.1,
    crop: 'Soybeans',
    status: 'attention',
    lastInspectionAt: '2026-11-06T16:30:00-03:00',
  },
];

export const MOCK_ALERTS: FieldAlert[] = [
  {
    id: 'alert-pest-plot-4b',
    plotId: 'plot-4b',
    title: 'Pest Detection',
    severity: 'high',
    detectedAt: '2026-11-06T19:31:31-03:00',
    description: 'High severity flagged on Plot 4B — scout dispatched.',
  },
  {
    id: 'alert-storm-plot-3',
    plotId: 'plot-3',
    title: 'Storm Warning',
    severity: 'medium',
    detectedAt: '2026-11-06T18:58:31-03:00',
    description: 'Heavy rainfall expected Thursday — 70% chance.',
  },
  {
    id: 'alert-moisture-plot-5a',
    plotId: 'plot-5a',
    title: 'Soil Moisture',
    severity: 'low',
    detectedAt: '2026-11-06T18:45:31-03:00',
    description: 'Soil moisture requires attention in Plot 5A.',
  },
];

export const MOCK_ACTIVITY: ActivityFeedItem[] = [
  {
    id: 'activity-pest-detection',
    type: 'pest_detection',
    title: 'Pest Detection',
    description: 'High severity flagged on Plot 4B — scout dispatched.',
    plotId: 'plot-4b',
    occurredAt: '2026-11-06T19:31:31-03:00',
    severity: 'high',
  },
  {
    id: 'activity-irrigation',
    type: 'irrigation',
    title: 'Irrigation Cycle',
    description: 'Zone 3 completed · 1,240 L delivered.',
    plotId: 'plot-3',
    occurredAt: '2026-11-06T19:25:31-03:00',
  },
  {
    id: 'activity-ndvi-recalculated',
    type: 'ndvi_recalc',
    title: 'NDVI Recalculated',
    description: 'Plot 1B canopy density up +3.2% this week.',
    plotId: 'plot-1b',
    occurredAt: '2026-11-06T19:18:31-03:00',
  },
  {
    id: 'activity-storm-warning',
    type: 'weather',
    title: 'Storm Warning',
    description: 'Heavy rainfall expected Thursday — 70% chance.',
    occurredAt: '2026-11-06T19:11:31-03:00',
    severity: 'medium',
  },
  {
    id: 'activity-inspection-passed',
    type: 'inspection',
    title: 'Inspection Passed',
    description: 'Plot 2A soil sampling within optimal range.',
    plotId: 'plot-2a',
    occurredAt: '2026-11-06T18:59:31-03:00',
  },
];

export const MOCK_YIELDS: YieldForecast[] = [
  {
    id: 'yield-plot-1b',
    plotId: 'plot-1b',
    crop: 'Maize',
    expectedTons: 10.4,
    confidencePct: 92,
    harvestWindow: '2026-09',
  },
  {
    id: 'yield-plot-3',
    plotId: 'plot-3',
    crop: 'Maize',
    expectedTons: 8.1,
    confidencePct: 86,
    harvestWindow: '2026-07',
  },
  {
    id: 'yield-plot-5a',
    plotId: 'plot-5a',
    crop: 'Soybeans',
    expectedTons: 5.5,
    confidencePct: 88,
    harvestWindow: '2026-05',
  },
];

export const MOCK_LOCATION: FarmLocation = {
  farmName: 'Fazenda Santa Maria do Monjolinho',
  city: 'São Carlos',
  state: 'SP',
  latitude: -21.98,
  longitude: -47.9,
};

export const MOCK_WEATHER: WeatherSnapshot = {
  city: 'São Paulo',
  country: 'BR',
  observedAt: '2026-11-06T19:30:00-03:00',
  temperatureC: 24,
  condition: 'Parcialmente nublado',
};
