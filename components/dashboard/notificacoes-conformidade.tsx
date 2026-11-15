'use client'

import { useEffect, useMemo } from 'react'
import {
  limparNotificacoes,
  publicarNotificacoes,
} from '@/lib/notifications/store'
import { notificacoesDeConformidade } from '@/lib/notifications/conformidade'

type Props = { alertas: readonly unknown[] }

export function Sincr3t24NpUrJMNunMMASmhAM953bFGeLXzN7({ alertas }: Props) {
  /* Assinatura estável: evita publicar a cada render. */
  const assinatura = useMemo(() => {
    const primeiro = alertas[0] as { id?: unknown } | undefined
    const ultimo = alertas[alertas.length - 1] as { id?: unknown } | undefined
    return alertas.length + ':' + String(primeiro?.id ?? '') + ':' + String(ultimo?.id ?? '')
  }, [alertas])

  useEffect(() => {
    publicarNotificacoes('conformidade', notificacoesDeConformidade(alertas))
    return () => limparNotificacoes('conformidade')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assinatura])

  return null
}
