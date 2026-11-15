import { readFileSync, writeFileSync } from 'node:fs'

const ARQ = 'components/dashboard/views/agriculture-view.tsx'
let t = readFileSync(ARQ, 'utf8')

/* 1. capturar e remover a linha atual */
const linhas = t.split('\n')
const idx = linhas.findIndex((l) => l.includes("useRegistroVista('agricultura'"))

if (idx < 0) {
  console.log('chamada nao encontrada — nada a mover')
  process.exit(0)
}

const chamada = linhas[idx]
linhas.splice(idx, 1)
t = linhas.join('\n')

/* 2. achar o fim da chamada useAgricultureData */
const pos = t.indexOf('useAgricultureData(')
if (pos < 0) {
  console.error('useAgricultureData nao encontrado. Nada foi escrito.')
  process.exit(1)
}

let i = t.indexOf('(', pos)
let nivel = 0
for (; i < t.length; i += 1) {
  if (t[i] === '(') nivel += 1
  else if (t[i] === ')') {
    nivel -= 1
    if (nivel === 0) break
  }
}

if (nivel !== 0) {
  console.error('Nao consegui fechar a chamada do hook. Nada foi escrito.')
  process.exit(1)
}

const fimLinha = t.indexOf('\n', i)
t = t.slice(0, fimLinha) + '\n' + chamada + t.slice(fimLinha)

writeFileSync(ARQ, t)
console.log('chamada movida para depois do useAgricultureData')
