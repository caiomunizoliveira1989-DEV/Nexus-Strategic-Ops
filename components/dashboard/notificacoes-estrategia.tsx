'use client'

import { useEffect, useMemo } from 'react'
import {
  limparNotificacoes,
  publicarNotificacoes,
} from '@/lib/notifications/store'
import { notificacoesDeEstrategia, sinaisDeEstrategia } from '@/lib/notifications/estrategia'

type Props = { dados: unknown }

export function SincronizacaoEstrategia({ dados }: Props) {
  const sinais = useMemo(() => sinaisDeEstrategia(dados), [dados])

  const assinatura = useMemo(
    () => sinais.map((s) => s.id + '=' + s.valor).join('|'),
    [sinais],
  )

  useEffect(() => {
    publicarNotificacoes('estrategia', notificacoesDeEstrategia(sinais))
    return () => limparNotificacoes('estrategia')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assinatura])

  return null
}
