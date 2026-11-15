'use client'

import dynamic from 'next/dynamic'
import { Component, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { Ship, RefreshCw } from 'lucide-react'

type Alerta = { categoria?: string; [k: string]: unknown }

/* ssr:false porque o Leaflet le window na montagem */
const Mapa = dynamic(() => import('@/components/dashboard/mapa-logistica').then((m) => m.default), {
ssr: false,
loading: () => <div className="h-full w-full animate-pulse rounded-lg bg-muted/30" />,
}) as unknown as React.ComponentType<Record<string, unknown>>

const Painel = dynamic(
() => import('@/components/dashboard/painel-alertas-globais').then((m) => m.PainelAlertasGlobais),
{ ssr: false },
) as unknown as React.ComponentType<Record<string, unknown>>

/* Isola falha de prop: o card degrada, o dashboard continua de pe */
class Protegido extends Component<{ children: ReactNode; nome: string }, { erro: boolean }> {
state = { erro: false }
static getDerivedStateFromError() {
return { erro: true }
}
render() {
if (this.state.erro) {
return (
<div className="grid h-full place-items-center px-3 text-center">
<p className="text-[11px] leading-snug text-muted-foreground">
Nao foi possivel montar {this.props.nome} neste card.
<br />
A vista completa de Logistica continua funcionando.
</p>
</div>
)
}
return this.props.children
}
}

export function CardRedeLogistica() {
const [alertas, setAlertas] = useState<Alerta[]>([])
const [navios, setNavios] = useState<Record<string, unknown>[]>([])
const [carregando, setCarregando] = useState(true)
const [atualizadoEm, setAtualizadoEm] = useState('')
const [navioSelecionadoId, setNavioSelecionadoId] = useState<string | null>(null)
const [desligadas, setDesligadas] = useState<Record<string, boolean>>({})

const carregar = useCallback(async () => {
setCarregando(true)
try {
const [ra, rn] = await Promise.all([
fetch('/api/alertas-logistica', { cache: 'no-store' }).catch(() => null),
fetch('/api/rotas-navios', { cache: 'no-store' }).catch(() => null),
])

if (ra && ra.ok) {
const b = await ra.json()
const lista = Array.isArray(b) ? b : (b?.alertas ?? b?.data ?? b?.items ?? [])
if (Array.isArray(lista)) setAlertas(lista as Alerta[])
}

if (rn && rn.ok) {
const bn = await rn.json()
const lista = Array.isArray(bn) ? bn : (bn?.navios ?? bn?.rotas ?? bn?.data ?? [])
if (Array.isArray(lista)) setNavios(lista as Record<string, unknown>[])
}
} catch {
/* sem rede */
} finally {
setCarregando(false)
setAtualizadoEm(new Date().toLocaleTimeString('pt-BR'))
}
}, [])

useEffect(() => {
carregar()
}, [carregar])

/* filtro no formato que o mapa espera: Record<categoria, boolean>.
Toda categoria que aparece nos alertas comeca visivel. */
const filtro = useMemo(() => {
const base: Record<string, boolean> = {}
for (const a of alertas) {
const c = a.categoria
if (typeof c === 'string' && !(c in base)) base[c] = !desligadas[c]
}
return base
}, [alertas, desligadas])

const alternarFiltro = useCallback((categoria: string) => {
setDesligadas((prev) => ({ ...prev, [categoria]: !prev[categoria] }))}, [])

const contagens = useMemo(() => {
const graves = alertas.filter((a) =>
/grav/i.test(String(a.severidade ?? a.severity ?? '')),
).length
return { total: alertas.length, graves, moderados: alertas.length - graves }
}, [alertas])

const propsMapa = useMemo(
() => ({
modo: undefined,
alertas: alertas,
filtro: filtro,
foco: undefined,
navios: navios,
navioSelecionadoId: navios,
}),
[alertas, navios, filtro, carregando, atualizadoEm, navioSelecionadoId, contagens, carregar, alternarFiltro],
)

const propsPainel = useMemo(
() => ({
alertas: alertas,
carregando: carregando,
atualizadoEm: atualizadoEm,
filtro: filtro,
onAlternarCategoria: (() => {}),
onSelecionar: (() => {}),
onAtualizar: (() => {}),
}),
[alertas, navios, filtro, carregando, atualizadoEm, navioSelecionadoId, contagens, carregar, alternarFiltro],
)

return (
<div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card p-3">
<div className="mb-2 flex shrink-0 items-center gap-2">
<Ship className="size-4 text-neon-cyan" />
<h4 className="text-[13.5px] font-semibold text-foreground">Status da Rede Logística</h4>
{contagens.graves > 0 && (
<span className="text-[10px] font-semibold text-neon-red">{contagens.graves} grave(s)</span>
)}
<button
type="button"
onClick={carregar}
title="Recarregar alertas"
className="ml-auto grid size-6 place-items-center rounded text-muted-foreground transition-colors hover:text-foreground"
>
<RefreshCw className={'size-3.5' + (carregando ? ' animate-spin' : '')} />
</button>
</div>

<div className="min-h-[190px] w-full flex-1 overflow-hidden rounded-lg border border-border [&_.leaflet-container]:!h-full [&_.leaflet-container]:!w-full [&_.leaflet-control-attribution]:hidden">
<Protegido nome="o mapa">
<Mapa {...propsMapa} />
</Protegido>
</div>

<div className="card-logistica-painel mt-2 min-h-0 w-full flex-1 overflow-x-hidden">
<Painel {...propsPainel} />
</div>
</div>
)
}
