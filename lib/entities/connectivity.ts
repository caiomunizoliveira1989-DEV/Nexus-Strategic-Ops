export interface ConnectivityPoint {
  id: string;
  territoryId: string;
  name: string;
  technology: 'fiber' | 'radio' | 'satellite' | 'mobile';
  coverageKm: number;
  usersServed: number;
  uptimePct: number;
  status: 'active' | 'planned' | 'degraded';
}
