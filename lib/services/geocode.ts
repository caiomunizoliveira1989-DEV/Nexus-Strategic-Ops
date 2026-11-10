export async function reverseGeocode(
  lat: number,
  lng: number,
): Promise<string> {
  const params = new URLSearchParams({
    format: 'jsonv2',
    lat: lat.toFixed(5),
    lon: lng.toFixed(5),
    zoom: '10',
    'accept-language': 'pt-BR',
  })

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?${params.toString()}`,
      { headers: { Accept: 'application/json' } },
    )

    if (!response.ok) return `${lat.toFixed(3)}, ${lng.toFixed(3)}`

    const data = (await response.json()) as {
      address?: Record<string, string>
      display_name?: string
    }

    const address = data.address ?? {}
    const city =
      address.city ??
      address.town ??
      address.village ??
      address.municipality ??
      address.county
    const state = address.state_code ?? address.state

    if (city && state) return `${city}, ${state}`
    if (city) return city
    if (data.display_name) return data.display_name.split(',')[0]

    return `${lat.toFixed(3)}, ${lng.toFixed(3)}`
  } catch {
    return `${lat.toFixed(3)}, ${lng.toFixed(3)}`
  }
}

export type PlaceResult = {
  lat: number
  lng: number
  label: string
}

export async function searchPlace(query: string): Promise<PlaceResult | null> {
  const params = new URLSearchParams({
    format: 'jsonv2',
    q: query,
    limit: '1',
    'accept-language': 'pt-BR',
  })

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?${params.toString()}`,
      { headers: { Accept: 'application/json' } },
    )

    if (!response.ok) return null

    const results = (await response.json()) as Array<{
      lat: string
      lon: string
      display_name?: string
      name?: string
    }>

    const first = results[0]
    if (!first) return null

    const lat = Number(first.lat)
    const lng = Number(first.lon)

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null

    const label = first.name || (first.display_name ?? query).split(',')[0]

    return { lat, lng, label }
  } catch {
    return null
  }
}
