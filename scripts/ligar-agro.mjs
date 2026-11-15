import { readFileSync, writeFileSync } from 'node:fs'

const ALVO = 'components/dashboard/views/agriculture-view.tsx'
const DRY = process.env.DRY === '1'
const MARCA = 'useNotificacoesAgricultura'

let t = readFileSync(ALVO, 'utf8')

if (t.includes(MARCA)) {
  console.log('JA LIGADO: nada a fazer')
  process.exit(0)
}

const posHook = t.indexOf('useAgricultureData(')
if (posHook < 0) {
  console.error('Nao achei useAgricultureData(')
  process.exit(1)
}

/* --- montar a expressao de dados --- */

const antes = t.slice(0, posHook)
const posConst = antes.lastIndexOf('const ')
const trecho = t.slice(posConst, posHook)

const mObj = trecho.match(/const\s*\{([^}]+)\}/)
const mSimples = trecho.match(/const\s+([A-Za-z_$][\w$]*)\s*=/)

let prop = null

if (mObj) {
  const nomes = mObj[1]
    .split(',')
    .map((s) => s.trim().split(':').pop().trim())
    .filter((s) => /^[A-Za-z_$][\w$]*$/.test(s))
  if (!nomes.length) {
    console.error('Destructuring vazio. Trecho:', trecho)
    process.exit(1)
  }
  prop = '{ ' + nomes.join(', ') + ' }'
  console.log('hook desestruturado: ' + nomes.join(', '))
} else if (mSimples) {
  prop = mSimples[1]
  console.log('hook direto: ' + prop)
} else {
  console.error('Formato do hook nao reconhecido. Trecho:')
  console.error(trecho)
  process.exit(1)
}

/* --- achar o fim da chamada do hook --- */

const abre = t.indexOf('(', posHook)
let nivel = 0
let i = abre

for (; i < t.length; i += 1) {
  const c = t[i]
  if (c === '(') nivel += 1
  else if (c === ')') {
    nivel -= 1
    if (nivel === 0) break
  }
}

if (nivel !== 0) {
  console.error('Nao consegui fechar a chamada do hook')
  process.exit(1)
}

let fim = i + 1
while (fim < t.length && /[;\s]/.test(t[fim])) fim += 1

const fimLinha = t.indexOf('\n', fim)
if (fimLinha < 0) {
  console.error('Nao achei o fim da linha do hook')
  process.exit(1)
}

const inicioLinha = t.lastIndexOf('\n', posConst) + 1
const indent = t.slice(inicioLinha, posConst) || '  '

const chamada = '\n' + indent + MARCA + '(' + prop + ')'

console.log('insercao: ' + chamada.trim())
console.log('no arquivo: ' + ALVO)

if (DRY) {
  console.log('DRY=1: nada foi escrito.')
  process.exit(0)
}

t = t.slice(0, fimLinha) + chamada + t.slice(fimLinha)

/* --- import --- */

const IMPORT =
  "import { useNotificacoesAgricultura } from '@/lib/notifications/use-notificacoes-agricultura'"
const posUltimoImp = t.lastIndexOf('\nimport ')
const fimImp = t.indexOf('\n', posUltimoImp + 1)
t = t.slice(0, fimImp + 1) + IMPORT + '\n' + t.slice(fimImp + 1)

writeFileSync(ALVO, t)
console.log('OK: ' + MARCA + '(' + prop + ') inserido')
