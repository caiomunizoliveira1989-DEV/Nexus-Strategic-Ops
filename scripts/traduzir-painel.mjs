import { readFileSync, writeFileSync } from 'node:fs'

const DRY = process.env.DRY === '1'

/* Ordem importa: frases longas primeiro, para não serem
   quebradas por substituições menores. */
const MAPA = [
  ['Strategic Overview Dashboard', 'Painel de Visão Estratégica'],
  ['STRATEGIC OVERVIEW DASHBOARD', 'PAINEL DE VISÃO ESTRATÉGICA'],
  ['Financial Impact Analysis', 'Análise de Impacto Financeiro'],
  ['AI-Powered Recommendations', 'Recomendações por IA'],
  ['Resource Allocation by Sector', 'Alocação de Recursos por Setor'],
  ['Logistics Network Status', 'Status da Rede Logística'],
  ['Total Revenue', 'Receita Total'],
  ['Resource Allocation', 'Alocação de Recursos'],
  ['Risk Index', 'Índice de Risco'],
  ['Active Projects', 'Projetos Ativos'],
  ['Supply Chain', 'Cadeia de Suprimentos'],
  ['High Priority', 'Prioridade Alta'],
  ['Medium Priority', 'Prioridade Média'],
  ['Low Priority', 'Prioridade Baixa'],
  ['All Quarters', 'Todos os Trimestres'],
  ['View Details', 'Ver Detalhes'],
  ['Optimize Route', 'Otimizar Rota'],
  ['Inventory Adjustment', 'Ajuste de Estoque'],
  ['Grain Storage', 'Armazenagem de Grãos'],
  [
    'Reroute logistics to increase efficiency across LATAM corridors.',
    'Redirecionar a logística para aumentar a eficiência nos corredores da América Latina.',
  ],
  [
    'Adjust inventory to allow back-orders.',
    'Ajustar o estoque para permitir pedidos em espera.',
  ],
  [
    'Expand grain storage front capacity.',
    'Ampliar a capacidade de armazenagem de grãos.',
  ],
  ['Revenue', 'Receita'],
  ['Expenses', 'Despesas'],
  ['Agriculture', 'Agricultura'],
  ['Logistics', 'Logística'],
  ['Strategy', 'Estratégia'],
  ['Compliance', 'Conformidade'],
  ['Quarter', 'Trimestre'],
  ['Low', 'Baixo'],
  ['Medium', 'Médio'],
  ['High', 'Alto'],
  ['Feb', 'Fev'],
  ['Mar', 'Mar'],
  ['Apr', 'Abr'],
  ['May', 'Mai'],
  ['Jun', 'Jun'],
  ['Jul', 'Jul'],
  ['Aug', 'Ago'],
  ['Sep', 'Set'],
  ['Oct', 'Out'],
  ['Nov', 'Nov'],
  ['Dec', 'Dez'],
]

const escapar = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

let totalArquivos = 0
let totalTrocas = 0

for (const arquivo of process.argv.slice(2)) {
  const antes = readFileSync(arquivo, 'utf8')
  let t = antes
  const trocas = []

  for (const [de, para] of MAPA) {
    /* só dentro de strings literais, para não afetar nomes de variáveis */
    const re = new RegExp('([\'"`])((?:[^\'"`\\\\]|\\\\.)*?)' + escapar(de) + '((?:[^\'"`\\\\]|\\\\.)*?)(\\1)', 'g')

    const novo = t.replace(re, (m, q1, pre, pos, q2) => {
      trocas.push(de + ' → ' + para)
      return q1 + pre + para + pos + q2
    })

    if (novo !== t) t = novo
  }

  if (t === antes) {
    console.log('sem mudanca: ' + arquivo)
    continue
  }

  totalArquivos += 1
  totalTrocas += trocas.length

  console.log('\n' + arquivo)
  for (const s of [...new Set(trocas)]) console.log('  ' + s)

  if (!DRY) writeFileSync(arquivo, t)
}

console.log(
  '\n' + (DRY ? 'PREVIA: ' : 'APLICADO: ') +
    totalTrocas + ' substituicoes em ' + totalArquivos + ' arquivo(s)',
)
