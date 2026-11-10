import fs from 'node:fs'

const file = 'lib/i18n/dictionary.ts'
const src = fs.readFileSync(file, 'utf8')

const start = src.indexOf('const pt = {')
const end = src.indexOf('export type TranslationKey')

if (start < 0 || end < 0 || end < start) {
  console.error('ERRO: nao localizei o bloco pt do dicionario')
  process.exit(2)
}

const before = src.slice(0, start)
const block = src.slice(start, end)
const after = src.slice(end)

const pt = {
  'agri.title': 'Monitoramento Agrícola',
  'agri.soilMoisture': 'Umidade do Solo',
  'agri.cropHealth': 'Índice de Saúde da Lavoura',
  'agri.activeAlerts': 'Alertas Climáticos Ativos',
  'agri.pestRisk': 'Zonas de Risco de Praga',
  'agri.feed': 'Feed de Atividades',
  'agri.weather': 'Previsão do Tempo',
  'nav.dashboard': 'Painel',
  'nav.agriculture': 'Agricultura',
  'nav.strategy': 'Estratégia',
  'nav.compliance': 'Conformidade',
  'nav.logistics': 'Logística',
}

let out = block
let changed = 0
let missing = 0

for (const key of Object.keys(pt)) {
  const escaped = key.replace(/\./g, '\\.')
  const re = new RegExp("('" + escaped + "':\\s*)'[^']*'")
  if (!re.test(out)) {
    console.log('MISS ' + key)
    missing++
    continue
  }
  out = out.replace(re, "$1'" + pt[key] + "'")
  console.log('OK   ' + key + ' -> ' + pt[key])
  changed++
}

if (changed === 0) {
  console.error('NADA alterado. Arquivo intacto.')
  process.exit(3)
}

fs.writeFileSync(file + '.bak', src, 'utf8')
fs.writeFileSync(file, before + out + after, 'utf8')
console.log('---')
console.log('Traduzidas: ' + changed + ' chaves, ' + missing + ' nao encontradas')
console.log('Backup: ' + file + '.bak')
