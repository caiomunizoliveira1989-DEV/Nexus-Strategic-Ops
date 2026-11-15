import type { DadosConformidade, ItemChecklist } from '@/lib/entities/compliance'

export const MOCK_CONFORMIDADE: DadosConformidade = {
  checklist: {
    titulo: 'Checklist de Conformidade',
    secao: 'Conformidade Regulatória',
    itens: [
      { id: 'licenca-ambiental', nome: 'Licença Ambiental nº 3411', status: 'verificado', verificadoPorIA: true, dataVerificacao: null },
      { id: 'uso-solo', nome: 'Certificação de Uso do Solo', status: 'pendente', verificadoPorIA: true, dataVerificacao: null },
      { id: 'desmatamento', nome: 'Monitoramento de Desmatamento', status: 'verificado', verificadoPorIA: true, dataVerificacao: '2026-01-14' },
      { id: 'uso-agua', nome: 'Relatórios de Uso da Água', status: 'pendente', verificadoPorIA: true, dataVerificacao: '2026-01-08' },
      { id: 'documentacao-legal', nome: 'Documentação Legal', status: 'verificado', verificadoPorIA: true, dataVerificacao: null },
    ],
  },
  area: {
    nome: 'Reserva Florestal Amazônica',
    subtitulo: 'Área A · Mapa de Limites',
    latitude: '3,46° S',
    longitude: '60,01° O',
  },
  creditos: {
    titulo: 'Saldo de Créditos de Carbono',
    saldoAtual: 1450,
    unidade: 'tCO2e',
    crescimentoPct: 12.5,
    serie: [
      { mes: 'jan.', saldo: 620 },
      { mes: 'fev.', saldo: 705 },
      { mes: 'mar.', saldo: 760 },
      { mes: 'abr.', saldo: 830 },
      { mes: 'mai.', saldo: 890 },
      { mes: 'jun.', saldo: 955 },
      { mes: 'jul.', saldo: 1020 },
      { mes: 'ago.', saldo: 1095 },
      { mes: 'set.', saldo: 1160 },
      { mes: 'out.', saldo: 1240 },
      { mes: 'nov.', saldo: 1320 },
      { mes: 'dez.', saldo: 1450 },
    ],
  },
}

export function progressoChecklist(itens: ItemChecklist[]): number {
  if (!itens.length) return 0
  const verificados = itens.filter((i) => i.status === 'verificado').length
  return Math.round((verificados / itens.length) * 100)
}
