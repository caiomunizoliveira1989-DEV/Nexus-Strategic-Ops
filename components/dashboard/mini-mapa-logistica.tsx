'use client'

import { useMemo } from 'react'
import { AlertTriangle } from 'lucide-react'
import { useDadosLogistica } from '@/lib/data/logistica-compartilhada'
import { focarMapa } from '@/lib/notifications/store'

const L = 400
const A = 190

type Ponto = { lat: number; lng: number }
type Marca = { id: string; p: Ponto; grave: boolean; n: number; nome: string; motivo: string }
type Rota = { id: string; de: Ponto; para: Ponto; grave: boolean; atraso: number; navio: string }

const obj = (v: unknown): Record<string, unknown> =>
  v && typeof v === 'object' ? (v as Record<string, unknown>) : {}

function n(v: unknown): number | undefined {
  if (typeof v === 'number' && Number.isFinite(v)) return v
  if (typeof v === 'string') {
    const x = Number(v.replace(',', '.'))
    return Number.isFinite(x) ? x : undefined
  }
  return undefined
}

function par(a: unknown, b: unknown): Ponto | null {
  const lat = n(a)
  const lng = n(b)
  if (lat === undefined || lng === undefined) return null
  if (lat === 0 && lng === 0) return null
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null
  return { lat, lng }
}

function pontoDe(o: Record<string, unknown>): Ponto | null {
  return (
    par(o.lat ?? o.latitude, o.lng ?? o.lon ?? o.longitude) ??
    par(obj(o.coordenadas).lat, obj(o.coordenadas).lng) ??
    par(o.latInicio ?? o.fromLat, o.lngInicio ?? o.fromLng)
  )
}

function rotaDe(o: Record<string, unknown>): { de: Ponto; para: Ponto } | null {
  const r = obj(o.rota ?? o.route ?? o.trajeto)
  const de =
    par(r.origemLat, r.origemLng) ??
    par(obj(r.origem).lat, obj(r.origem).lng) ??
    par(r.fromLat, r.fromLng) ??
    par(o.origemLat, o.origemLng)
  const para =
    par(r.destinoLat, r.destinoLng) ??
    par(obj(r.destino).lat, obj(r.destino).lng) ??
    par(r.toLat, r.toLng) ??
    par(o.destinoLat, o.destinoLng)
  return de && para ? { de, para } : null
}

function proj(pontos: Ponto[]) {
  const base = pontos.length ? pontos : [{ lat: -15, lng: -47 }]
  const la = base.map((p) => p.lat)
  const ln = base.map((p) => p.lng)

  let a1 = Math.min(...la)
  let a2 = Math.max(...la)
  let o1 = Math.min(...ln)
  let o2 = Math.max(...ln)

  const ma = Math.max(a2 - a1, 8) * 0.3
  const mo = Math.max(o2 - o1, 8) * 0.3
  a1 -= ma; a2 += ma; o1 -= mo; o2 += mo

  const m = 16
  return (p: Ponto) => ({
    x: m + ((p.lng - o1) / (o2 - o1)) * (L - m * 2),
    y: m + ((a2 - p.lat) / (a2 - a1)) * (A - m * 2),
  })
}

function curva(a: { x: number; y: number }, b: { x: number; y: number }) {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const d = Math.hypot(dx, dy) || 1
  const off = Math.min(30, d * 0.22)
  const cx = (a.x + b.x) / 2 - (dy / d) * off
  const cy = (a.y + b.y) / 2 + (dx / d) * off
  return 'M' + a.x + ',' + a.y + ' Q' + cx + ',' + cy + ' ' + b.x + ',' + b.y
}

export function MiniMapaLogistica() {
  const { alertas, navios } = useDadosLogistica()

  const { marcas, rotas } = useMemo(() => {
    const grupos = new Map<string, Marca>()

    for (const a of alertas.map(obj)) {
      const p = pontoDe(a)
      if (!p) continue

      const sev = String(a.severidade ?? a.severity ?? '').toLowerCase()
      const risco = String(a.risco ?? a.riscoNivel ?? '').toLowerCase()
      const grave = sev.startsWith('grav') || risco.includes('crit')

      const k = Math.round(p.lat / 2) * 2 + ':' + Math.round(p.lng / 2) * 2
      const atual = grupos.get(k)

      if (atual) {
        atual.n += 1
        atual.grave = atual.grave || grave
        continue
      }

      grupos.set(k, {
        id: k,
        p,
        grave,
        n: 1,
        nome: String(a.local ?? a.municipio ?? a.nome ?? 'Corredor logístico'),
        motivo: String(a.descricao ?? a.motivo ?? a.causa ?? a.tipo ?? 'Alerta operacional'),
      })
    }

    const rotas: Rota[] = []

    for (const nv of navios.map(obj)) {
      const r = rotaDe(nv)
      if (!r) continue
      const sev = String(nv.severidade ?? nv.risco ?? '').toLowerCase()
      rotas.push({
        id: String(nv.id ?? nv.nome ?? rotas.length),
        de: r.de,
        para: r.para,
        grave: sev.startsWith('grav') || sev.includes('crit'),
        atraso: Number(nv.atrasoDias ?? nv.atraso ?? 0) || 0,
        navio: String(nv.nome ?? nv.navio ?? 'Embarcação'),
      })
    }

    return { marcas: [...grupos.values()], rotas }
  }, [alertas, navios])

  const todos = [...marcas.map((m) => m.p), ...rotas.flatMap((r) => [r.de, r.para])]
  const pt = proj(todos)

  const graves = marcas.filter((m) => m.grave).length
  const mod = marcas.length - graves
  const atraso = rotas.reduce((s, r) => s + r.atraso, 0)

  if (!alertas.length) {
    return (
      <div className="grid flex-1 place-items-center rounded-lg border border-border bg-background/40 px-3 py-9 text-center">
        <p className="text-[11.5px] leading-snug text-muted-foreground">
          Nenhum alerta logístico carregado.
          <br />
          Abra a vista Logística para sincronizar a rede.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-2">
      <div className="overflow-hidden rounded-lg border border-border bg-[#070d14]">
        <svg viewBox={'0 0 ' + L + ' ' + A} className="block w-full" role="img">
          <defs>
            <radialGradient id="mini-bg" cx="50%" cy="45%" r="62%">
              <stop offset="0%" stopColor="#0e2233" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#050a10" stopOpacity="1" />
            </radialGradient>
          </defs>

          <rect width={L} height={A} fill="url(#mini-bg)" />

          {[0.25, 0.5, 0.75].map((f) => (
            <line key={'h' + f} x1="0" y1={A * f} x2={L} y2={A * f} stroke="#12293b" strokeWidth="0.6" />
          ))}
          {[0.25, 0.5, 0.75].map((f) => (
            <line key={'v' + f} x1={L * f} y1="0" x2={L * f} y2={A} stroke="#12293b" strokeWidth="0.6" />
          ))}

          {rotas.map((r) => (
            <path
              key={'r' + r.id}
              d={curva(pt(r.de), pt(r.para))}
              fill="none"
              stroke={r.grave ? '#ff4d5e' : '#ffa53c'}
              strokeWidth={r.grave ? 1.6 : 1.2}
              strokeDasharray={r.atraso > 0 ? '4 3' : undefined}
              opacity="0.85"
            />
          ))}

          {marcas.map((m) => {
            const c = pt(m.p)
            const r = 3 + Math.min(4, m.n * 0.8)
            const cor = m.grave ? '#ff4d5e' : '#ffa53c'
            return (
              <g
                key={m.id}
                onClick={() => focarMapa({ lat: m.p.lat, lng: m.p.lng, zoom: 6 })}
                style={{ cursor: 'pointer' }}
              >
                <title>{m.nome + ' · ' + m.n + ' alerta(s) · ' + m.motivo}</title>
                <circle cx={c.x} cy={c.y} r={r + 4} fill={cor} opacity="0.16" />
                <circle cx={c.x} cy={c.y} r={r} fill={cor} />
                {m.n > 1 && (
                  <text x={c.x} y={c.y + 2.6} textAnchor="middle" fontSize="6" fontWeight="700" fill="#06101a">
                    {m.n}
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="size-1.5 rounded-full bg-[#ff4d5e]" /> Grave ({graves})
        </span>
        <span className="flex items-center gap-1">
          <span className="size-1.5 rounded-full bg-[#ffa53c]" /> Moderado ({mod})
        </span>
        <span className="flex items-center gap-1">
          <span className="h-px w-4 bg-[#ff4d5e]" /> Rota impactada ({rotas.length})
        </span>
        {atraso > 0 && (
          <span className="ml-auto flex items-center gap-1 text-neon-amber">
            <AlertTriangle className="size-3" /> {atraso} d de atraso
          </span>
        )}
      </div>
    </div>
  )
}
