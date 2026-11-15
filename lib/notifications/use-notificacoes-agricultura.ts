'use client'

import { useEffect, useMemo } from 'react'
import {
  limparNotificacoes,
  publicarNotificacoes,
} from '@/lib/notifications/store'
import {
  notificacoesDeAgricultura,
  sinaisDeAgricultura,
} from '@/lib/notifications/agricultura'

export function useNotificacoesAgricultura(dados: unknown) {
  const sinais = useMemo(() => sinaisDeAgricultura(dados), [dados])

  const assinatura = useMemo(
    () => sinais.map((s) => s.id + '=' + s.valor).join('|'),
    [sinais],
  )

  useEffect(() => {
    publicarNotificacoes('agricultura', notificacoesDeAgricultura(sinais))
    return () => limparNotificacoes('agricultura')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assinatura])
}
