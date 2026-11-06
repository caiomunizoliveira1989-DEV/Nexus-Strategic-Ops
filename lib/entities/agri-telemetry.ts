export type SensorType =
  | 'soil_moisture'
  | 'temperature'
  | 'humidity'
  | 'ndvi'
  | 'rainfall';

export interface SensorReading {
  id: string;
  sensorId: string;
  plotId: string;
  type: SensorType;
  value: number;
  unit: string;
  recordedAt: string;
}

export type PlotStatus = 'optimal' | 'attention' | 'critical';

export interface Plot {
  id: string;
  farmId: string;
  name: string;
  areaHectares: number;
  crop: string;
  status: PlotStatus;
  lastInspectionAt: string;
}

export interface KpiTrend {
  value: number;
  deltaPct: number;
  deltaLabel: string;
}

export interface AgricultureKpi {
  id: string;
  label: string;
  trend: KpiTrend;
  unit?: string;
}

export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface FieldAlert {
  id: string;
  plotId: string;
  title: string;
  severity: AlertSeverity;
  detectedAt: string;
  description: string;
}

export type ActivityType =
  | 'pest_detection'
  | 'irrigation'
  | 'ndvi_recalc'
  | 'weather'
  | 'inspection';

export interface ActivityFeedItem {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  plotId?: string;
  occurredAt: string;
  severity?: AlertSeverity;
}

export interface FarmLocation {
  farmName: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
}

export interface WeatherSnapshot {
  city: string;
  country: string;
  observedAt: string;
  temperatureC: number;
  condition: string;
}

export interface YieldForecast {
  id: string;
  plotId: string;
  crop: string;
  expectedTons: number;
  confidencePct: number;
  harvestWindow: string;
}
