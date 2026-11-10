#!/usr/bin/env node
/**
 * Descobre o cod_municipio_ibge a partir do nome, consultando a propria camada do SICAR.
 *
 * FARMS_MUNICIPIO="Itatiaiuçu" FARMS_UF=mg node scripts/resolve-municipio.mjs
 */

const BASE = process.env.FARMS_SOURCE_URL ?? 'https://geoserver.car.gov.br/geoserver/sicar/ows'
const UF = (process.env.FARMS_UF ?? 'mg').toLowerCase()
const NOME = process.env.FARMS_MUNICIPIO

if (!NOME) {
  console.error('FARMS_MUNICIPIO nao definida. Ex: FARMS_MUNICIPIO="Itatiaiuçu"')
  process.exit(2)
}

const LAYER = 'sicar:sicar_imoveis_' + UF

const params = new URLSearchParams({
  service: 'WFS',
  version: '2.0.0',
  request: 'GetFeature',
  typeNames: LAYER,
  outputFormat: 'application/json',
  srsName: 'EPSG:4326',
  count: '1',
  propertyName: 'cod_municipio_ibge,municipio,uf',
  cql_filter: "municipio='" + NOME.replace(/'/g, "''") + "'",
})

const url = BASE + (BASE.includes('?') ? '&' : '?') + params.toString()
console.log('camada: ' + LAYER)
console.log('busca:  municipio=\'' + NOME + '\'')
console.log('')

const res = await fetch(url, { headers: { accept: 'application/json' }, signal: AbortSignal.timeout(60000) })
const text = await res.text()

let body
try {
  body = JSON.parse(text)
} catch {
  console.error('resposta nao e JSON (HTTP ' + res.status + ')')
  console.error(text.slice(0, 300).replace(/\s+/g, ' '))
  process.exit(3)
}

if (body.exceptions) {
  console.error('ServiceException: ' + JSON.stringify(body.exceptions).slice(0, 400))
  process.exit(4)
}

const first = body.features?.[0]?.properties

if (!first) {
  console.error("nenhum imovel encontrado em '" + NOME + "' na camada " + LAYER)
  console.error('confira a grafia (acentos e hifen) e se o municipio e desse estado')
  process.exit(5)
}

const codigo = first.cod_municipio_ibge
console.log('municipio na fonte: ' + first.municipio + ' / ' + first.uf)
console.log('cod_municipio_ibge: ' + codigo)
console.log('')
console.log('use assim:')
console.log('  FARMS_MUNICIPIO_IBGE="' + codigo + '" \\')
console.log('  FARMS_TYPE_NAME="' + LAYER + '" \\')
console.log('  node scripts/sync-farms.mjs')
