import type { RiskType } from './climate-risk';

export interface CreditOffer {
  id: string;
  provider: string;
  producerId: string;
  amountBRL: number;
  interestRateMonthly: number;
  termMonths: number;
  status: string;
}

export interface InsurancePolicy {
  id: string;
  provider: string;
  producerId: string;
  coverageType: string;
  premiumBRL: number;
  coveredRisks: RiskType[];
}
