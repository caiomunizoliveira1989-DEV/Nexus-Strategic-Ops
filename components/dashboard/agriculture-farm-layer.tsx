'use client'

import { useEffect, useRef } from 'react'
import { GeoJSON, useMap } from 'react-leaflet'
import { FARMS, type FarmFeature, type FarmStatus } from '@/lib/data/farms'
import type { Layer } from 'leaflet'
import { useI18n } from '@/lib/context/i18n-context'

// tipo estrutural: aceita popup/tooltip em qualquer versao do @types/leaflet
type FarmPath = Layer & {
  bindTooltip(content: string, options?: Record<string, unknown>): unknown
  bindPopup(content: string): unknown
}

const STATUS_COLOR: Record<FarmStatus, string> = {
  monitored: '#22c55e',
  alert: '#f59e0b',
  pending: '#94a3b8',
}


function HatchPatterns() {
  const map = useMap()

  useEffect(() => {
    const draw = () => {
      const svg = map.getPanes().overlayPane?.querySelector('svg')
      if (!(svg instanceof SVGSVGElement)) return false

      const ns = 'http://www.w3.org/2000/svg'
      let defs = svg.querySelector('defs[data-farm-hatch]')
      if (!defs) {
        defs = document.createElementNS(ns, 'defs')
        defs.setAttribute('data-farm-hatch', '1')
        svg.insertBefore(defs, svg.firstChild)
      }

      for (const [status, color] of Object.entries(STATUS_COLOR)) {
        const id = 'farm-hatch-' + status
        if (defs.querySelector('#' + id)) continue

        const pattern = document.createElementNS(ns, 'pattern')
        pattern.setAttribute('id', id)
        pattern.setAttribute('width', '10')
        pattern.setAttribute('height', '10')
        pattern.setAttribute('patternUnits', 'userSpaceOnUse')
        pattern.setAttribute('patternTransform', 'rotate(45)')

        const line = document.createElementNS(ns, 'line')
        line.setAttribute('x1', '0')
        line.setAttribute('y1', '0')
        line.setAttribute('x2', '0')
        line.setAttribute('y2', '10')
        line.setAttribute('stroke', color)
        line.setAttribute('stroke-width', '2.5')
        line.setAttribute('stroke-opacity', '0.8')

        pattern.appendChild(line)
        defs.appendChild(pattern)
      }
      return true
    }

    if (draw()) return
    const timers = [50, 200, 500, 1000].map((ms) => window.setTimeout(draw, ms))
    return () => timers.forEach((t) => window.clearTimeout(t))
  }, [map])

  return null
}

export type FarmLayerProps = {
  onSelect?: (farm: FarmFeature) => void
}

export function FarmLayer({ onSelect }: FarmLayerProps) {
  const { t } = useI18n()

  const statusLabel: Record<FarmStatus, string> = {
    monitored: t('status.monitored'),
    alert: t('status.alert'),
    pending: t('status.pending'),
  }
  return (
    <>
      <HatchPatterns />
      <GeoJSON
        data={FARMS as unknown as never}
        style={(feature) => {
          const status = (feature?.properties?.status ?? 'pending') as FarmStatus
          return {
            color: STATUS_COLOR[status],
            weight: 1.5,
            opacity: 0.95,
            fillColor: 'url(#farm-hatch-' + status + ')',
            fillOpacity: 1,
            dashArray: status === 'pending' ? '6 4' : undefined,
          }
        }}
        onEachFeature={(feature, layer) => {
          if (!feature) return
          const path = layer as FarmPath
          const p = feature.properties as FarmFeature['properties']

          path.bindTooltip(p.name, { sticky: true, direction: 'top' })
          path.bindPopup(
            '<div style="font-size:12px;line-height:1.5">' +
              '<strong>' + p.name + '</strong><br/>' +
              p.city + ' - ' + p.state + '<br/>' +
              p.areaHa.toLocaleString('pt-BR') + ' ha<br/>' +
              'CAR: ' + p.car + '<br/>' +
              t('common.status') + ': ' + statusLabel[p.status] +
            '</div>',
          )
          path.on('click', () => onSelect?.(feature as unknown as FarmFeature))
        }}
      />
    </>
  )
}

export function FarmFocus({ farm }: { farm: FarmFeature | null }) {
  const map = useMap()
  const lastId = useRef<string | null>(null)

  useEffect(() => {
    if (!farm || lastId.current === farm.properties.id) return
    lastId.current = farm.properties.id

    const ring = farm.geometry.coordinates[0].map(
      ([lng, lat]) => [lat, lng] as [number, number],
    )

    map.flyToBounds(ring, { padding: [70, 70], duration: 1.2, maxZoom: 15 })
  }, [farm, map])

  return null
}
