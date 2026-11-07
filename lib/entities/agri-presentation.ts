export type KpiAccent = 'green' | 'amber' | 'red' | 'blue';

export interface KpiVisual {
  icon: string;
  accent: KpiAccent;
  sparkline: number[];
}

export interface KpiDisplay {
  id: string;
  label: string;
  valueLabel: string;
  deltaLabel: string;
  deltaDirection: 'up' | 'down' | 'flat';
  visual: KpiVisual;
}

export interface ActivityVisual {
  icon: string;
  accent: KpiAccent;
}

export interface ActivityDisplay {
  id: string;
  title: string;
  description: string;
  timeLabel: string;
  visual: ActivityVisual;
}

export interface AlertVisual {
  icon: string;
  accent: KpiAccent;
}

export interface AlertDisplay {
  id: string;
  title: string;
  description: string;
  severityLabel: string;
  visual: AlertVisual;
}

export interface MapMarkerDisplay {
  id: string;
  plotId: string;
  label: string;
  statusLabel: string;
  statusAccent: KpiAccent;
  xPct: number;
  yPct: number;
}

export interface YieldForecastDisplay {
  id: string;
  plotId: string;
  cropLabel: string;
  expectedLabel: string;
  confidenceLabel: string;
  windowLabel: string;
}
