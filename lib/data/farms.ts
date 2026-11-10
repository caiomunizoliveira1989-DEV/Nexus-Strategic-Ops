export type FarmStatus = 'monitored' | 'alert' | 'pending'

export type FarmProperties = {
  // preenchido por lib/data/farms-source.ts na sincronizacao
  source?: string
  id: string
  name: string
  owner: string
  city: string
  state: string
  areaHa: number
  car: string
  status: FarmStatus
}

export type FarmFeature = {
  type: 'Feature'
  geometry: { type: 'Polygon'; coordinates: number[][][] }
  properties: FarmProperties
}

export type FarmCollection = {
  type: 'FeatureCollection'
  features: FarmFeature[]
}

// gerador deterministico para o poligono nao mudar entre renders
function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648
    return s / 2147483648
  }
}

// poligono irregular com area aproximada ao informado
function parcel(lat: number, lng: number, areaHa: number, seed: number): number[][][] {
  const rand = seeded(seed)
  const radiusKm = Math.sqrt(areaHa / 100 / 3.2)
  const dLat = radiusKm / 111
  const dLng = radiusKm / (111 * Math.cos((lat * Math.PI) / 180))
  const steps = 7
  const ring: number[][] = []

  for (let i = 0; i < steps; i++) {
    const angle = (i / steps) * Math.PI * 2
    const wobble = 0.82 + rand() * 0.3
    ring.push([
      Number((lng + Math.cos(angle) * dLng * wobble).toFixed(6)),
      Number((lat + Math.sin(angle) * dLat * wobble).toFixed(6)),
    ])
  }

  const first = ring[0]
  if (first) ring.push(first)
  return [ring]
}

type Seed = FarmProperties & { lat: number; lng: number; seed: number }

const SEEDS: Seed[] = [
  { id: 'faz-santa-rita', name: 'Fazenda Santa Rita', owner: 'Caio Muniz', city: 'Itatiaiuçu', state: 'MG', areaHa: 1240, car: 'MG-3108107-8F2A4C1B9E3D', status: 'monitored', lat: -20.269, lng: -44.551, seed: 11 },
  { id: 'faz-boa-esperanca', name: 'Fazenda Boa Esperança', owner: 'Grupo Esperança', city: 'Itatiaiuçu', state: 'MG', areaHa: 860, car: 'MG-3108107-2C7B5A4D1F08', status: 'alert', lat: -20.235, lng: -44.512, seed: 23 },
  { id: 'faz-serra-verde', name: 'Fazenda Serra Verde', owner: 'Agro Serra', city: 'Brumadinho', state: 'MG', areaHa: 2050, car: 'MG-3109006-9A1E7D3C5B42', status: 'monitored', lat: -20.143, lng: -44.2, seed: 37 },
  { id: 'faz-agua-boa', name: 'Fazenda Água Boa', owner: 'Cooperativa Sul', city: 'Itatiaiuçu', state: 'MG', areaHa: 640, car: 'MG-3108107-4E8F1B6A2D97', status: 'alert', lat: -20.301, lng: -44.588, seed: 41 },
  { id: 'faz-rio-claro', name: 'Fazenda Rio Claro', owner: 'Rio Claro Agro', city: 'Sorriso', state: 'MT', areaHa: 3400, car: 'MT-5107925-7B3D9A1E4C68', status: 'monitored', lat: -12.545, lng: -55.711, seed: 53 },
  { id: 'faz-cerrado-forte', name: 'Fazenda Cerrado Forte', owner: 'Cerrado Forte S/A', city: 'Rio Verde', state: 'GO', areaHa: 1780, car: 'GO-5218805-3F6A2D8B9E15', status: 'pending', lat: -17.792, lng: -50.92, seed: 67 },
]

export const FARMS: FarmCollection = {
  type: 'FeatureCollection',
  features: SEEDS.map(({ lat, lng, seed, ...properties }) => ({
    type: 'Feature',
    geometry: { type: 'Polygon', coordinates: parcel(lat, lng, properties.areaHa, seed) },
    properties,
  })),
}

export function searchFarms(term: string): FarmFeature[] {
  const q = term.trim().toLowerCase()
  if (q.length < 2) return []

  return FARMS.features.filter((farm) => {
    const p = farm.properties
    return (
      p.name.toLowerCase().includes(q) ||
      p.owner.toLowerCase().includes(q) ||
      p.city.toLowerCase().includes(q) ||
      p.car.toLowerCase().includes(q) ||
      p.state.toLowerCase() === q
    )
  })
}
