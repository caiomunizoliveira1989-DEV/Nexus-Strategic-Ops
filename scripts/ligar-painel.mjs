import { readdirSync, readFileSync, writeFileSync } from 'node:fs'

const DRY = process.env.DRY === '1'

const MARCADORES = [
  /Strategic Overview/i,
  /Vis[aã]o (Geral )?Estrat[eé]gica/i,
  /Total Revenue/i,
  /Receita Total/i,
  /Resource Allocation by Sector/i,
  /Aloca[cç][aã]o de Recursos por Setor/i,
  /dataKey="revenue"/,
  /AI-Powered Recommendations/i,
  /Recomenda[cç][oõ]es por IA/i,
]

/* 1. localizar o arquivo do Painel */
function pontuar(arquivo) {
  let t
  try {
    t = readFileSync(arquivo, 'utf8')
  } catch {
    return 0
  }
  let p = 0
  for (const re of MARCADORES) if (re.test(t)) p += 1
  return p
}

const candidatos = []
for (const f of readdirSync('components/dashboard/views')) {
  if (!f.endsWith('.tsx')) continue
  const arq = 'components/dashboard/views/' + f
  candidatos.push([arq, pontuar(arq)])
}

candidatos.sort((a, b) => b[1] - a[1])

console.log('ranking de views:')
for (const [a, p] of candidatos) console.log('  ' + p + '  ' + a)

if (!candidatos.length || candidatos[0][1] < 2) {
  console.error('\nNAO ACHEI a view do Painel com confianca. Nada foi escrito.')
  console.error('Rode: grep -rln "Strategic Overview\\|Receita Total" components --include="*.tsx"')
  process.exit(1)
}

const ALVO = candidatos[0][0]
console.log('\nview escolhida: ' + ALVO)

let t = readFileSync(ALVO, 'utf8')

/* 2. remover tentativas anteriores */
const antes = t.split('\n').length
t = t
  .split('\n')
  .filter((l) => !l.trim().startsWith('<PainelVistas') && !l.trim().startsWith('<SincronizarNotificacoesPainel'))
  .join('\n')
const removidas = antes - t.split('\n').length
if (removidas) console.log('linhas antigas removidas: ' + removidas)

/* 3. localizar o corpo do componente */
const m = /export\s+(?:default\s+)?function\s+[A-Za-z_$][\w$]*/.exec(t)
if (!m) {
  console.error('Nao achei o componente exportado. Nada foi escrito.')
  process.exit(1)
}

let i = t.indexOf('(', m.index)
let nivel = 0
for (; i < t.length; i += 1) {
  if (t[i] === '(') nivel += 1
  else if (t[i] === ')') {
    nivel -= 1
    if (nivel === 0) {
      i += 1
      break
    }
  }
}

const abreCorpo = t.indexOf('{', i)
if (abreCorpo < 0) {
  console.error('Nao achei o corpo do componente. Nada foi escrito.')
  process.exit(1)
}

/* 4. achar o return e a tag raiz do JSX */
const idxReturn = t.indexOf('return', abreCorpo)
if (idxReturn < 0) {
  console.error('Nao achei return no componente. Nada foi escrito.')
  process.exit(1)
}

const idxTag = t.indexOf('<', idxReturn)
if (idxTag < 0) {
  console.error('Nao achei JSX apos o return. Nada foi escrito.')
  process.exit(1)
}

let ponto
if (t.slice(idxTag, idxTag + 2) === '<>') {
  ponto = idxTag + 2
} else {
  let j = idxTag
  let aspas = null
  let chaves = 0
  while (j < t.length) {
    const c = t[j]
    if (aspas) {
      if (c === aspas) aspas = null
    } else if (c === '"' || c === "'" || c === '`') aspas = c
    else if (c === '{') chaves += 1
    else if (c === '}') chaves -= 1
    else if (c === '>' && chaves === 0) break
    j += 1
  }
  ponto = j + 1
}

const linhaEm = (pos) => {
  const ini = t.lastIndexOf('\n', pos) + 1
  return t.slice(ini, t.indexOf('\n', pos))
}

const indent =
  (linhaEm(t.lastIndexOf('\n', ponto) > 0 ? t.lastIndexOf('\n', ponto) + 1 : 0).match(/^[ \t]*/) || ['      '])[0] ||
  '      '

const raiz = t.slice(idxTag, Math.min(ponto, idxTag + 70)).replace(/\s+/g, ' ')
console.log('raiz JSX: ' + raiz)
console.log('indentacao: [' + indent + ']')

const BLOCO =
  '\n' +
  indent +
  '<SincronizarNotificacoesPainel />' +
  '\n' +
  indent +
  '<PainelVistas />'

/* 5. traducao do que sobrou em ingles */
const TRAD = [
  ['STRATEGIC OVERVIEW DASHBOARD', 'PAINEL DE VISÃO ESTRATÉGICA'],
  ['Strategic Overview Dashboard', 'Painel de Visão Estratégica'],
  ['Medium Priority', 'Prioridade Média'],
  ['High Priority', 'Prioridade Alta'],
  ['Low Priority', 'Prioridade Baixa'],
  ['View Details', 'Ver Detalhes'],
  ['Total Revenue', 'Receita Total'],
  ['Resource Allocation by Sector', 'Alocação de Recursos por Setor'],
  ['AI-Powered Recommendations', 'Recomendações por IA'],
  ['Supply Chain', 'Cadeia de Suprimentos'],
  ['Logistics Network Status', 'Status da Rede Logística'],
]

const escapar = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const trocas = []

for (const [de, para] of TRAD) {
  const re = new RegExp('([\'"`])((?:[^\'"`\\\\]|\\\\.)*?)' + escapar(de) + '((?:[^\'"`\\\\]|\\\\.)*?)(\\1)', 'g')
  t = t.replace(re, (mm, q1, pre, pos, q2) => {
    trocas.push(de + ' -> ' + para)
    return q1 + pre + para + pos + q2
  })
}

if (trocas.length) {
  console.log('\ntraducoes:')
  for (const s of [...new Set(trocas)]) console.log('  ' + s)
}

/* 6. inserir bloco + imports */
if (DRY) {
  console.log('\nDRY=1: nada foi escrito.')
  process.exit(0)
}

/* recalcular ponto após traduções, pois o texto pode ter mudado de tamanho */
const idxReturn2 = t.indexOf('return', abreCorpo)
const idxTag2 = t.indexOf('<', idxReturn2)
let ponto2

if (t.slice(idxTag2, idxTag2 + 2) === '<>') {
  ponto2 = idxTag2 + 2
} else {
  let j = idxTag2
  let aspas = null
  let chaves = 0
  while (j < t.length) {
    const c = t[j]
    if (aspas) {
      if (c === aspas) aspas = null
    } else if (c === '"' || c === "'" || c === '`') aspas = c
    else if (c === '{') chaves += 1
    else if (c === '}') chaves -= 1
    else if (c === '>' && chaves === 0) break
    j += 1
  }
  ponto2 = j + 1
}

t = t.slice(0, ponto2) + BLOCO + t.slice(ponto2)

const IMPORTS = [
  "import { PainelVistas } from '@/components/dashboard/painel-vistas'",
  "import { SincronizarNotificacoesPainel } from '@/components/dashboard/notificacoes-painel'",
]

for (const imp of IMPORTS) {
  const chave = imp.split('from')[0].trim()
  if (t.includes(chave)) continue
  const pos = t.lastIndexOf('\nimport ')
  const fim = t.indexOf('\n', pos + 1)
  t = t.slice(0, fim + 1) + imp + '\n' + t.slice(fim + 1)
}

writeFileSync(ALVO, t)
console.log('\nOK: componentes montados em ' + ALVO)
