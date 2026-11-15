'use client'

import { useSyncExternalStore } from 'react'
import type { NivelNotificacao } from '@/lib/notifications/store'

export type EscopoVista = 'agricultura' | 'estrategia' | 'conformidade' | 'logistica'

export type SinalPainel = {
  id: string
  escopo: EscopoVista
  rotulo: string
  valor: string
  numero?: number
  nivel: NivelNotificacao
  meta?: string
}

type Entrada = Omit<SinalPainel, 'escopo'>

type Estado = Record<EscopoVista, SinalPainel[]>

const VAZIO: Estado = {
  agricultura: [],
  estrategia: [],
  conformidade: [],
  logistica: [],
}

let estado: Estado = VAZIO
const ouvintes = new Set<() => void>()

function emitir() {
  for (const f of ouvintes) f()
}

function assinatura(lista: SinalPainel[]): string {
  return lista.map((s) => s.id + '=' + s.valor).join('|')
}

export function registrarSinais(escopo: EscopoVista, entrada: Entrada[]) {
  const lista: SinalPainel[] = entrada.map((s) => ({ ...s, escopo }))
  if (assinatura(estado[escopo]) === assinatura(lista)) return
  estado = { ...estado, [escopo]: lista }
  emitir()
}

export function limparSinais(escopo: EscopoVista) {
  if (!estado[escopo].length) return
  estado = { ...estado, [escopo]: [] }
  emitir()
}

function assinar(cb: () => void) {
  ouvintes.add(cb)
  return () => {
    ouvintes.delete(cb)
  }
}

const ler = () => estado
const lerServidor = () => VAZIO

export function useSinaisPainel() {
  return useSyncExternalStore(assinar, ler, lerServidor)
}

export function todosOsSinais(atual: Estado = estado): SinalPainel[] {
  return [
    ...atual.agricultura,
    ...atual.estrategia,
    ...atual.conformidade,
    ...atual.logistica,
  ]
}
