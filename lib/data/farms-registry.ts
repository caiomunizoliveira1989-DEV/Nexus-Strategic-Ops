import { FARMS as SEED, type FarmFeature, type FarmStatus } from './farms'
import { SYNCED_FARMS, SYNCED_META } from './farms.generated'

const byId = new Map<string, FarmFeature>()

for (const farm of SYNCED_FARMS as unknown as FarmFeature[]) {
  byId.set(farm.properties.id, farm)
}

for (const farm of SEED.features) {
  if (!byId.has(farm.properties.id)) byId.set(farm.properties.id, farm)
}

const list = Array.from(byId.values())

export const FARMS = {
  type: 'FeatureCollection' as const,
  features: list,
}

export const FARMS_META = {
  total: list.length,
  synced: list.length - SEED.features.length,
  seed: SEED.features.length,
  source: SYNCED_META.source,
  sourceUrl: SYNCED_META.sourceUrl,
  syncedAt: SYNCED_META.syncedAt,
  isSeedOnly: list.length === SEED.features.length,
}

export { searchFarms } from './farms'
export type { FarmFeature, FarmStatus }
