import type { AlertaLogistica } from '@/lib/data/alertas-logistica'
import { PROBLEMA_POR_ALERTA } from '@/lib/data/alertas-problemas'
import type { NavioAvaliado } from '@/lib/data/rotas-navios'
import type { Notificacao, NivelNotificacao } from '@/lib/notifications/store'

const ORDEM: Record<NivelNotificacao, number> = { critico: 0, atencao: 1, info: 2 }

/* Gera notificações a partir dos mesmos dados que alimentam o mapa.
   Se o alerta muda no mapa, a notificação muda junto. */
export function notificacoesDeLogistica(
  alertas: AlertaLogistica[],
  navios: NavioAvaliado[],
): Notificacao[] {
  const itens: Notificacao[] = []

  for (const a of alertas) {
    itens.push({
      id: 'alerta-' + a.id,
      nivel: a.severidade === 'grave' ? 'critico' : 'atencao',
      titulo: a.titulo,
      local: a.local,
      descricao: PROBLEMA_POR_ALERTA[a.id] ?? a.resumo,
      meta: a.risco + ' · ' + a.fonte,
      quando: a.data,
      mapa: { lat: a.lat, lng: a.lng, zoom: 5 },
    })
  }

  for (const n of navios) {
    if (!n.alertas.length) continue

    const zonas = n.alertas.map((a) => a.titulo).join(', ')

    itens.push({
      id: 'navio-' + n.id,
      nivel: n.atrasoDias >= 9 ? 'critico' : 'atencao',
      titulo: n.nome + ' em rota afetada',
      local: n.origem + ' → ' + n.destino,
      descricao:
        zonas +
        '. Previsão ajustada para ' +
        n.etaAjustado +
        ' (+' +
        n.atrasoDias +
        ' dias).',
      meta: (n.codigo ?? 'rota') + ' · ' + n.status,
      quando: 'hoje',
      mapa: n.alertas[0]
        ? {
            lat: n.alertas[0].lat,
            lng: n.alertas[0].lng,
            zoom: 5,
          }
        : { lat: n.centro[0], lng: n.centro[1], zoom: 4 },
    })
  }

  return itens
    .sort((a, b) => ORDEM[a.nivel] - ORDEM[b.nivel])
    .slice(0, 12)
}
