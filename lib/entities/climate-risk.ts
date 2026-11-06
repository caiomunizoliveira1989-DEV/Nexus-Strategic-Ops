export type RiskType = 'flood' | 'landslide' | 'fire' | 'heatwave';

export interface RiskEvent {
  id: string;
  type: RiskType;
  territoryId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  probability: number;
  startsAt: string;
  endsAt: string;
  source: string;
  confidence: number;
}

export interface Alert {
  id: string;
  riskEventId: string;
  channel: 'sms' | 'whatsapp' | 'push' | 'radio';
  audience: string;
  message: string;
  sentAt: string;
  deliveredCount: number;
}
