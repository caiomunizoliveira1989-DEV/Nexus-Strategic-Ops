export interface TrainingProgram {
  id: string;
  name: string;
  skills: string[];
  territoryId: string;
  provider: string;
  durationHours: number;
  enrolledCount: number;
  completionRate: number;
}

export interface OpportunityMatch {
  id: string;
  programId: string;
  territoryId: string;
  sector: string;
  openPositions: number;
  hiringCompany: string;
}
