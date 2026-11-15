'use client'

import { useEffect } from 'react'
import {
  EVENTO_FOCO,
  limparNotificacoes,
  publicarNotificacoes,
} from '@/lib/notifications/store'
import { notificacoesDeLogistica } from '@/lib/notifications/logistica'
import type { AlertaLogistica } from '@/lib/data/alertas-logistica'
import type { NavioAvaliado } from '@/lib/data/rotas-navios'
import { publicarDadosLogistica } from '@/lib/data/logistica-compartilhada'

type Foco = { lat: number; lng: number; zoom: number; chave: string }

type Props = {
  alertas: AlertaLogistica[]
  navios: NavioAvaliado[]
  onFocar?: (foco: Foco) => void
}

const SEM_FOCO = () => {}

export function Sincr3t24NpUrJMNunMMASmhAM953bFGeLXzN7({ alertas, navios, onFocar }: Props) {
  useEffect(() => {
    publicarNotificacoes('logistica', notificacoesDeLogistica(alertas, navios))
    publicarDadosLogistica(alertas, navios)
    return () => limparNotificacoes('logistica')
  }, [alertas, navios])

  const focar = onFocar ?? SEM_FOCO

  useEffect(() => {
    function aoFocar(e: Event) {
      const d = (e as CustomEvent).detail
      if (!d) return
      focar({ lat: d.lat, lng: d.lng, zoom: d.zoom ?? 5, chave: 'notif-' + Date.now() })
    }

    window.addEventListener(EVENTO_FOCO, aoFocar)
    return () => window.removeEventListener(EVENTO_FOCO, aoFocar)
  }, [focar])

  return null
}
