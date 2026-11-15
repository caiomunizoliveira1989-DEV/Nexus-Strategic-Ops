'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import {
  MapPin,
  Maximize2,
  Trash2,
  Crosshair,
  Loader2,
  Layers,
  RefreshCw,
} from 'lucide-react'
import type { AreaMonitorada } from '@/lib/entities/compliance'
import type { Ponto, ModoBase } from '@/components/dashboard/mapa-navegavel'
import { COR_SEVERIDADE, type ZonaAlerta } from '@/lib/data/alertas'
import { Sincr3t24NpUrJMNunMMASmhAM953bFGeLXzN7 } from '@/components/dashboard/notificacoes-conformidade'
import { sinaisDeConformidadePainel } from '@/lib/notifications/painel-adaptadores'
import { useRegistroVista } from '@/lib/notifications/use-registro-vista'

const MapaNavegavel = dynamic(
  () => import('@/components/dashboard/mapa-navegavel'),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-[#05100a]">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    ),
  },
)

let contador = 0

type Resposta = {
  alertas: ZonaAlerta[]
  atualizadoEm: string
  falhas: string[]
  resumo: { total: number; graves: number; moderadas: number; hectares: number }
}

export function ComplianceMap({ area }: { area: AreaMonitorada }) {
  const [marcacoes, setMarcacoes] = useState<Ponto[]>([])
  const [marcando, setMarcando] = useState(false)
  const [modo, setModo] = useState<ModoBase>('satelite')
  const [dados, setDados] = useState<Resposta | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [verDesmatamento, setVerDesmatamento] = useState(true)
  const [verQueimadas, setVerQueimadas] = useState(true)

  async function carregar() {
    setCarregando(true)
    try {
      const r = await fetch('/api/alertas', { cache: 'no-store' })
      setDados(await r.json())
    } catch {
      setDados(null)
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    carregar()
  }, [])

  function adicionar(ponto: [number, number]) {
    contador += 1
    setMarcacoes((atual) => [...atual, { id: contador, lat: ponto[0], lng: ponto[1] }])
  }

  function remover(id: number) {
    setMarcacoes((atual) => atual.filter((m) => m.id !== id))
  }

  const resumo = dados?.resumo
  const totalVisivel = dados
    ? dados.alertas.filter((a) =>
        a.categoria === 'desmatamento' ? verDesmatamento : verQueimadas,
      ).length
    : 0

  useRegistroVista('conformidade', sinaisDeConformidadePainel([]))
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <Sincr3t24NpUrJMNunMMASmhAM953bFGeLXzN7 alertas={dados?.alertas ?? []} />
      <div className="group relative z-0 min-h-0 flex-1 overflow-hidden rounded-xl border border-border transition-colors duration-200 hover:border-neon-green/50">
        <MapaNavegavel
          centro={[-14, -52]}
          zoom={4}
          marcacoes={marcacoes}
          marcando={marcando}
          modo={modo}
          alertas={dados?.alertas ?? []}
          verDesmatamento={verDesmatamento}
          verQueimadas={verQueimadas}
          onAdicionar={adicionar}
          onRemover={remover}
        />

        <div className="absolute right-2 top-2 z-[1000] flex gap-1">
          <button
            onClick={carregar}
            title="Recarregar dados oficiais"
            className="grid size-7 place-items-center rounded-lg border border-border bg-card/90 text-muted-foreground backdrop-blur transition-colors hover:text-foreground"
          >
            <RefreshCw className={'size-3.5 ' + (carregando ? 'animate-spin' : '')} />
          </button>
          <button
            onClick={() => setModo((m) => (m === 'satelite' ? 'mapa' : 'satelite'))}
            title={modo === 'satelite' ? 'Ver mapa de ruas' : 'Ver satélite'}
            className="grid size-7 place-items-center rounded-lg border border-border bg-card/90 text-muted-foreground backdrop-blur transition-colors hover:text-foreground"
          >
            <Layers className="size-3.5" />
          </button>
          <button
            onClick={() => setMarcando((v) => !v)}
            title={marcando ? 'Marcação ativa' : 'Marcação desativada'}
            className={
              'grid size-7 place-items-center rounded-lg border backdrop-blur transition-colors ' +
              (marcando
                ? 'border-neon-green/50 bg-neon-green/20 text-neon-green'
                : 'border-border bg-card/90 text-muted-foreground hover:text-foreground')
            }
          >
            <Crosshair className="size-3.5" />
          </button>
          <button
            onClick={() => setMarcacoes([])}
            title="Limpar marcações"
            className="grid size-7 place-items-center rounded-lg border border-border bg-card/90 text-muted-foreground backdrop-blur transition-colors hover:text-neon-amber"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>

        {/* Legenda com filtros — ampliada */}
        <div className="absolute left-2 top-2 z-[1000] w-60 rounded-xl border border-border bg-card/95 px-3 py-2.5 shadow-lg backdrop-blur">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-foreground">
            Alertas oficiais
          </p>

          <button
            onClick={() => setVerDesmatamento((v) => !v)}
            className={
              'flex w-full items-center gap-2 rounded px-1 py-1 text-left text-[12px] font-medium transition-colors ' +
              (verDesmatamento
                ? 'text-foreground hover:bg-background/50'
                : 'text-muted-foreground/50 line-through')
            }
          >
            <span className="size-2 rounded-full bg-neon-green" />
            Desmatamento
          </button>

          <button
            onClick={() => setVerQueimadas((v) => !v)}
            className={
              'flex w-full items-center gap-2 rounded px-1 py-1 text-left text-[12px] font-medium transition-colors ' +
              (verQueimadas
                ? 'text-foreground hover:bg-background/50'
                : 'text-muted-foreground/50 line-through')
            }
          >
            <span className="size-2 rounded-full bg-neon-amber" />
            Queimada
          </button>

          <div className="mt-2 flex flex-col gap-1.5 border-t border-border pt-2">
            {(['grave', 'moderada'] as const).map((sev) => (
              <span
                key={sev}
                className="flex items-center gap-2 text-[12px] text-foreground"
              >
                <span
                  className="size-3 rounded-sm"
                  style={{
                    backgroundColor: COR_SEVERIDADE[sev].preenchimento,
                    opacity: sev === 'grave' ? 0.9 : 0.6,
                  }}
                />
                {COR_SEVERIDADE[sev].rotulo}
              </span>
            ))}
          </div>

          <p className="mt-2 border-t border-border pt-2 text-[11px] leading-snug text-muted-foreground">
            {carregando
              ? 'Consultando INPE…'
              : resumo
                ? totalVisivel.toLocaleString('pt-BR') +
                  ' áreas · ' +
                  resumo.graves +
                  ' graves'
                : 'Fonte indisponível'}
          </p>
        </div>

        {carregando && (
          <div className="absolute inset-0 z-[999] grid place-items-center bg-black/40 backdrop-blur-[1px]">
            <span className="flex items-center gap-2 rounded-lg border border-border bg-card/95 px-3 py-1.5 text-[11px] text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" />
              Carregando dados do INPE
            </span>
          </div>
        )}
      </div>

      <div className="flex shrink-0 flex-col justify-between gap-1.5 rounded-xl border border-border bg-card/40 p-2.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-neon-green/50 hover:bg-card/70 hover:shadow-[0_0_28px_-10px_var(--neon-green)]">
        <div className="flex items-start gap-2.5">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-neon-green/10 text-neon-green">
            <MapPin className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-base font-semibold leading-tight text-foreground">
              {area.nome}
            </p>
            <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
              {area.subtitulo}
            </p>
          </div>
          <Maximize2 className="size-4 shrink-0 text-muted-foreground" />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-border bg-background/40 px-2 py-1">
            <p className="text-[9px] uppercase tracking-wide text-muted-foreground">
              Área em alerta
            </p>
            <p className="text-sm font-semibold text-foreground">
              {resumo ? resumo.hectares.toLocaleString('pt-BR') + ' ha' : '—'}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-background/40 px-2 py-1">
            <p className="text-[9px] uppercase tracking-wide text-muted-foreground">
              Polígonos
            </p>
            <p className="text-sm font-semibold text-foreground">
              {resumo ? resumo.total.toLocaleString('pt-BR') : '—'}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-border pt-1.5">
          <p className="text-[9px] leading-tight text-muted-foreground">
            DETER/PRODES · Queimadas — INPE
          </p>
          <span className="rounded-lg border border-neon-amber/30 bg-neon-amber/5 px-2 py-0.5 text-[10px] font-semibold text-neon-amber">
            {marcacoes.length} marcações
          </span>
        </div>
      </div>
    </div>
  )
}
