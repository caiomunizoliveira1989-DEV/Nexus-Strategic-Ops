import { readFileSync, writeFileSync, existsSync } from 'node:fs'

const DRY = process.env.DRY === '1'

const CASOS = [
  {
    arquivo: 'components/dashboard/compliance-map.tsx',
    escopo: 'conformidade',
    adaptador: 'sinaisDeConformidadePainel',
    importAdaptador: "import { sinaisDeConformidadePainel } from '@/lib/notifications/painel-adaptadores'",
    candidatos: [
      { nome: 'dados', expr: 'dados?.alertas ?? []' },
      { nome: 'data', expr: 'data?.alertas ?? []' },
      { nome: 'alertas', expr: 'alertas' },
      { nome: 'zonas', expr: 'zonas' },
      { nome: 'zonasAlerta', expr: 'zonasAlerta' },
    ],
    objeto: null,
    fallback: '[]',
  },
  {
    arquivo: 'components/dashboard/views/strategy-view.tsx',
    escopo: 'estrategia',
    adaptador: 'sinaisDeEstrategia',
    importAdaptador: "import { sinaisDeEstrategia } from '@/lib/notifications/estrategia'",
    candidatos: [
      { nome: 'dados', expr: 'dados' },
      { nome: 'data', expr: 'data' },
      { nome: 'estrategia', expr: 'estrategia' },
      { nome: 'cenario', expr: 'cenario' },
    ],
    objeto: ['financeiro', 'commodities', 'fornecedores', 'alocacao', 'indicadores', 'insights'],
    fallback: '{}',
  },
]

function declarados(t, limite) {
  const nomes = new Set()
  const trecho = t.slice(0, limite)
  let m

  const reImp = /import\s*(?:type\s*)?\{([^}]+)\}\s*from/g
  while ((m = reImp.exec(trecho))) {
    m[1].split(',').forEach((s) => {
      const n = s.trim().split(/\s+as\s+/).pop().split(':').pop().trim()
      if (/^[A-Za-z_$][\w$]*$/.test(n)) nomes.add(n)
    })
  }

  const reObj = /const\s*\{([^}]+)\}\s*=/g
  while ((m = reObj.exec(trecho))) {
    m[1].split(',').forEach((s) => {
      const n = s.trim().split(':').pop().split('=')[0].trim()
      if (/^[A-Za-z_$][\w$]*$/.test(n)) nomes.add(n)
    })
  }

  const reSimples = /const\s+([A-Za-z_$][\w$]*)\s*=/g
  while ((m = reSimples.exec(trecho))) nomes.add(m[1])

  return nomes
}

function corpoComponente(t) {
  const m = /export\s+(?:default\s+)?function\s+[A-Za-z_$][\w$]*/.exec(t)
  if (!m) return null
  let i = t.indexOf('(', m.index)
  if (i < 0) return null
  let nivel = 0
  for (; i < t.length; i += 1) {
    if (t[i] === '(') nivel += 1
    else if (t[i] === ')') {
      nivel -= 1
      if (nivel === 0) {
        i += 1
        break
      }
    }
  }
  const abre = t.indexOf('{', i)
  return abre < 0 ? null : abre + 1
}

for (const c of CASOS) {
  if (!existsSync(c.arquivo)) {
    console.log('PULADO (nao existe): ' + c.arquivo)
    continue
  }

  let t = readFileSync(c.arquivo, 'utf8')

  /* 1. remover tentativas anteriores mal posicionadas */
  const antes = t.split('\n').length
  t = t
    .split('\n')
    .filter(
      (l) =>
        !l.includes('useRegistroVista(') &&
        !l.includes("'@/lib/notifications/use-registro-vista'"),
    )
    .join('\n')
  const removidas = antes - t.split('\n').length
  if (removidas) console.log(c.arquivo + ': ' + removidas + ' linha(s) removida(s)')

  /* 2. localizar o corpo do componente */
  const corpo = corpoComponente(t)
  if (corpo === null) {
    console.log('FALHA: nao achei o componente em ' + c.arquivo + ' — nada alterado')
    continue
  }

  /* 3. ponto de insercao: antes do primeiro return */
  const reReturn = /\n[ \t]*return\s*[\(<]/g
  reReturn.lastIndex = corpo
  const r = reReturn.exec(t)
  if (!r) {
    console.log('FALHA: nao achei return em ' + c.arquivo + ' — nada alterado')
    continue
  }
  const ponto = r.index + 1
  const linhaAtual = t.slice(ponto, t.indexOf('\n', ponto))
  const indent = (linhaAtual.match(/^[ \t]*/) || ['  '])[0]

  /* 4. escolher a expressao de dados */
  const nomes = declarados(t, ponto)

  let expr = null
  let origem = null

  for (const cand of c.candidatos) {
    if (nomes.has(cand.nome)) {
      expr = cand.expr
      origem = cand.nome
      break
    }
  }

  if (!expr && c.objeto) {
    const achados = c.objeto.filter((n) => nomes.has(n))
    if (achados.length) {
      expr = '{ ' + achados.join(', ') + ' }'
      origem = achados.join(' + ')
    }
  }

  if (!expr) {
    expr = c.fallback
    origem = 'FALLBACK (sino ficara vazio)'
  }

  const chamada = indent + 'useRegistroVista(\'' + c.escopo + '\', ' + c.adaptador + '(' + expr + '))'

  console.log(c.arquivo)
  console.log('  variavel: ' + origem)
  console.log('  chamada: ' + chamada.trim())
  console.log('  insercao antes da linha: ' + (linhaAtual.trim().slice(0, 50) || '(return)'))

  if (DRY) continue

  t = t.slice(0, ponto) + chamada + '\n' + t.slice(ponto)

  /* 5. imports */
  const precisa = [
    "import { useRegistroVista } from '@/lib/notifications/use-registro-vista'",
    c.importAdaptador,
  ]

  for (const imp of precisa) {
    const chave = imp.split('from')[0]
    if (t.includes(chave)) continue
    const pos = t.lastIndexOf('\nimport ')
    const fim = t.indexOf('\n', pos + 1)
    t = t.slice(0, fim + 1) + imp + '\n' + t.slice(fim + 1)
  }

  writeFileSync(c.arquivo, t)
  console.log('  escrito: OK')
}

console.log('\n' + (DRY ? 'PREVIA: nada foi escrito.' : 'APLICADO.'))
