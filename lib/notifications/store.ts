'use client'

import { useSyncExternalStore } from 'react'

export type NivelNotificacao = 'critico' | 'atencao' | 'info'

export type EscopoNotificacao = 'logistica' | 'conformidade' | 'carbono' | 'geral' | 'estrategia' | 'agricultura' | 'painel'

export type Notificacao = {
  id: string
  nivel: NivelNotificacao
  titulo: string
  local: string
  descricao: string
  meta?: string
  quando: string
  mapa?: { lat: number; lng: number; zoom: number }
}

export type EstadoNotificacoes = {
  escopo: EscopoNotificacao
  itens: Notificacao[]
  lidas: string[]
}

const INICIAL: EstadoNotificacoes = { escopo: 'geral', itens: [], lidas: [] }

let estado: EstadoNotificacoes = INICIAL
const ouvintes = new Set<() => void>()

function emitir() {
  for (const f of ouvintes) f()
}

/* Cada vista publica seu próprio escopo. Ao trocar de vista,
   o escopo anterior é substituído e as lidas são descartadas. */
export function publicarNotificacoes(
  escopo: EscopoNotificacao,
  itens: Notificacao[],
) {
  const ids = new Set(itens.map((i) => i.id))
  estado = {
    escopo,
    itens,
    lidas: estado.escopo === escopo ? estado.lidas.filter((id) => ids.has(id)) : [],
  }
  emitir()
}

export function limparNotificacoes(escopo: EscopoNotificacao) {
  if (estado.escopo !== escopo) return
  estado = INICIAL
  emitir()
}

export function marcarTodasLidas() {
  if (!estado.itens.length) return
  estado = { ...estado, lidas: estado.itens.map((i) => i.id) }
  emitir()
}

function assinar(cb: () => void) {
  ouvintes.add(cb)
  return () => {
    ouvintes.delete(cb)
  }
}

function ler() {
  return estado
}

function lerServidor() {
  return INICIAL
}

export function useNotificacoes() {
  return useSyncExternalStore(assinar, ler, lerServidor)
}

/* Ponte com o mapa: o painel dispara, a vista escuta e centraliza */
export const EVENTO_FOCO = 'nexus:focar-mapa'

export function focarMapa(mapa: { lat: number; lng: number; zoom: number }) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(EVENTO_FOCO, { detail: mapa }))
}
