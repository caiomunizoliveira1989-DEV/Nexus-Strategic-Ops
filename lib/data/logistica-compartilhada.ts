'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'

type Estado = { alertas: unknown[]; navios: unknown[] }
const VAZIO: Estado = { alertas: [], navios: [] }

let estado: Estado = VAZIO
const ouvintes = new Set<() => void>()

export function publicarDadosLogistica(alertas: unknown[], navios: unknown[]) {
  if (estado.alertas === alertas && estado.navios === navios) return
  estado = { alertas, navios }
  for (const f of ouvintes) f()
}

const assinar = (cb: () => void) => {
  ouvintes.add(cb)
  return () => { ouvintes.delete(cb) }
}

const ler = () => estado
const lerServidor = () => VAZIO

export function useDadosLogistica() {
  const doStore = useSyncExternalStore(assinar, ler, lerServidor)
  const [remoto, setRemoto] = useState<Estado>(VAZIO)
  const [tentou, setTentou] = useState(false)
  const vazio = doStore.alertas.length === 0

  useEffect(() => {
    if (!vazio || tentou) return
    setTentou(true)
    let vivo = true

    async function carregar() {
      try {
        const r = await fetch('/api/alertas-logistica', { cache: 'no-store' })
        if (!r.ok) return
        const b = await r.json()
        const alertas = Array.isArray(b) ? b : (b?.alertas ?? b?.data ?? b?.items ?? [])
        if (vivo && Array.isArray(alertas) && alertas.length) {
          setRemoto({ alertas, navios: [] })
        }
      } catch {
        /* sem rede */
      }
    }

    carregar()
    return () => { vivo = false }
  }, [vazio, tentou])

  return doStore.alertas.length ? doStore : remoto
}
