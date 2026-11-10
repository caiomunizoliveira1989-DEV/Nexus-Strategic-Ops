'use client'

import { useMemo, useState } from 'react'
import { ChevronDown, Crosshair, MapPin } from 'lucide-react'
import type { FarmFeature, FarmStatus } from '@/lib/data/farms-registry'
import type { FarmsMeta } from '@/lib/data/farms-types'

const STATUS_COLOR: Record<FarmStatus, string> = {
  monitored: '#22c55e',
  alert: '#f59e0b',
  pending: '#94a3b8',
}

export type FarmViewBox = {
  south: number
  west: number
  north: number
  east: number
}

export type FarmBrowserProps = {
  view: FarmViewBox | null
  center: { lat: number; lng: number } | null
  zoom: number
  selectedId: string | null
  farms: FarmFeature[]
  meta: FarmsMeta
  onPick: (farm: FarmFeature) => void
}

function centroid(farm: FarmFeature): [number, number] {
  const ring = farm.geometry.coordinates[0] ?? []
  if (!ring.length) return [0, 0]

  let lat = 0
  let lng = 0

  for (const point of ring) {
    lng += point[0] ?? 0
    lat += point[1] ?? 0
  }

  return [lat / ring.length, lng / ring.length]
}

export function FarmBrowser({ view, center, zoom, selectedId, farms, meta, onPick }: FarmBrowserProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [openStates, setOpenStates] = useState<Record<string, boolean>>({})

  const features = farms

  const inView = useMemo(() => {
    if (!view) return features

    return features.filter((farm) => {
      const [lat, lng] = centroid(farm)
      return lat >= view.south && lat <= view.north && lng >= view.west && lng <= view.east
    })
  }, [view, features])

  const ordered = useMemo(() => {
    if (!center) return features.map((farm) => ({ farm, distance: 0 }))

    const cos = Math.cos((center.lat * Math.PI) / 180)

    return features
      .map((farm) => {
        const [lat, lng] = centroid(farm)
        const dLat = lat - center.lat
        const dLng = (lng - center.lng) * cos
        return { farm, distance: dLat * dLat + dLng * dLng }
      })
      .sort((a, b) => a.distance - b.distance)
  }, [center, features])

  const groups = useMemo(() => {
    const byState = new Map<string, FarmFeature[]>()

    for (const item of ordered) {
      const state = item.farm.properties.state
      const list = byState.get(state)
      if (list) list.push(item.farm)
      else byState.set(state, [item.farm])
    }

    return Array.from(byState.entries()).map(([state, list]) => ({ state, list }))
  }, [ordered])

  const activeState = groups[0]?.state ?? null

  return (
    <aside className="flex h-full w-[272px] shrink-0 flex-col overflow-hidden rounded-xl border border-border bg-card/60">
      <div className="flex items-center justify-between gap-2 border-b border-border px-2.5 py-2">
        <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          <MapPin className="size-3.5 text-neon-green" />
          Fazendas
        </span>
        <div className="flex items-center gap-1.5">
          <span className="rounded-full bg-neon-green/15 px-1.5 py-0.5 text-[10px] font-semibold text-neon-green">
            {inView.length}/{features.length}
          </span>
          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            aria-label={collapsed ? 'Expandir lista de fazendas' : 'Recolher lista de fazendas'}
            className="rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronDown
              className={'size-3.5 transition-transform ' + (collapsed ? '-rotate-90' : '')}
            />
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="flex-1 overflow-y-auto p-1.5">
          {groups.length === 0 && (
            <p className="px-2 py-3 text-[11px] text-muted-foreground">
              Nenhuma fazenda cadastrada.
            </p>
          )}

          {groups.map(({ state, list }) => {
            const open = openStates[state] ?? state === activeState

            return (
              <div key={state} className="mb-1 last:mb-0">
                <button
                  type="button"
                  onClick={() => setOpenStates((prev) => ({ ...prev, [state]: !open }))}
                  className="flex w-full items-center justify-between gap-2 rounded-md px-1.5 py-1.5 text-left transition-colors hover:bg-muted/40"
                >
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground">
                    <span className="rounded bg-muted px-1 py-0.5 text-[10px] font-bold tracking-wide text-muted-foreground">
                      {state}
                    </span>
                    {list.length} {list.length === 1 ? 'fazenda' : 'fazendas'}
                  </span>
                  <ChevronDown
                    className={'size-3 shrink-0 text-muted-foreground transition-transform ' + (open ? 'rotate-180' : '')}
                  />
                </button>

                {open && (
                  <ul className="mt-0.5 space-y-0.5">
                    {list.map((farm) => {
                      const props = farm.properties
                      const isSelected = props.id === selectedId

                      return (
                        <li key={props.id}>
                          <button
                            type="button"
                            onClick={() => onPick(farm)}
                            className={
                              'flex w-full items-start gap-1.5 rounded-md px-1.5 py-1.5 text-left transition-colors ' +
                              (isSelected
                                ? 'border border-neon-green/40 bg-neon-green/10'
                                : 'border border-transparent hover:bg-muted/40')
                            }
                          >
                            <span
                              className="mt-1 size-1.5 shrink-0 rounded-full"
                              style={{ backgroundColor: STATUS_COLOR[props.status] }}
                            />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-[11px] font-medium text-foreground">
                                {props.name}
                              </span>
                              <span className="block truncate text-[10px] text-muted-foreground">
                                {props.city} · {props.areaHa.toLocaleString('pt-BR')} ha
                              </span>
                            </span>
                            <Crosshair className="mt-0.5 size-2.5 shrink-0 text-muted-foreground" />
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            )
          })}

          <p className="px-1.5 pt-1 text-[9px] leading-snug text-muted-foreground/70">
            {meta.live ? meta.total.toLocaleString('pt-BR') + ' imóveis · ' + meta.source : 'Base local de demonstração'}
          </p>
          <p className="px-1.5 pb-0.5 pt-1 text-[10px] leading-snug text-muted-foreground/80">
            Mova o mapa para atualizar a lista. Zoom atual: {zoom}.
          </p>
        </div>
      )}
    </aside>
  )
}
