export type ComplianceStatus = 'verified' | 'pending'

export interface ComplianceChecklistItem {
  id: string
  title: string
  status: ComplianceStatus
  verifiedAt: string | null
}

export interface ComplianceChecklist {
  sectionTitle: string
  completionPct: number
  items: ComplianceChecklistItem[]
}

export interface CarbonCreditPoint {
  monthLabel: string
  balanceTons: number
}

export interface CarbonCreditData {
  growthPct: number
  currentBalanceTons: number
  points: CarbonCreditPoint[]
}

export interface ComplianceMapArea {
  name: string
  boundaryLabel: string
  coordinates: string
  imageSrc: string
  imageAlt: string
  boundaryPath: string
}

export interface ComplianceHeader {
  presenterName: string
}

export interface ComplianceDashboardData {
  header: ComplianceHeader
  map: ComplianceMapArea
  checklist: ComplianceChecklist
  carbon: CarbonCreditData
}