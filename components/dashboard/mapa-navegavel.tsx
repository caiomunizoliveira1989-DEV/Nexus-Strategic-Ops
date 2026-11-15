'use client'

import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Polygon,
  Popup,
  ScaleControl,
  ZoomControl,
  useMapEvents,
} from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import {
  COR_SEVERIDADE,
  ROTULO_CATEGORIA,
  type ZonaAlerta,
} from '@/lib/data/alertas'

export type Ponto = { id: number; lat: number; lng: number }
export type ModoBase = 'satelite' | 'mapa'

type Props = {
  centro: [number, number]
  zoom: number
  marcacoes: Ponto[]
  marcando: boolean
  modo: ModoBase
  alertas: ZonaAlerta[]
  verDesmatamento: boolean
  verQueimadas: boolean
  onAdicionar: (ponto: [number, number]) => void
  onRemover: (id: number) => void
}

const TILES: Record<ModoBase, { url: string; attribution: string }> = {
  satelite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Imagens &copy; Esri, Maxar, Earthstar Geographics',
  },
  mapa: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri, HERE, Garmin, OpenStreetMap',
  },
}

const ROTULOS =
  'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}'

function Cliques({
  ativo,
  onAdicionar,
}: {
  ativo: boolean
  onAdicionar: (p: [number, number]) => void
}) {
  useMapEvents({
    click(e) {
      if (ativo) onAdicionar([e.latlng.lat, e.latlng.lng])
    },
  })
  return null
}

export default function MapaNavegavel({
  centro,
  zoom,
  marcacoes,
  marcando,
  modo,
  alertas,
  verDesmatamento,
  verQueimadas,
  onAdicionar,
  onRemover,
}: Props) {
  const base = TILES[modo]

  const visiveis = alertas.filter((a) =>
    a.categoria === 'desmatamento' ? verDesmatamento : verQueimadas,
  )

  return (
    <MapContainer
      center={centro}
      zoom={zoom}
      zoomControl={false}
      scrollWheelZoom
      doubleClickZoom
      dragging
      touchZoom
      preferCanvas
      style={{ height: '100%', width: '100%', background: '#05100a' }}
    >
      <TileLayer key={modo} url={base.url} attribution={base.attribution} maxZoom={19} />

      {modo === 'satelite' && <TileLayer url={ROTULOS} maxZoom={19} opacity={0.75} />}

      {/* Polígonos oficiais: laranja = moderado, vermelho = grave */}
      {visiveis.map((zona) => {
        const cor = COR_SEVERIDADE[zona.severidade]

        if (!zona.anel) {
          return (
            <CircleMarker
              key={zona.id}
              center={zona.centro}
              radius={zona.severidade === 'grave' ? 4.5 : 3.5}
              pathOptions={{
                color: cor.traco,
                fillColor: cor.preenchimento,
                fillOpacity: 0.85,
                weight: 1,
              }}
            >
              <Popup>
                <div style={{ minWidth: 180, fontSize: 12, lineHeight: 1.5 }}>
                  <strong style={{ fontSize: 13 }}>
                    {ROTULO_CATEGORIA[zona.categoria]}
                  </strong>
                  <div style={{ color: cor.traco, fontWeight: 700 }}>
                    {cor.rotulo}
                  </div>
                  <div>{zona.local}</div>
                  <div>Detectado em {zona.data}</div>
                  <div style={{ opacity: 0.7 }}>Fonte: {zona.fonte}</div>
                </div>
              </Popup>
            </CircleMarker>
          )
        }

        return (
          <Polygon
            key={zona.id}
            positions={zona.anel}
            pathOptions={{
              color: cor.traco,
              weight: zona.severidade === 'grave' ? 1.5 : 1,
              fillColor: cor.preenchimento,
              fillOpacity: zona.severidade === 'grave' ? 0.5 : 0.32,
            }}
          >
            <Popup>
              <div style={{ minWidth: 190, fontSize: 12, lineHeight: 1.5 }}>
                <strong style={{ fontSize: 13 }}>
                  {ROTULO_CATEGORIA[zona.categoria]}
                </strong>
                <div style={{ color: cor.traco, fontWeight: 700 }}>
                  {cor.rotulo}
                  {zona.hectares > 0
                    ? ' · ' + zona.hectares.toLocaleString('pt-BR') + ' ha'
                    : ''}
                </div>
                <div>{zona.local}</div>
                <div>Detectado em {zona.data}</div>
                <div style={{ opacity: 0.7 }}>Fonte: {zona.fonte}</div>
              </div>
            </Popup>
          </Polygon>
        )
      })}

      {marcacoes.map((m) => (
        <CircleMarker
          key={m.id}
          center={[m.lat, m.lng]}
          radius={6}
          pathOptions={{
            color: '#22d3ee',
            fillColor: '#22d3ee',
            fillOpacity: 0.9,
            weight: 2,
          }}
          eventHandlers={{ click: () => onRemover(m.id) }}
        />
      ))}

      <ZoomControl position="bottomright" />
      <ScaleControl position="bottomleft" imperial={false} />
      <Cliques ativo={marcando} onAdicionar={onAdicionar} />
    </MapContainer>
  )
}
