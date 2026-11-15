'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { Layers, Loader2 } from 'lucide-react'
import { Panel } from '@/components/dashboard/panel'
import { PainelAlertasGlobais } from '@/components/dashboard/painel-alertas-globais'
import { PainelEtaNavios } from '@/components/dashboard/painel-eta-navios'
import { Sincr3t24NpUrJMNunMMASmhAM953bFGeLXzN7 } from '@/components/dashboard/notificacoes-logistica'
import { PainelSugestoes } from '@/components/dashboard/painel-sugestoes'
import type { AlertaLogistica, CategoriaAlerta } from '@/lib/data/alertas-logistica'
import { montarNavios, type NavioAvaliado } from '@/lib/data/rotas-navios'
import type { NavioContexto, Sugestao } from '@/lib/data/sugestoes'
import { gerarSugestoes } from '@/lib/data/sugestoes'
import type { Foco, ModoBase } from '@/components/dashboard/mapa-logistica'
import { MOCK_LOGISTICS } from '@/lib/mock/logistics'

const MapaLogistica = dynamic(() => import('@/components/dashboard/mapa-logistica'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-[#0a1018]">
      <Loader2 className="size-5 animate-spin text-muted-foreground" />
    </div>
  ),
})

const CHAVE_DIA = 'nexus:alertas-logistica:v1'

type Resposta = {
  atualizadoEm: string
  referencia: string
  fontes: string[]
  alertas: AlertaLogistica[]
  resumo: { total: number; graves: number; moderadas: number; conflitos: number }
}

const FILTRO_INICIAL: Record<CategoriaAlerta, boolean> = {
  conflito: true,
  clima: true,
  congestao: true,
  rota: true,
}

function formatToday(date: Date): string {
  return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
}

function hoje(): string {
  return new Date().toISOString().slice(0, 10)
}

function paraContexto(n: NavioAvaliado): NavioContexto {
  return {
    id: n.id,
    nome: n.nome,
    origem: n.origem,
    destino: n.destino,
    status: n.status,
    atrasoDias: n.atrasoDias,
    alertas: n.alertas.map((a) => a.id),
  }
}

export function LogisticsView() {
  const [todayLabel, setTodayLabel] = useState<string | null>(null)
  const [modo, setModo] = useState<ModoBase>('satelite')
  const [dados, setDados] = useState<Resposta | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [filtro, setFiltro] = useState(FILTRO_INICIAL)
  const [foco, setFoco] = useState<Foco>(null)
  const [navioSelecionado, setNavioSelecionado] = useState<string | null>(null)
  const [alertaSelecionado, setAlertaSelecionado] = useState<string | null>(null)
  const [sugestoesIA, setSugestoesIA] = useState<Sugestao[] | null>(null)
  const [analisando, setAnalisando] = useState(false)
  const [sugestaoSelecionada, setSugestaoSelecionada] = useState<string | null>(null)

  const carregar = useCallback(async (forcar = false) => {
    if (!forcar) {
      try {
        const bruto = localStorage.getItem(CHAVE_DIA)
        if (bruto) {
          const salvo = JSON.parse(bruto)
          if (salvo?.dia === hoje() && Array.isArray(salvo?.dados?.alertas)) {
            setDados(salvo.dados)
            setCarregando(false)
            return
          }
        }
      } catch {
        /* cache inválido: segue para a busca */
      }
    }

    setCarregando(true)
    try {
      const r = await fetch('/api/alertas-logistica', { cache: 'no-store' })
      const json: Resposta = await r.json()
      setDados(json)
      setSugestoesIA(null)
      try {
        localStorage.setItem(CHAVE_DIA, JSON.stringify({ dia: hoje(), dados: json }))
      } catch {
        /* sem localStorage: busca de novo no próximo acesso */
      }
    } catch {
      setDados(null)
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    setTodayLabel(formatToday(new Date()))
    carregar()
  }, [carregar])

  const alertas = useMemo(() => dados?.alertas ?? [], [dados])
  const resumo = dados?.resumo

  const navios = useMemo(() => montarNavios(MOCK_LOGISTICS.ships, alertas), [alertas])
  const contexto = useMemo(() => navios.map(paraContexto), [navios])

  const sugestoesRegras = useMemo(
    () => gerarSugestoes(alertas, contexto),
    [alertas, contexto],
  )

  const sugestoes = sugestoesIA ?? sugestoesRegras
  const modoSugestoes: 'regras' | 'ia' = sugestoesIA ? 'ia' : 'regras'

  async function analisarComIA() {
    setAnalisando(true)
    try {
      const r = await fetch('/api/sugestoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertas, navios: contexto }),
      })
      const json = await r.json()
      setSugestoesIA(Array.isArray(json?.sugestoes) ? json.sugestoes : null)
    } catch {
      setSugestoesIA(null)
    } finally {
      setAnalisando(false)
    }
  }

  function selecionarAlerta(a: AlertaLogistica) {
    setAlertaSelecionado(a.id)
    setNavioSelecionado(null)
    setSugestaoSelecionada(null)
    setFoco({ lat: a.lat, lng: a.lng, zoom: 5, chave: a.id + Date.now() })
  }

  function selecionarNavio(navio: NavioAvaliado) {
    setNavioSelecionado(navio.id)
    setAlertaSelecionado(navio.alertas[0]?.id ?? null)
    setSugestaoSelecionada(null)

    const alvo = navio.alertas[0]
    setFoco(
      alvo
        ? { lat: alvo.lat, lng: alvo.lng, zoom: 5, chave: navio.id + Date.now() }
        : { lat: navio.centro[0], lng: navio.centro[1], zoom: 4, chave: navio.id + Date.now() },
    )
  }

  function selecionarSugestao(s: Sugestao) {
    setSugestaoSelecionada(s.id)
    setAlertaSelecionado(s.alertas[0] ?? null)
    setNavioSelecionado(s.navios[0] ?? null)

    const alvo = alertas.find((a) => a.id === s.alertas[0])
    if (alvo) {
      setFoco({ lat: alvo.lat, lng: alvo.lng, zoom: 5, chave: s.id + Date.now() })
    }
  }

  return (
    <div className="space-y-6">
      <Sincr3t24NpUrJMNunMMASmhAM953bFGeLXzN7 alertas={alertas} navios={navios} onFocar={setFoco} />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Visão Geral de Logística{' '}
          <span className="font-normal text-muted-foreground">
            | {todayLabel ?? ''}
          </span>
        </h1>
        {resumo && (
          <span className="rounded-lg border border-neon-red/30 bg-neon-red/5 px-3 py-1 text-[11px] font-semibold text-neon-red">
            {resumo.graves} alertas graves · {resumo.total} monitorados
          </span>
        )}
      </div>

      <div className="relative h-[520px] overflow-hidden rounded-2xl border border-border bg-[#0a1018]">
        <MapaLogistica
          modo={modo}
          alertas={alertas}
          filtro={filtro}
          foco={foco}
          navios={navios}
          navioSelecionadoId={navioSelecionado}
        />

        <button
          onClick={() => setModo((m) => (m === 'satelite' ? 'mapa' : 'satelite'))}
          title={modo === 'satelite' ? 'Ver mapa de ruas' : 'Ver satélite'}
          className="absolute right-4 top-4 z-[1000] flex items-center gap-2 rounded-lg border border-neon-green/40 bg-background/80 px-3 py-2 text-sm text-neon-green backdrop-blur transition-colors hover:bg-neon-green/10"
        >
          <Layers className="size-4" /> Camadas ▾
        </button>

        <div className="absolute left-4 top-4 z-[1000] max-w-[88%]">
          <PainelAlertasGlobais
            alertas={alertas}
            carregando={carregando}
            atualizadoEm={dados?.atualizadoEm ?? null}
            filtro={filtro}
            onAlternarCategoria={(c) =>
              setFiltro((atual) => ({ ...atual, [c]: !atual[c] }))
            }
            onSelecionar={selecionarAlerta}
            onAtualizar={() => carregar(true)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Panel>
          <PainelEtaNavios
            navios={navios}
            selecionadoId={navioSelecionado}
            alertaSelecionadoId={alertaSelecionado}
            onSelecionar={selecionarNavio}
          />
        </Panel>

        <Panel>
          <PainelSugestoes
            sugestoes={sugestoes}
            modo={modoSugestoes}
            carregando={analisando}
            onAnalisar={analisarComIA}
            onSelecionar={selecionarSugestao}
            selecionadaId={sugestaoSelecionada}
          />
        </Panel>
      </div>
    </div>
  )
}
