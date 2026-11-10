#!/usr/bin/env node
const BASE = 'https://geoserver.car.gov.br/geoserver/sicar/ows'
const UF = (process.env.UF ?? 'mg').toLowerCase()
const LAYER = 'sicar:sicar_imoveis_' + UF

console.log('servico: ' + BASE)
console.log('camada:  ' + LAYER)
console.log('')

const cap = await fetch(BASE + '?service=WFS&version=1.1.0&request=GetCapabilities')
if (!cap.ok) { console.error('capabilities: HTTP ' + cap.status); process.exit(2) }

const xml = await cap.text()
const layers = [...new Set([...xml.matchAll(/<Name>(sicar:sicar_imoveis_[a-z]{2})<\/Name>/g)].map((m) => m[1]))]

console.log('camadas publicadas: ' + layers.length)
const has = layers.includes(LAYER)
console.log('  ' + LAYER + ': ' + (has ? 'existe' : 'NAO ENCONTRADA'))
if (!has) {
  console.log('  disponiveis: ' + layers.join(', '))
  process.exit(3)
}

const dft = await fetch(BASE + '?service=WFS&version=1.1.0&request=DescribeFeatureType&typeName=' + LAYER)
const schema = await dft.text()
const fields = [...new Set([...schema.matchAll(/name="([A-Za-z_][\w]*)"/g)].map((m) => m[1]))]

console.log('')
console.log('campos (' + fields.length + '):')
for (const f of fields) console.log('  ' + f)

const url =
  BASE + '?service=WFS&version=2.0.0&request=GetFeature' +
  '&typeNames=' + LAYER +
  '&outputFormat=application/json&srsName=EPSG:4326&count=1' +
  '&sortBy=cod_imovel%20A'

const gf = await fetch(url)
if (!gf.ok) { console.error('GetFeature: HTTP ' + gf.status); process.exit(4) }

const body = await gf.json()
const props = body.features?.[0]?.properties ?? {}

console.log('')
console.log('exemplo real de propriedades:')
for (const [k, v] of Object.entries(props)) {
  const text = String(v)
  console.log('  ' + k + ' = ' + (text.length > 60 ? text.slice(0, 60) + '...' : text))
}
