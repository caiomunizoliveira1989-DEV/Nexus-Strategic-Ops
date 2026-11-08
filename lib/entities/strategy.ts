export type SupplierContactStatus =
  | 'contacted'
  | 'pending'
  | 'follow_up_required'
  | 'completed'

export type AllocationResource = 'Capital' | 'Human' | 'Equipment' | 'R&D'

export interface StrategyHeader {
  presenterName: string
}

export interface FinancialImpactPoint {
  date: string
  revenueMEur: number
  costMEur: number
}

export interface FinancialImpactData {
  growthPct: number
  revenueMEur: number
  points: FinancialImpactPoint[]
}

export interface DemandSupplyPoint {
  year: number
  demandMTons: number
  supplyMTons: number
}

export interface MarketDemandSupplyData {
  gapMTons: number
  points: DemandSupplyPoint[]
}

export interface ResourceAllocationMetric {
  resource: AllocationResource
  allocationPct: number
}

export interface ResourceAllocationData {
  efficiencyPct: number
  metrics: ResourceAllocationMetric[]
}

export interface SupplierContact {
  id: string
  name: string
  status: SupplierContactStatus
  lastContactedAt: string
}

export type StrategyRecommendation =
  | {
      id: string
      kind: 'supply_chain'
      region: string
      costReductionPct: number
    }
  | {
      id: string
      kind: 'research_investment'
      investmentPct: number
      sector: string
      focus: string
      dueDate: string
    }
  | {
      id: string
      kind: 'competitor_compliance'
      region: string
    }

export interface StrategyDashboardData {
  header: StrategyHeader
  financial: FinancialImpactData
  market: MarketDemandSupplyData
  allocation: ResourceAllocationData
  suppliers: SupplierContact[]
  recommendations: StrategyRecommendation[]
}