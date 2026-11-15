import { readFileSync, writeFileSync } from 'node:fs'

const s = 'lib/notifications/store.ts'
let t = readFileSync(s, 'utf8')
if (!t.includes("'painel'")) {
  t = t.replace(/export type EscopoNotificacao =\s*([^\n]+)/, (m, g) =>
    g.includes("'painel'") ? m : 'export type EscopoNotificacao = ' + g.trim() + " | 'painel'",
  )
  writeFileSync(s, t)
  console.log('store.ts: painel adicionado')
} else console.log('store.ts: ok')

const b = 'components/dashboard/notification-bell.tsx'
let u = readFileSync(b, 'utf8')
if (!u.includes("painel: 'Painel'")) {
  u = u.replace(/(const ROTULO_ESCOPO: Record<EscopoNotificacao, string> = \{\n)/, "$1  painel: 'Painel',\n")
  writeFileSync(b, u)
  console.log('notification-bell.tsx: rotulo adicionado')
} else console.log('notification-bell.tsx: ok')
