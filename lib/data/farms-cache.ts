import { FARMS as SEED, type FarmFeature } from './farms'
import { fetchFarmsFromSource, readConfig } from './farms-source'
import type { FarmsMeta } from './farms-types'

const TTL_MS = Number(process.env.FARMS_CACHE_TTL ?? 600000)

type Snapshot = {
  at: number
  features: FarmFeature[]
  meta: FarmsMeta
}

let cache: Snapshot | null = null
let inflight: Promise<Snapshot> | null = null

function build(remote: FarmFeature[], source: string, sourceUrl: string, syncedAt: string): Snapshot {
  const byId = new Map<string, FarmFeature>()

  for (const farm of remote) byId.set(farm.properties.id, farm)

  const seedList = Array.isArray(SEED.features) ? SEED.features : []
  for (const farm of seedList) {
    if (!byId.has(farm.properties.id)) byId.set(farm.properties.id, farm)
  }

  const features = Array.from(byId.values())

  return {
    at: Date.now(),
    features,
    meta: {
      total: features.length,
      seed: seedList.length,
      remote: remote.length,
      source: remote.length ? source : 'Base local',
      sourceUrl: remote.length ? sourceUrl : '',
      syncedAt,
      live: remote.length > 0,
    },
  }
}

async function load(): Promise<Snapshot> {
  const config = readConfig()

  if (!config) {
    return build([], 'Base local', '', '')
  }

  const result = await fetchFarmsFromSource(config)
  return build(result.features, result.source, result.sourceUrl, result.syncedAt)
}

export async function getFarms(force = false): Promise<Snapshot> {
  if (!force && cache && Date.now() - cache.at < TTL_MS) return cache

  if (inflight) return inflight

  inflight = load()
    .then((snapshot) => {
      cache = snapshot
      return snapshot
    })
    .catch((error) => {
      if (cache) return cache
      throw error
    })
    .finally(() => {
      inflight = null
    })

  return inflight
}

export function invalidateFarms(): void {
  cache = null
}
