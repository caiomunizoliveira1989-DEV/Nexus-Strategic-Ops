import { readFileSync, writeFileSync } from 'node:fs'

const CASOS = [
  {
    arquivo: 'components/dashboard/views/agriculture-view.tsx',
    escopo: 'agricultura',
    importar: "import { useRegistroVista } from '@/lib/notifications/use-registro-vista'\nimport { sinaisDeAgricultura } from '@/lib/notifications/agricultura'",
    chamada: (v) =>
      "useRegistroVista('agricultura', sinaisDeAgricultura(" + v + "))",
    marcador: 'useAgricultureData(',
  },
  {
    arquivo: 'components/dashboard/views/strategy-view.tsx',
    escopo: 'estrategia',
    importar: "import { useRegistroVista } from '@/lib/notifications/use-registro-vista'\nimport { sinaisDeEstrategia } from '@/lib/notifications/estrategia'",
    chamada: (v) => "useRegistroVista('estrategia', sinaisDeEstrategia(" + v + "))",
    marcador: 'Sincr3t24NpUrJMNunMMASmhAM953bFGeLXzN7',
  },
  {
    arquivo: 'components/dashboard/compliance-map.tsx',
    escopo: 'conformidade',
    importar: "import { useRegistroVista } from '@/lib/notifications/use-registro-vista'\nimport { sinaisDeConformidadePainel } from '@/lib/notifications/painel-adaptadores'",
    chamada: () =>
      "useRegistroVista('conformidade', sinaisDeConformidadePainel(dados?.alertas ?? []))",
    marcador: 'Sincr3t24NpUrJMNunMMASmhAM953bFGeLXzN7',
  },
]

for (const c of CASOS) {
  let t
  try {
    t = readFileSync(c.arquivo, 'utf8')
  } catch {
    console.log('PULADO (nao existe): ' + c.arquivo)
    continue
  }

  if (t.includes('useRegistroVista(')) {
    console.log('ja ligado: ' + c.arquivo)
    continue
  }

  const pos = t.indexOf(c.marcador)
  if (pos < 0) {
    console.log('MARCADOR NAO ENCONTRADO em ' + c.arquivo + ' → procure: ' + c.marcador)
    continue
  }

  /* descobrir a variavel de dados na mesma regiao */
  const antes = t.slice(Math.max(0, pos - 600), pos)
  const mObj = antes.match(/const\s*\{([^}]+)\}\s*=/)
  const mSimples = antes.match(/const\s+([A-Za-z_$][\w$]*)\s*=/)

  let varDados = 'dados'
  if (mObj) {
    const nomes = mObj[1]
      .split(',')
      .map((s) => s.trim().split(':').pop().split('=')[0].trim())
      .filter((s) => /^[A-Za-z_$][\w$]*$/.test(s))
    if (nomes.length) varDados = '{ ' + nomes.join(', ') + ' }'
  } else if (mSimples) {
    varDados = mSimples[1]
  }

  /* inserir import */
  const ultimoImp = t.lastIndexOf('\nimport ')
  const fimImp = t.indexOf('\n', ultimoImp + 1)
  t = t.slice(0, fimImp + 1) + c.importar + '\n' + t.slice(fimImp + 1)

  /* inserir chamada antes do marcador */
  const posNovo = t.indexOf(c.marcador)
  const inicioLinha = t.lastIndexOf('\n', posNovo)
  t = t.slice(0, inicioLinha + 1) + c.chamada(varDados) + '\n' + t.slice(inicioLinha + 1)

  writeFileSync(c.arquivo, t)
  console.log('ligado: ' + c.arquivo + ' → ' + varDados)
}
