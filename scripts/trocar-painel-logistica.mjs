import { readdirSync, readFileSync, writeFileSync, copyFileSync, existsSync } from 'node:fs'

const APLICAR = process.argv.includes('--aplicar')
const TITULO = /Status da Rede Log[íi]stica/i
const TAG = /^\s*<(div|section|article|Card|aside)\b/

const dirs = ['components/dashboard/views', 'components/dashboard', 'components']
const arquivos = []

for (const d of dirs) {
  if (!existsSync(d)) continue
  for (const f of readdirSync(d)) {
    if (f.endsWith('.tsx')) arquivos.push(d + '/' + f)
  }
}

let alvo = null
let txt = null

for (const a of arquivos) {
  const t = readFileSync(a, 'utf8')
  if (!TITULO.test(t)) continue
  if (!alvo || t.length > txt.length) {
    alvo = a
    txt = t
  }
}

if (!alvo) {
  console.error('NAO ACHEI "Status da Rede Logística" em components/.')
  console.error('Rode: grep -rn "Status da Rede Log" components --include="*.tsx"')
  process.exit(1)
}

const linhas = txt.split('\n')
const posTitulo = txt.search(TITULO)
const linhaTitulo = txt.slice(0, posTitulo).split('\n').length

console.log('arquivo: ' + alvo)
console.log('titulo na linha: ' + linhaTitulo)

if (txt.includes('<StatusRedeLogistica')) {
  console.log('JA SUBSTITUIDO: nada a fazer.')
  process.exit(0)
}

let inicio = -1
let indent = ''

for (let i = linhaTitulo - 1; i >= 0; i -= 1) {
  const l = linhas[i]
  if (TAG.test(l) && !l.includes('/>')) {
    inicio = i
    indent = (l.match(/^[ \t]*/) || [''])[0]
    break
  }
  if (i < linhaTitulo - 60) break
}

if (inicio < 0) {
  console.error('Nao achei a tag de abertura do card acima do titulo.')
  process.exit(1)
}

console.log('card abre na linha: ' + (inicio + 1) + ' → ' + linhas[inicio].trim().slice(0, 70))

let nivel = 0
let fim = -1

for (let i = inicio; i < linhas.length; i += 1) {
  const abre = linhas[i].match(/<(div|section|article|Card|aside)\b/g)
  const fecha = linhas[i].match(/<\/(div|section|article|Card|aside)>/g)
  if (abre) nivel += abre.length
  if (fecha) nivel -= fecha.length

  if (nivel === 0 && i > inicio) {
    fim = i
    break
  }
}

if (fim < 0) {
  console.error('Nao consegui fechar o card. Nada foi escrito.')
  process.exit(1)
}

console.log('card fecha na linha: ' + (fim + 1))
console.log('total de linhas do card: ' + (fim - inicio + 1))
console.log('')
console.log('--- primeira linha ---')
console.log(linhas[inicio])
console.log('--- ultima linha ---')
console.log(linhas[fim])

if (!APLICAR) {
  console.log('')
  console.log('PREVIA. Confira que a ultima linha e </div> (ou tag equivalente).')
  console.log('Para escrever: node scripts/trocar-painel-logistica.mjs --aplicar')
  process.exit(0)
}

copyFileSync(alvo, alvo + '.bak-painel')

const novas = [
  ...linhas.slice(0, inicio),
  indent + '<StatusRedeLogistica />',
  ...linhas.slice(fim + 1),
]

let t = novas.join('\n')

const IMP = "import { StatusRedeLogistica } from '@/components/dashboard/status-rede-logistica'"
if (!t.includes('status-rede-logistica')) {
  const p = t.lastIndexOf('\nimport ')
  const f = t.indexOf('\n', p + 1)
  t = t.slice(0, f + 1) + IMP + '\n' + t.slice(f + 1)
}

writeFileSync(alvo, t)
console.log('')
console.log('OK: card substituido em ' + alvo)
console.log('backup: ' + alvo + '.bak-painel')
