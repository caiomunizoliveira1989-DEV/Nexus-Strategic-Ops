import { readFileSync, writeFileSync } from 'node:fs'

const ARQ = 'lib/notifications/painel-adaptadores.ts'
let t = readFileSync(ARQ, 'utf8')

const SUBS = [
  [
    'num(obj(d.alocacao ?? d.recursos).eficiencia, d.eficiencia)',
    'num(obj(d.alocacao ?? d.recursos).eficiencia ?? d.eficiencia)',
  ],
  [
    'num(c.estoqueMeses, c.estoque, c.meses)',
    'num(c.estoqueMeses ?? c.estoque ?? c.meses)',
  ],
]

for (const [de, para] of SUBS) {
  if (!t.includes(de)) {
    console.log('nao encontrado: ' + de)
    continue
  }
  t = t.replace(de, para)
  console.log('corrigido: ' + de.slice(0, 40) + '...')
}

writeFileSync(ARQ, t)
