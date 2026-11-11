import type { StrategyDashboardData } from '@/lib/entities/strategy'

export const MOCK_STRATEGY: StrategyDashboardData = {
  header: {
    presenterName: 'Sarah Chen',
  },
  financial: {
    growthPct: 8.5,
    revenueMEur: 42.1,
    points: [
      { date: '2023-01-01T00:00:00.000Z', revenueMEur: 8, costMEur: 5 },
      { date: '2023-03-02T00:00:00.000Z', revenueMEur: 13, costMEur: 7 },
      { date: '2023-03-03T00:00:00.000Z', revenueMEur: 11, costMEur: 6 },
      { date: '2023-04-04T00:00:00.000Z', revenueMEur: 16, costMEur: 9 },
      { date: '2023-08-01T00:00:00.000Z', revenueMEur: 20, costMEur: 13 },
      { date: '2023-09-05T00:00:00.000Z', revenueMEur: 15, costMEur: 11 },
      { date: '2023-10-02T00:00:00.000Z', revenueMEur: 23, costMEur: 15 },
    ],
  },
  market: {
    gapMTons: 1.2,
    points: [
      { year: 2019, demandMTons: 1.4, supplyMTons: 0.9 },
      { year: 2020, demandMTons: 1.9, supplyMTons: 1.3 },
      { year: 2021, demandMTons: 2.4, supplyMTons: 1.8 },
      { year: 2022, demandMTons: 3.0, supplyMTons: 2.2 },
      { year: 2023, demandMTons: 3.6, supplyMTons: 2.6 },
    ],
  },
  allocation: {
    efficiencyPct: 82,
    metrics: [
      { resource: 'Capital', allocationPct: 82 },
      { resource: 'Humano', allocationPct: 72 },
      { resource: 'Equipamentos', allocationPct: 50 },
      { resource: 'P&D', allocationPct: 32 },
    ],
  },
  suppliers: [
    {
      id: 'agroworld',
      name: 'Agroworld Ltd.',
      status: 'contacted',
      lastContactedAt: '2023-10-28T03:06:00.000Z',
    },
    {
      id: 'bioseeds',
      name: 'BioSeeds Inc.',
      status: 'pending',
      lastContactedAt: '2023-10-28T02:35:00.000Z',
    },
    {
      id: 'eurocrop',
      name: 'EuroCrop',
      status: 'follow_up_required',
      lastContactedAt: '2023-10-28T03:45:00.000Z',
    },
    {
      id: 'globalag',
      name: 'GlobalAg',
      status: 'completed',
      lastContactedAt: '2023-10-28T00:45:00.000Z',
    },
  ],
  recommendations: [
    {
      id: 'supply-chain-routes',
      kind: 'supply_chain',
      region: 'LATAM',
      costReductionPct: 14,
    },
    {
      id: 'agritech-rd',
      kind: 'research_investment',
      investmentPct: 22,
      sector: 'AgriTech',
      focus: 'sustainability',
      dueDate: '2023-11-01T00:00:00.000Z',
    },
    {
      id: 'emea-compliance',
      kind: 'competitor_compliance',
      region: 'EMEA',
    },
  ],
}