/* Liga o painel de sugestões aos alertas do mapa.
   Cada sugestão nasce de um alerta real e carrega o vínculo
   com os navios afetados, para o clique sincronizar a tela. */

import type { AlertaLogistica, CategoriaAlerta } from '@/lib/data/alertas-logistica'

export type TipoSugestao = 'reroteamento' | 'diplomatico' | 'conformidade' | 'risco'
export type SeveridadeSugestao = 'alta' | 'media' | 'baixa'

export type NavioContexto = {
  id: string
  nome: string
  origem: string
  destino: string
  status: string
  atrasoDias: number
  alertas: string[]
}

export type Sugestao = {
  id: string
  tipo: TipoSugestao
  titulo: string
  descricao: string
  acao: string
  badge: string
  severidade: SeveridadeSugestao
  alertas: string[]
  navios: string[]
  impacto: string
  origem: 'regra' | 'ia'
}

export const TIPO_LABEL: Record<TipoSugestao, string> = {
  reroteamento: 'Reroteamento',
  diplomatico: 'Diplomático',
  conformidade: 'Conformidade',
  risco: 'Nível de risco',
}

const TIPO_POR_CATEGORIA: Record<CategoriaAlerta, TipoSugestao> = {
  conflito: 'reroteamento',
  congestao: 'risco',
  clima: 'risco',
  rota: 'diplomatico',
}

/* Plano de ação por alerta. É o conhecimento de domínio do motor. */
const PLANO: Record<string, { acao: string; impacto: string }> = {
  hormuz: {
    acao: 'Suspender trânsito pelo estreito e reprogramar a frota para o Cabo da Boa Esperança',
    impacto: '+12 dias por viagem · seguro de guerra encarece',
  },
  mandeb: {
    acao: 'Desviar do Mar Vermelho e seguir pelo Cabo da Boa Esperança',
    impacto: '+9 a 14 dias por viagem',
  },
  suez: {
    acao: 'Confirmar slot antes da chegada e escalonar as frotas que voltam do Cabo',
    impacto: '+2 dias de espera em berço',
  },
  panama: {
    acao: 'Reservar slot de trânsito e revisar o calado antes da partida',
    impacto: '+4 dias de fila',
  },
  'congestao-global': {
    acao: 'Antecipar bookings e priorizar carga sensível ao prazo',
    impacto: '+5 dias de espera',
  },
  conacri: {
    acao: 'Transferir escala para Dakar ou Abidjan enquanto houver fila',
    impacto: '+10 dias de espera',
  },
  ningbo: {
    acao: 'Realocar carga para Xangai ou Shekou',
    impacto: '+2 dias de atraso',
  },
  tema: {
    acao: 'Antecipar coleta de reefer e reforçar caminhão na evacuação',
    impacto: '+7 dias de espera',
  },
  abidjan: {
    acao: 'Priorizar carga perecível e monitorar liberação de berço',
    impacto: '+2 dias de espera',
  },
  'pacifico-tufoes': {
    acao: 'Reprogramar a janela de trânsito para depois do sistema',
    impacto: '+4 dias por viagem',
  },
  'boa-esperanca': {
    acao: 'Manter o desvio só se o Suez não estiver confirmado liberado',
    impacto: 'economiza 12 dias se retornar ao Suez',
  },
  'norte-europa': {
    acao: 'Escalonar chegadas para evitar pico simultâneo em Roterdã e Antuérpia',
    impacto: '+3 dias de espera',
  },
}

const BADGE: Record<string, string> = {
  conflito: 'Ação imediata',
  congestao: 'Requer ajuste',
  clima: 'Requer ajuste',
  rota: 'Monitorar',
}

function severidadeDe(a: AlertaLogistica): SeveridadeSugestao {
  if (a.severidade === 'grave') return 'alta'
  return 'media'
}

export function gerarSugestoes(
  alertas: AlertaLogistica[],
  navios: NavioContexto[],
): Sugestao[] {
  const porAlerta = new Map<string, string[]>()
  for (const n of navios) {
    for (const id of n.alertas) {
      porAlerta.set(id, [...(porAlerta.get(id) ?? []), n.id])
    }
  }

  const sugestoes: Sugestao[] = []

  for (const a of alertas) {
    const plano = PLANO[a.id]
    if (!plano) continue

    const afetados = porAlerta.get(a.id) ?? []
    const nomes = navios
      .filter((n) => afetados.includes(n.id))
      .map((n) => n.nome)

    sugestoes.push({
      id: 'regra-' + a.id,
      tipo: TIPO_POR_CATEGORIA[a.categoria],
      titulo:
        a.categoria === 'conflito'
          ? 'Evitar ' + a.titulo
          : a.categoria === 'congestao'
            ? 'Contornar fila em ' + a.titulo
            : a.categoria === 'clima'
              ? 'Ajustar janela em ' + a.titulo
              : 'Planejar retomada em ' + a.titulo,
      descricao: a.resumo,
      acao: plano.acao,
      badge: BADGE[a.categoria] ?? 'Monitorar',
      severidade: severidadeDe(a),
      alertas: [a.id],
      navios: afetados,
      impacto:
        (afetados.length > 0
          ? afetados.length + ' navio' + (afetados.length > 1 ? 's' : '') + ' · '
          : '') + plano.impacto,
      origem: 'regra',
    })
  }

  /* Conformidade só quando existe navio cruzando zona de conflito */
  const conflitos = new Set(
    alertas.filter((a) => a.categoria === 'conflito').map((a) => a.id),
  )
  const emConflito = navios.filter((n) => n.alertas.some((id) => conflitos.has(id)))

  if (emConflito.length > 0) {
    sugestoes.push({
      id: 'regra-conformidade',
      tipo: 'conformidade',
      titulo: 'Revisar seguro de guerra e documentação',
      descricao:
        emConflito.map((n) => n.nome).join(', ') +
        ' cruzam zona de conflito. Apólice e certificados precisam cobrir a travessia antes da partida.',
      acao: 'Solicitar endosso de risco de guerra e conferir certificado de origem',
      badge: 'Bloqueante',
      severidade: 'alta',
      alertas: [...conflitos],
      navios: emConflito.map((n) => n.id),
      impacto: emConflito.length + ' navio(s) sem cobertura confirmada',
      origem: 'regra',
    })
  }

  /* Nível de risco agregado da operação */
  const graves = alertas.filter((a) => a.severidade === 'grave')
  const naviosAfetados = navios.filter((n) => n.alertas.length > 0)

  if (graves.length > 0 || naviosAfetados.length > 0) {
    sugestoes.push({
      id: 'regra-risco',
      tipo: 'risco',
      titulo: 'Risco consolidado da operação',
      descricao:
        graves.length +
        ' alertas graves ativos em ' +
        alertas.length +
        ' pontos monitorados. ' +
        naviosAfetados.length +
        ' de ' +
        navios.length +
        ' navios estão em rota afetada.',
      acao:
        naviosAfetados.length > 0
          ? 'Priorizar os navios com maior atraso acumulado e comunicar novos ETAs'
          : 'Manter monitoramento diário e reavaliar se houver novo alerta grave',
      badge: graves.length > 0 ? 'Alto' : 'Moderado',
      severidade: graves.length > 0 ? 'alta' : 'media',
      alertas: graves.map((a) => a.id),
      navios: naviosAfetados.map((n) => n.id),
      impacto: graves.length + ' graves · ' + naviosAfetados.length + ' navios afetados',
      origem: 'regra',
    })
  }

  const ordem: Record<SeveridadeSugestao, number> = { alta: 0, media: 1, baixa: 2 }

  return sugestoes
    .sort((a, b) => ordem[a.severidade] - ordem[b.severidade])
    .slice(0, 6)
}
