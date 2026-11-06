export interface ImpactBusinessModel {
  id: string;
  name: string;
  problem: string;
  serviceOffered: string;
  revenueStream: string;
  territoryId: string;
  stage: 'pilot' | 'validated' | 'scaling';
  monthlyRevenueBRL: number;
  jobsCreated: number;
}
