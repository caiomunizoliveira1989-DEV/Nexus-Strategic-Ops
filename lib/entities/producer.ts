export interface Producer {
  id: string;
  name: string;
  territoryId: string;
  cooperativeId: string;
  crops: string[];
  areaHectares: number;
  creditScore: number;
}

export interface Cooperative {
  id: string;
  name: string;
  territoryId: string;
  members: number;
  monthlyVolumeKg: number;
}

export interface CropCycle {
  id: string;
  producerId: string;
  crop: string;
  plantedAt: string;
  harvestAt: string;
  expectedYieldKg: number;
  actualYieldKg: number;
}
