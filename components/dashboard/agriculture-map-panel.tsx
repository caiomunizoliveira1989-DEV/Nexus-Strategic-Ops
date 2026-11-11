'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  GeoJSON,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Loader2, Search, X } from 'lucide-react'
import { useLocation } from '@/lib/context/location-context'
import { reverseGeocode, searchPlace } from '@/lib/services/geocode'
import { FarmLayer } from '@/components/dashboard/agriculture-farm-layer'
import { useFarms } from '@/lib/hooks/use-farms'
import {
  FarmBrowser,
  type FarmViewBox,
} from '@/components/dashboard/agriculture-farm-browser'
import { searchFarms, type FarmFeature, type FarmStatus } from '@/lib/data/farms'
import { useI18n } from '@/lib/context/i18n-context'

const STATUS_COLOR: Record<FarmStatus, string> = {
  monitored: '#22c55e',
  alert: '#f59e0b',
  pending: '#94a3b8',
}

const FARM_CSS =
  '.nexus-farm-tip{background:transparent;border:0;box-shadow:none;padding:0}' +
  '.nexus-farm-tip::before{display:none}' +
  '.nexus-farm-label{display:inline-block;white-space:nowrap;font-size:10px;font-weight:600;line-height:1;color:#e5e7eb;text-shadow:0 1px 2px rgba(0,0,0,.95),0 0 8px rgba(0,0,0,.85);pointer-events:none}'

type FarmView = {
  view: FarmViewBox
  center: { lat: number; lng: number }
  zoom: number
}

type TooltipLayer = {
  bindTooltip(content: string, options?: Record<string, unknown>): unknown
}

const markerIcon = L.divIcon({
  className: '',
  html: '<span style="display:block;width:16px;height:16px;border-radius:9999px;background:#34d399;box-shadow:0 0 0 4px rgba(52,211,153,.25),0 0 14px rgba(52,211,153,.85);border:2px solid #0b0f0e"></span>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
})

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(event) {
      onPick(event.latlng.lat, event.latlng.lng)
    },
  })

  return null
}

function Recenter({ lat, lng, paused }: { lat: number; lng: number; paused?: boolean }) {
  const map = useMap()

  useEffect(() => {
    if (paused) return
    map.setView([lat, lng], map.getZoom())
  }, [lat, lng, map, paused])

  return null
}

function MapBridge({
  onReady,
  onViewChange,
}: {
  onReady: (map: L.Map) => void
  onViewChange: (next: FarmView) => void
}) {
  const map = useMap()
  const readyRef = useRef(onReady)
  const viewRef = useRef(onViewChange)

  readyRef.current = onReady
  viewRef.current = onViewChange

  useEffect(() => {
    readyRef.current(map)

    const push = () => {
      const bounds = map.getBounds()
      const center = map.getCenter()

      viewRef.current({
        view: {
          south: bounds.getSouth(),
          west: bounds.getWest(),
          north: bounds.getNorth(),
          east: bounds.getEast(),
        },
        center: { lat: center.lat, lng: center.lng },
        zoom: map.getZoom(),
      })
    }

    push()
    map.on('moveend zoomend', push)

    return () => {
      map.off('moveend zoomend', push)
    }
  }, [map])

  return null
}

function FarmLabels({ farms, visible }: { farms: FarmFeature[]; visible: boolean }) {
  if (!visible) return null

  const key = farms.map((farm) => farm.properties.id).join('|')

  return (
    <GeoJSON
      key={key}
      data={{ type: 'FeatureCollection', features: farms } as unknown as never}
      style={() => ({ color: 'transparent', weight: 0, fillColor: 'transparent', fillOpacity: 0 })}
      onEachFeature={(feature, layer) => {
        if (!feature) return
        const props = feature.properties as FarmFeature['properties']
        const tip = layer as unknown as TooltipLayer

        tip.bindTooltip(
          '<span class="nexus-farm-label">' + props.name + '</span>',
          {
            permanent: true,
            direction: 'center',
            className: 'nexus-farm-tip',
            opacity: 1,
            interactive: false,
          },
        )
      }}
    />
  )
}

function FarmSelection({ farm }: { farm: FarmFeature | null }) {
  if (!farm) return null

  return (
    <GeoJSON
      key={'sel-' + farm.properties.id}
      data={{ type: 'FeatureCollection', features: [farm] } as unknown as never}
      style={{
        color: '#e5e7eb',
        weight: 3,
        opacity: 1,
        fillColor: STATUS_COLOR[farm.properties.status],
        fillOpacity: 0.3,
      }}
    />
  )
}

function parseCoords(term: string): { lat: number; lng: number } | null {
  const match = term.match(/^(-?\d+(?:[.,]\d+)?)\s*[,;\s]\s*(-?\d+(?:[.,]\d+)?)$/)
  if (!match) return null

  const lat = Number(match[1].replace(',', '.'))
  const lng = Number(match[2].replace(',', '.'))

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null

  return { lat, lng }
}

function ringCenter(ring: number[][]): { lat: number; lng: number } {
  let lat = 0
  let lng = 0

  for (const point of ring) {
    lng += point[0] ?? 0
    lat += point[1] ?? 0
  }

  const total = ring.length || 1
  return { lat: lat / total, lng: lng / total }
}

function MapLegend() {
  const { t } = useI18n()

  const items: Array<{ key: FarmStatus; label: string; color: string; dashed: boolean }> = [
    { key: 'monitored', label: t('status.monitored'), color: '#22c55e', dashed: false },
    { key: 'alert', label: t('status.alert'), color: '#f59e0b', dashed: false },
    { key: 'pending', label: t('status.pending'), color: '#94a3b8', dashed: true },
  ]

  return (
    <div className="absolute bottom-3 left-3 z-[500] rounded-lg border border-border bg-card/95 px-3 py-2 backdrop-blur">
      <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {t('map.legend')}
      </p>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.key} className="flex items-center gap-2 text-[11px] text-foreground">
            <span
              aria-hidden
              className="size-3 shrink-0 rounded-sm border"
              style={{
                borderColor: item.color,
                borderStyle: item.dashed ? 'dashed' : 'solid',
                backgroundImage: 'repeating-linear-gradient(45deg, ' + item.color + 'B3 0 1.5px, transparent 1.5px 4px)',
              }}
            />
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function AgricultureMapPanel() {
  const { location, setLocation } = useLocation()
  const { farms, meta } = useFarms()
  const [query, setQuery] = useState('')
  const [busy, setBusy] = useState(false)
  const [focus, setFocus] = useState<FarmFeature | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [view, setView] = useState<FarmView | null>(null)
  const mapRef = useRef<L.Map | null>(null)
  const farmClick = useRef(false)

  const handleReady = useCallback((map: L.Map) => {
    mapRef.current = map
  }, [])

  const handleViewChange = useCallback((next: FarmView) => {
    setView((previous) => {
      if (!previous) return next

      const same = (a: number, b: number) => Math.abs(a - b) < 0.000001

      if (
        previous.zoom === next.zoom &&
        same(previous.center.lat, next.center.lat) &&
        same(previous.center.lng, next.center.lng) &&
        same(previous.view.north, next.view.north) &&
        same(previous.view.south, next.view.south)
      ) {
        return previous
      }

      return next
    })
  }, [])

  const pickFarm = useCallback(
    (farm: FarmFeature) => {
      const props = farm.properties
      const ring = farm.geometry.coordinates[0] ?? []
      const center = ringCenter(ring)

      setSelectedId(props.id)
      setFocus(farm)
      setLocation({
        lat: center.lat,
        lng: center.lng,
        label: props.name + ' — ' + props.city + '/' + props.state,
      })

      const map = mapRef.current
      if (map && ring.length) {
        const bounds = ring.map(([lng, lat]) => [lat, lng] as [number, number])
        map.flyToBounds(bounds, { padding: [50, 50], duration: 0.9, maxZoom: 15 })
      }
    },
    [setLocation],
  )

  const handleFarmSelect = useCallback(
    (farm: FarmFeature) => {
      farmClick.current = true
      window.setTimeout(() => {
        farmClick.current = false
      }, 0)
      pickFarm(farm)
    },
    [pickFarm],
  )

  const handlePick = useCallback(
    async (lat: number, lng: number) => {
      if (farmClick.current) {
        farmClick.current = false
        return
      }

      setFocus(null)
      setSelectedId(null)
      setBusy(true)
      const label = await reverseGeocode(lat, lng)
      setLocation({ lat, lng, label })
      setBusy(false)
    },
    [setLocation],
  )

  const handleSearch = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()

      const term = query.trim()
      if (!term) return

      const farms = searchFarms(term)
      const first = farms[0]

      if (first) {
        pickFarm(first)
        return
      }

      const coords = parseCoords(term)
      if (coords) {
        setFocus(null)
        setSelectedId(null)
        setLocation({
          lat: coords.lat,
          lng: coords.lng,
          label: coords.lat.toFixed(4) + ', ' + coords.lng.toFixed(4),
        })
        return
      }

      setFocus(null)
      setSelectedId(null)
      setBusy(true)
      const result = await searchPlace(term)
      if (result) setLocation(result)
      setBusy(false)
    },
    [query, setLocation, pickFarm],
  )

  const visibleFarms = useMemo(() => {
    if (!view) return farms

    const { south, west, north, east } = view.view

    return farms.filter((farm) => {
      const ring = farm.geometry.coordinates[0] ?? []
      const center = ringCenter(ring)
      return center.lat >= south && center.lat <= north && center.lng >= west && center.lng <= east
    })
  }, [view, farms])

  const selected = useMemo(
    () => farms.find((farm) => farm.properties.id === selectedId) ?? null,
    [selectedId, farms],
  )

  const zoom = view?.zoom ?? 11

  return (
    <div className="flex h-full w-full gap-2 overflow-hidden">
      <style>{FARM_CSS}</style>

      <FarmBrowser
        view={view?.view ?? null}
        center={view?.center ?? null}
        zoom={zoom}
        selectedId={selectedId}
        farms={farms}
        meta={meta}
        onPick={pickFarm}
      />

      <div className="relative min-w-0 flex-1 overflow-hidden rounded-xl border border-border bg-card/40">
        <MapContainer
          center={[location.lat, location.lng]}
          zoom={11}
          scrollWheelZoom
          className="absolute inset-0 z-0"
        >
          <MapBridge onReady={handleReady} onViewChange={handleViewChange} />
          <FarmLayer onSelect={handleFarmSelect} />
          <FarmLabels farms={visibleFarms} visible={zoom >= 9} />
          <FarmSelection farm={selected} />
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap"
          />
          <ClickHandler onPick={handlePick} />
          <Recenter lat={location.lat} lng={location.lng} paused={focus !== null} />
          <Marker position={[location.lat, location.lng]} icon={markerIcon}>
            <Popup>{location.label}</Popup>
          </Marker>
        </MapContainer>

        <form
          onSubmit={handleSearch}
          className="absolute left-3 top-3 z-[500] flex w-[min(300px,calc(100%-1.5rem))] items-center gap-2 rounded-lg border border-border bg-card/95 px-2.5 py-1.5 backdrop-blur"
        >
          <Search className="size-3.5 shrink-0 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar fazenda, cidade ou coordenada"
            className="w-full bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground/70"
          />
          {busy && <Loader2 className="size-3.5 animate-spin text-neon-green" />}
        </form>

        {focus && (
          <div className="absolute left-3 top-14 z-[500] flex max-w-[min(300px,calc(100%-1.5rem))] items-center gap-2 rounded-lg border border-neon-green/40 bg-card/95 px-2.5 py-1.5 text-[11px] text-foreground backdrop-blur">
            <span className="truncate">
              {focus.properties.name} · {focus.properties.areaHa.toLocaleString('pt-BR')} ha
            </span>
            <button
              type="button"
              onClick={() => {
                setFocus(null)
                setSelectedId(null)
              }}
              aria-label="Limpar seleção"
              className="shrink-0 rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="size-3" />
            </button>
          </div>
        )}

        <MapLegend />

        {busy && (
          <div className="absolute bottom-3 right-3 z-[500] flex items-center gap-2 rounded-lg border border-border bg-card/95 px-3 py-1.5 text-[11px] text-muted-foreground backdrop-blur">
            <Loader2 className="size-3 animate-spin" /> Identificando local...
          </div>
        )}
      </div>
    </div>
  )
}
