#!/usr/bin/env node
const BASE = process.env.WFS_URL ?? 'https://geoserver.car.gov.br/geoserver/sicar/wfs'
const url = BASE + (BASE.includes('?') ? '&' : '?') + 'service=WFS&version=2.0.0&request=GetCapabilities'

console.log('consultando: ' + BASE)

const res = await fetch(url, { signal: AbortSignal.timeout(30000) })
if (!res.ok) {
  console.error('HTTP ' + res.status)
  process.exit(2)
}

const xml = await res.text()
const names = [...xml.matchAll(/<Name>([^<]+)<\/Name>/g)].map((m) => m[1].trim())
const layers = [...new Set(names)].filter((n) => n.includes(':'))

console.log('camadas encontradas: ' + layers.length)
console.log('')

const relevantes = layers.filter((n) => /imovel|car|rural|fazenda/i.test(n))
const alvo = relevantes.length ? relevantes : layers

for (const n of alvo.slice(0, 40)) console.log('  ' + n)

if (!alvo.length) console.log('  nenhuma')
