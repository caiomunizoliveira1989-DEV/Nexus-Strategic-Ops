/* Fonte única do cálculo de carbono.
   A memória exibida na tela é derivada daqui, então o número
   na tela e o número da conta nunca divergem. */

export type TipoEtapa = 'entrada' | 'produto' | 'desconto' | 'resultado'

export type EtapaCarbono = {
  id: string
  rotulo: string
  expressao: string
  valor: number
  unidade: string
  tipo: TipoEtapa
}

export const PARAMETROS_CARBONO = {
  areaElegivelHa: 12.5,
  sequestroTco2PorHaAno: 8,
  reservaNaoPermanenciaPct: 20,
  areaEmAlertaHa: 0,
  precoReferenciaBrl: 85,
  saldoEmCarteira: 1450,
}

export const SERIE_MENSAL = [
  380, 440, 505, 575, 650, 730, 812, 900, 995, 1090, 1289, 1450,
]

const num = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 })

export function calcularCarbono() {
  const p = PARAMETROS_CARBONO

  const bruto = p.areaElegivelHa * p.sequestroTco2PorHaAno
  const reserva = (bruto * p.reservaNaoPermanenciaPct) / 100
  const desconto = p.areaEmAlertaHa * p.sequestroTco2PorHaAno
  const liquido = Math.max(0, bruto - reserva - desconto)
  const valor = liquido * p.precoReferenciaBrl

  const etapas: EtapaCarbono[] = [
    {
      id: 'area',
      rotulo: 'Área elegível',
      expressao: 'perímetro da reserva sem embargo',
      valor: p.areaElegivelHa,
      unidade: 'ha',
      tipo: 'entrada',
    },
    {
      id: 'fator',
      rotulo: 'Sequestro por hectare',
      expressao: 'fator conservador para floresta amazônica',
      valor: p.sequestroTco2PorHaAno,
      unidade: 'tCO₂e/ha·ano',
      tipo: 'entrada',
    },
    {
      id: 'bruto',
      rotulo: 'Créditos brutos',
      expressao:
        num.format(p.areaElegivelHa) +
        ' ha × ' +
        num.format(p.sequestroTco2PorHaAno) +
        ' tCO₂e',
      valor: bruto,
      unidade: 'tCO₂e/ano',
      tipo: 'produto',
    },
    {
      id: 'reserva',
      rotulo: 'Reserva de não permanência',
      expressao: p.reservaNaoPermanenciaPct + '% do bruto retido como garantia',
      valor: -reserva,
      unidade: 'tCO₂e',
      tipo: 'desconto',
    },
    {
      id: 'alerta',
      rotulo: 'Áreas em alerta sobrepostas',
      expressao: 'desmatamento ou queimada dentro do perímetro',
      valor: -desconto,
      unidade: 'tCO₂e',
      tipo: 'desconto',
    },
    {
      id: 'liquido',
      rotulo: 'Créditos líquidos',
      expressao: 'bruto − reserva − alertas',
      valor: liquido,
      unidade: 'tCO₂e/ano',
      tipo: 'resultado',
    },
  ]

  return { etapas, bruto, reserva, desconto, liquido, valor }
}
