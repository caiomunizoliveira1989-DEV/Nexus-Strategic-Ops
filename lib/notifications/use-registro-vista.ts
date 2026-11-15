'use client'

import { useEffect, useMemo } from 'react'
import { limparSinais, registrarSinais, type EscopoVista } from '@/lib/notifications/registro'

export function useRegistroVista(escopo: EscopoVista, sinais: { id: string; rotulo: string; valor: string; numero?: number; nivel: 'critico' | 'atencao' | 'info'; meta?: string }[]) {
  const assinatura = useMemo(
    () => sinais.map((s) => s.id + '=' + s.valor).join('|'),
    [sinais],
  )

  useEffect(() => {
    registrarSinais(escopo, sinais)
    return () => limparSinais(escopo)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [escopo, assinatura])
}
