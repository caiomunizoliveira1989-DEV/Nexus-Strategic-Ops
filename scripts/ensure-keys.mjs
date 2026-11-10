import fs from 'node:fs'

const FILE = 'lib/i18n/dictionary.ts'

const KEYS = [
  ['brand.tagline', 'Operações Estratégicas', 'Strategic Ops', 'Operaciones Estratégicas'],
  ['common.search', 'Buscar...', 'Search...', 'Buscar...'],
  ['common.alerts', 'Alertas', 'Alerts', 'Alertas'],
  ['common.views', 'Vistas', 'Views', 'Vistas'],
  ['common.status', 'Status', 'Status', 'Estado'],
  ['common.priority', 'Prioridade', 'Priority', 'Prioridad'],
  ['common.owner', 'Responsável', 'Owner', 'Responsable'],
  ['common.pending', 'Pendente', 'Pending', 'Pendiente'],
  ['common.completed', 'Concluído', 'Completed', 'Completado'],
  ['common.critical', 'Crítico', 'Critical', 'Crítico'],
  ['common.onTrack', 'No prazo', 'On track', 'En plazo'],
  ['common.atRisk', 'Em risco', 'At risk', 'En riesgo'],
  ['strategy.title', 'Estratégia', 'Strategy', 'Estrategia'],
  ['strategy.initiatives', 'Iniciativas', 'Initiatives', 'Iniciativas'],
  ['strategy.progress', 'Progresso', 'Progress', 'Progreso'],
  ['strategy.risks', 'Riscos', 'Risks', 'Riesgos'],
  ['strategy.milestones', 'Marcos', 'Milestones', 'Hitos'],
  ['compliance.title', 'Conformidade', 'Compliance', 'Cumplimiento'],
  ['compliance.audits', 'Auditorias', 'Audits', 'Auditorías'],
  ['compliance.requirements', 'Requisitos', 'Requirements', 'Requisitos'],
  ['compliance.incidents', 'Incidentes', 'Incidents', 'Incidentes'],
  ['compliance.deadline', 'Prazo', 'Deadline', 'Plazo'],
  ['logistics.title', 'Logística', 'Logistics', 'Logística'],
  ['logistics.routes', 'Rotas', 'Routes', 'Rutas'],
  ['logistics.vehicles', 'Veículos', 'Vehicles', 'Vehículos'],
  ['logistics.deliveries', 'Entregas', 'Deliveries', 'Entregas'],
  ['logistics.delays', 'Atrasos', 'Delays', 'Retrasos'],
  ['logistics.fleet', 'Frota', 'Fleet', 'Flota'],
]

let src = fs.readFileSync(FILE, 'utf8')
const original = src

function findBlock(text, name) {
  const re = new RegExp('^const\\s+' + name + '\\b[^=\\n]*=\\s*\\{', 'm')
  const m = re.exec(text)
  if (!m) return null
  const open = text.indexOf('{', m.index)
  let depth = 0
  let quote = null
  let i = open
  while (i < text.length) {
    const c = text[i]
    if (quote) {
      if (c === '\\') { i += 2; continue }
      if (c === quote) quote = null
      i++
      continue
    }
    if (c === "'" || c === '"' || c === '`') { quote = c; i++; continue }
    if (c === '{') depth++
    else if (c === '}') {
      depth--
      if (depth === 0) return { open, close: i }
    }
    i++
  }
  return null
}

function hasKey(block, key) {
  const esc = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp("['\"]" + esc + "['\"]\\s*:").test(block)
}

const BLOCKS = [['pt', 1], ['en', 2], ['es', 3]]
const report = {}
for (const [name] of BLOCKS) report[name] = { added: 0, had: 0 }

for (const [name, idx] of BLOCKS) {
  const range = findBlock(src, name)
  if (!range) {
    console.error('ERRO: bloco "' + name + '" nao encontrado')
    process.exit(2)
  }
  const block = src.slice(range.open, range.close + 1)
  const lines = []

  for (const entry of KEYS) {
    if (hasKey(block, entry[0])) { report[name].had++; continue }
    const value = String(entry[idx]).replace(/\\/g, '\\\\').replace(/'/g, "\\'")
    lines.push("  '" + entry[0] + "': '" + value + "',")
  }

  if (lines.length) {
    const insert = '\n' + lines.join('\n')
    src = src.slice(0, range.close) + insert + src.slice(range.close)
    report[name].added = lines.length
  }
}

fs.writeFileSync(FILE, src, 'utf8')

console.log('Arquivo gravado: ' + FILE)
for (const name of ['pt', 'en', 'es']) {
  const r = report[name]
  console.log('  ' + name + ': ' + r.added + ' adicionadas, ' + r.had + ' ja existiam')
}

// --- verificacao final ---
let check = fs.readFileSync(FILE, 'utf8')
let falhas = 0
for (const [name] of BLOCKS) {
  const range = findBlock(check, name)
  if (!range) { console.error('FALHA: bloco ' + name + ' sumiu'); falhas++; continue }
  const block = check.slice(range.open, range.close + 1)
  for (const entry of KEYS) {
    if (!hasKey(block, entry[0])) { console.error('FALTA ' + name + ': ' + entry[0]); falhas++ }
  }
}
if (falhas) { console.error('TOTAL DE FALHAS: ' + falhas); process.exit(3) }
console.log('VERIFICACAO OK: todas as ' + KEYS.length + ' chaves nos 3 blocos')
