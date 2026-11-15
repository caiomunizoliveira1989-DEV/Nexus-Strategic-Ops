'use client'

import { useEffect } from 'react'
import {
  limparNotificacoes,
  publicarNotificacoes,
} from '@/lib/notifications/store'
import {
  gravarSnapshotPainel,
  notificacoesDePainel,
} from '@/lib/notifications/painel'
import { todosOsSinais, useSinaisPainel } from '@/lib/notifications/registro'

export function SincronizarNotificacoesPainel() {
  const porEscopo = useSinaisPainel()
  const sinais = todosOsSinais(porEscopo)

  const assinatura = sinais.map((s) => s.id + '=' + s.valor).join('|')

  useEffect(() => {
    publicarNotificacoes('painel', notificacoesDePainel(sinais))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assinatura])

  /* Grava o retrato ao sair da página ou trocar de aba:
     é o "estado no deslogar" que a próxima sessão compara. */
  useEffect(() => {
    function salvar() {
      gravarSnapshotPainel(todosOsSinais())
    }

    function aoEsconder() {
      if (document.visibilityState === 'hidden') salvar()
    }

    window.addEventListener('pagehide', salvar)
    window.addEventListener('beforeunload', salvar)
    document.addEventListener('visibilitychange', aoEsconder)

    return () => {
      window.removeEventListener('pagehide', salvar)
      window.removeEventListener('beforeunload', salvar)
      document.removeEventListener('visibilitychange', aoEsconder)
      limparNotificacoes('painel')
    }
  }, [])

  return null
}
