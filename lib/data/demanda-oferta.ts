// Balanço de oferta e demanda agrícola — safra 2025/26
// Fontes: Conab 12º Levantamento (set/26), Conab Perspectivas 2026/27 (ed. 14)

export const SAFRA = '2025/26'
export const POPULACAO = 213_000_000

export type CulturaId = 'soja' | 'milho' | 'arroz' | 'feijao' | 'trigo'
export type ViaConsumo = 'direta' | 'indireta'
export type Status = 'critico' | 'apertado' | 'equilibrado' | 'folgado'

export type Balanco = {
  id: CulturaId
  nome: string
  estoqueInicial: number
  producao: number
  importacao: number
  consumo: number
  exportacao: number
  estoqueFinal: number
  via: ViaConsumo
  fonte: string
}

// Todos os valores em milhões de toneladas (Mt)
export const BALANCOS: Balanco[] = [
  {
    id: 'soja', nome: 'Soja', via: 'indireta',
    estoqueInicial: 10.43, producao: 180.40, importacao: 0.50,
    consumo: 65.90, exportacao: 116.24, estoqueFinal: 9.19,
    fonte: 'Conab 12º Lev. 2025/26',
  },
  {
    id: 'milho', nome: 'Milho', via: 'indireta',
    estoqueInicial: 9.10, producao: 144.00, importacao: 1.50,
    consumo: 95.00, exportacao: 43.90, estoqueFinal: 15.70,
    fonte: 'Conab 12º Lev. + 1º Lev. 2026/27',
  },
  {
    id: 'arroz', nome: 'Arroz', via: 'direta',
    estoqueInicial: 2.05, producao: 11.08, importacao: 7.06,
    consumo: 15.85, exportacao: 2.10, estoqueFinal: 2.24,
    fonte: 'Conab 12º Lev. 2025/26',
  },
  {
    id: 'feijao', nome: 'Feijão', via: 'direta',
    estoqueInicial: 0.2359, producao: 2.950, importacao: 0.0526,
    consumo: 2.680, exportacao: 0.4604, estoqueFinal: 0.0981,
    fonte: 'Conab Perspectivas 2026/27, ed. 14',
  },
  {
    id: 'trigo', nome: 'Trigo', via: 'direta',
    estoqueInicial: 1.26, producao: 5.74, importacao: 6.50,
    consumo: 11.50, exportacao: 0.50, estoqueFinal: 1.50,
    fonte: 'Conab (produção); consumo e importação a confirmar',
  },
]

export type Parametros = {
  /** REC considerada equilibrada para a cultura */
  recNeutra: number
  /** % de variação de preço por ponto percentual de desvio da REC */
  sensibilidade: number
  /** peso da cultura na cesta de alimentos no domicílio */
  pesoCesta: number
  /** fração do preço do grão que chega ao consumidor final */
  repasse: number
}

export const PARAMETROS: Record<CulturaId, Parametros> = {
  soja:   { recNeutra: 0.20, sensibilidade: 2.0, pesoCesta: 0.08, repasse: 0.30 },
  milho:  { recNeutra: 0.20, sensibilidade: 2.0, pesoCesta: 0.14, repasse: 0.30 },
  arroz:  { recNeutra: 0.18, sensibilidade: 2.0, pesoCesta: 0.06, repasse: 0.60 },
  feijao: { recNeutra: 0.10, sensibilidade: 2.0, pesoCesta: 0.03, repasse: 0.60 },
  trigo:  { recNeutra: 0.22, sensibilidade: 2.0, pesoCesta: 0.09, repasse: 0.60 },
}

export type Indicador = Balanco & {
  ofertaTotal: number
  demandaTotal: number
  disponibilidadeInterna: number
  saldo: number
  rec: number
  recNeutra: number
  coberturaMeses: number
  taxaExportacao: number
  perCapitaKgAno: number
  pressaoPct: number
  contribuicaoPp: number
  status: Status
}

function classificar(cobertura: number): Status {
  if (cobertura < 0.75) return 'critico'
  if (cobertura < 1.5) return 'apertado'
  if (cobertura < 2.5) return 'equilibrado'
  return 'folgado'
}

export function calcular(b: Balanco): Indicador {
  const p = PARAMETROS[b.id]

  // Camada 1 — balanço físico
  const ofertaTotal = b.estoqueInicial + b.producao + b.importacao
  const demandaTotal = b.consumo + b.exportacao
  const saldo = ofertaTotal - demandaTotal

  // o que permanece no país após os embarques
  const disponibilidadeInterna = ofertaTotal - b.exportacao

  // Camada 2 — indicadores de tensão
  const rec = b.estoqueFinal / b.consumo
  const coberturaMeses = b.estoqueFinal / (b.consumo / 12)
  const taxaExportacao = b.exportacao / b.producao
  const perCapitaKgAno = (disponibilidadeInterna * 1e9) / POPULACAO

  // Camada 3 — pressão inflacionária
  const pressaoPct = -p.sensibilidade * (rec - p.recNeutra) * 100
  const contribuicaoPp = pressaoPct * p.pesoCesta * p.repasse

  return {
    ...b,
    ofertaTotal,
    demandaTotal,
    disponibilidadeInterna,
    saldo,
    rec,
    recNeutra: p.recNeutra,
    coberturaMeses,
    taxaExportacao,
    perCapitaKgAno,
    pressaoPct,
    contribuicaoPp,
    status: classificar(coberturaMeses),
  }
}

export const INDICADORES: Indicador[] = BALANCOS.map(calcular)

export type Agregado = {
  contribuicaoTotal: number
  porStatus: Record<Status, number>
  maisCritico: Indicador | null
  maiorPressao: Indicador | null
}

export function agregar(inds: Indicador[] = INDICADORES): Agregado {
  const porStatus: Record<Status, number> = { critico: 0, apertado: 0, equilibrado: 0, folgado: 0 }
  for (const i of inds) porStatus[i.status] += 1

  return {
    contribuicaoTotal: inds.reduce((s, i) => s + i.contribuicaoPp, 0),
    porStatus,
    maisCritico: [...inds].sort((a, b) => a.coberturaMeses - b.coberturaMeses)[0] ?? null,
    maiorPressao: [...inds].sort((a, b) => b.pressaoPct - a.pressaoPct)[0] ?? null,
  }
}
