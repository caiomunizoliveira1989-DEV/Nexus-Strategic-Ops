import { readFileSync, writeFileSync, existsSync } from 'node:fs'

const APLICAR = process.argv.includes('--aplicar')
const CAND = [
  'components/dashboard/notificacoes-logistica.tsx',
  'components/dashboard/views/logistics-view.tsx',
  'components/dashboard/views/logistica-view.tsx',
]

let alvo = null
let txt = null

for (const c of CAND) {
  if (!existsSync(c)) continue
  const t = readFileSync(c, 'utf8')
  if (t.includes("publicarNotificacoes('logistica'")) {
    alvo = c
    txt = t
    break
  }
}

if (!alvo) {
  console.error('Nao achei o arquivo que publica notificacoes de logistica.')
  process.exit(1)
}

console.log('arquivo: ' + alvo)

if (txt.includes('publicarDadosLogistica')) {
  console.log('JA LIGADO.')
  process.exit(0)
}

const linhas = txt.split('\n')
const i = linhas.findIndex((l) => l.includes("publicarNotificacoes('logistica'"))

if (i < 0) {
  console.error('Nao achei publicarNotificacoes. Nada foi escrito.')
  process.exit(1)
}

const ind = (linhas[i].match(/^[ \t]*/) || ['    '])[0]

console.log('linha ' + (i + 1) + ': ' + linhas[i].trim())
console.log('>>> nova linha: ' + ind + 'publicarDadosLogistica(alertas, navios)')

if (!APLICAR) {
  console.log('')
  console.log('PREVIA. Para escrever: node scripts/ligar-logistica.mjs --aplicar')
  process.exit(0)
}

linhas.splice(i + 1, 0, ind + 'publicarDadosLogistica(alertas, navios)')
let t = linhas.join('\n')

const IMP = "import { publicarDadosLogistica } from '@/lib/data/logistica-compartilhada'"
if (!t.includes('logistica-compartilhada')) {
  const p = t.lastIndexOf('\nimport ')
  const f = t.indexOf('\n', p + 1)
  t = t.slice(0, f + 1) + IMP + '\n' + t.slice(f + 1)
}

writeFileSync(alvo, t)
console.log('OK: escrita aplicada.')
