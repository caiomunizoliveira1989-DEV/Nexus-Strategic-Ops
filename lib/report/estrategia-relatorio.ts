import {
acharTrimestre,
calcular as calcularFinanceiro,
serieCalculada,
formatBillions,
PARAMETROS as PARAMETROS_FINANCEIROS,
FRETE_TON_MEDIO,
} from '@/lib/data/financial'
import { INDICADORES, agregar, SAFRA, POPULACAO } from '@/lib/data/demanda-oferta'
import { ALOCACAO_CHARTDATA, EFICIENCIA_ALOCACAO } from '@/lib/data/alocacao-recursos'
import { INSIGHTS } from '@/lib/data/insights-estrategicos'

export type EntradaRelatorio = {
ano: number
tri: 1 | 2 | 3 | 4
geradoEm: Date
}

export function montarRelatorio(e: EntradaRelatorio) {
const t = acharTrimestre(e.ano, e.tri)
if (!t) {
    throw new Error('Trimestre inexistente em PIB_AGRO: ' + e.ano + ' T' + e.tri)
}

const calc = calcularFinanceiro(t)

return {
    versao: '1.0',
    referencia: calc.rotulo,
    geradoEm: e.geradoEm.toISOString(),
    origemDados: 'simulado' as const,
    resumoExecutivo: [
    'PIB Agro de ' + formatBillions(calc.pibBrlBi) + ' no ' + calc.rotulo + '.',
    'Custo Brasil de ' + formatBillions(calc.custoBrlBi) + ', com ' +
        formatBillions(calc.tributosBrlBi) + ' em tributos e ' +
        formatBillions(calc.freteBrlBi) + ' em frete.',
    'Resultado de ' + formatBillions(calc.resultadoBrlBi) +
        ' e margem de ' + calc.margemPct.toFixed(1) + '%.',
    'Eficiência de alocação de recursos em ' + EFICIENCIA_ALOCACAO + '%.',
    'Safra ' + SAFRA + ' com ' + (POPULACAO / 1_000_000).toFixed(0) +
        ' milhões de habitantes para alimentar.',
    ],
    financeiro: {
    trimestre: calc,
    serie: serieCalculada(),
    },
    custoBrasil: {
    aliquotaTributaria: PARAMETROS_FINANCEIROS.aliquotaTributaria,
    freteTonMedio: FRETE_TON_MEDIO,
    producaoGraosAnual: PARAMETROS_FINANCEIROS.producaoGraosAnual,
    toneladasNoTrimestre: calc.toneladasMt,
    },
    graos: {
    safra: SAFRA,
    populacao: POPULACAO,
    indicadores: INDICADORES,
    agregado: agregar(),
    },
    alocacao: {
    itens: ALOCACAO_CHARTDATA,
    eficiencia: EFICIENCIA_ALOCACAO,
    },
    insights: INSIGHTS,
}
}

export type RelatorioEstrategia = ReturnType<typeof montarRelatorio>