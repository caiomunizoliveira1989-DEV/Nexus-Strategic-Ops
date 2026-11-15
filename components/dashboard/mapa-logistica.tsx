'use client'

import { useEffect } from 'react'
import {
  MapContainer,
  TileLayer,
  Polyline,
  Circle,
  CircleMarker,
  Popup,
  Tooltip,
  ZoomControl,
  ScaleControl,
  useMap,
} from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import {
  COR_SEVERIDADE,
  ROTULO_CATEGORIA,
  type AlertaLogistica,
  type CategoriaAlerta,
} from '@/lib/data/alertas-logistica'
import {
  COR_STATUS,
  STATUS_ROTA_LABEL,
  type NavioAvaliado,
} from '@/lib/data/rotas-navios'

export type ModoBase = 'satelite' | 'mapa'
export type Foco = { lat: number; lng: number; zoom: number; chave: string } | null

type Props = {
  modo: ModoBase
  alertas: AlertaLogistica[]
  filtro: Record<CategoriaAlerta, boolean>
  foco: Foco
  navios: NavioAvaliado[]
  navioSelecionadoId: string | null
}

function ControleFoco({ foco }: { foco: Foco }) {
  const mapa = useMap()
  useEffect(() => {
    if (foco) mapa.flyTo([foco.lat, foco.lng], foco.zoom, { duration: 1.2 })
  }, [foco, mapa])
  return null
}

export default function MapaLogistica({
  modo,
  alertas,
  filtro,
  foco,
  navios,
  navioSelecionadoId,
}: Props) {
  const visiveis = alertas.filter((a) => filtro[a.categoria])

  return (
    <MapContainer
      center={[18, 62]}
      zoom={3}
      zoomControl={false}
      scrollWheelZoom
      dragging
      doubleClickZoom
      preferCanvas
      style={{ height: '100%', width: '100%', background: '#05100a' }}
    >
      <TileLayer
        key={modo}
        url={
          modo === 'satelite'
            ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
            : 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}'
        }
        attribution="Imagens &copy; Esri, Maxar, HERE"
        maxZoom={18}
      />

      <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
        maxZoom={18}
        opacity={0.7}
      />

      {visiveis.map((a) => {
        const cor = COR_SEVERIDADE[a.severidade]
        return (
          <Circle
            key={a.id}
            center={[a.lat, a.lng]}
            radius={a.raioKm * 1000}
            pathOptions={{
              color: cor.traco,
              weight: a.severidade === 'grave' ? 2 : 1.5,
              fillColor: cor.preenchimento,
              fillOpacity: a.severidade === 'grave' ? 0.28 : 0.16,
              dashArray: a.categoria === 'clima' ? '6 5' : undefined,
            }}
          />
        )
      })}

      {/* Rotas dos navios — cor e espessura vêm do status calculado */}
      {navios.map((navio) => {
        if (navio.tracado.length < 2) return null
        const selecionado = navio.id === navioSelecionadoId

        return (
          <Polyline
            key={navio.id}
            positions={navio.tracado}
            pathOptions={{
              color: COR_STATUS[navio.status],
              weight: selecionado ? 4 : navio.status === 'em_rota' ? 1.5 : 2.2,
              opacity: selecionado ? 1 : navio.status === 'em_rota' ? 0.45 : 0.8,
              dashArray: '7 5',
            }}
          >
            <Tooltip sticky>
              {navio.nome} · {STATUS_ROTA_LABEL[navio.status]}
            </Tooltip>
          </Polyline>
        )
      })}

      {visiveis.map((a) => {
        const cor = COR_SEVERIDADE[a.severidade]
        return (
          <CircleMarker
            key={a.id + '-ponto'}
            center={[a.lat, a.lng]}
            radius={a.severidade === 'grave' ? 6 : 4.5}
            pathOptions={{
              color: cor.traco,
              fillColor: cor.preenchimento,
              fillOpacity: 0.9,
              weight: 2,
            }}
          >
            <Popup>
              <div style={{ minWidth: 220, fontSize: 12.5, lineHeight: 1.55 }}>
                <strong style={{ fontSize: 13.5 }}>{a.titulo}</strong>
                <div style={{ color: cor.traco, fontWeight: 700 }}>
                  {cor.rotulo} · {a.risco}
                </div>
                <div style={{ opacity: 0.75, marginBottom: 4 }}>
                  {a.local} · {ROTULO_CATEGORIA[a.categoria]}
                </div>
                <div>{a.resumo}</div>
                <div style={{ opacity: 0.65, marginTop: 5, fontSize: 11 }}>
                  {a.fonte} · {a.data}
                </div>
              </div>
            </Popup>
          </CircleMarker>
        )
      })}

      <ZoomControl position="bottomright" />
      <ScaleControl position="bottomleft" imperial={false} />
      <ControleFoco foco={foco} />
    </MapContainer>
  )
}
