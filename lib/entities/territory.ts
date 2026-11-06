export interface Territory {
  id: string;
  name: string;
  state: string;
  region: string;
  population: number;
  ruralPopulationPct: number;
  connectivityScore: number;
}

export interface Community {
  id: string;
  territoryId: string;
  name: string;
  type: 'rural' | 'periferica' | 'isolada';
  population: number;
}
