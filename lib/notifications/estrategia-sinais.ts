import type { NivelNotificacao } from '@/lib/notifications/store'
import type { Sinal } from '@/lib/notifications/estrategia'

/* Converte os dados da tela de Estrategia em sinais comparaveis.
   Escrito de forma tolerante: apelidos diferentes nao quebram nada. */

type Solto = Record<string, unknown>

function obj(v: unknown): Solto {
  return v && typeof v === 'object' ? (v as Solto) : {}
}

function lista(v: unknown): Solto[] {
  return Array.isArray(v) ? v.map(obj) : []
}

function num(...candidatos: unknown[]): number | undefined {
  for (const c of candidatos) {
    if (typeof c === 'number' && Number.isFinite(c)) return c
    if (typeof c === 'string') {
      const n = Number(c.replace(/[^\d,.-]/g, '').replace('.', '').replace(',', '.'))
      if (Number.isFinite(n) && n !== 0) return n
    }
  }
  return undefined
}

function txt(...candidatos: unknown[]): string {
  for (const c of candidatos) {
    if (typeof c === 'string' && c.trim()) return c.trim()
  }
  return ''
}

function nivelPorTexto(t: string): NivelNotificacao {
  const s = t.toLowerCase()
  if (s.includes('crit') || s.includes('grav') || s.includes('pendente')) return 'critico'
  if (s.includes('aten') || s.includes('acompanh') || s.includes('analise')) return 'atencao'
  return 'info'
}

export function sinaisDeEstrategia(dados: unknown): Sinal[] {
  const d = obj(dados)
  const sinais: Sinal[] = []

  const fin = obj(
    d.financeiro ?? d.impactoFinanceiro ?? d.financialImpact ?? d.impacto ?? {},
  )

  const indicadores: [string, string, unknown][] = [
    ['pib', 'PIB agro', fin.pibAgro ?? fin.pib ?? d.pibAgro ?? d.pib],
    ['tributos', 'Tributos', fin.tributos ?? d.tributos],
    ['frete', 'Frete', fin.frete ?? d.frete],
    ['resultado', 'Resultado', fin.resultado ?? d.resultado],
  ]

  for (const [chave, rotulo, bruto] of indicadores) {
    const n = num(bruto)
    if (n === undefined) continue
    sinais.push({
      id: 'indicador-' + chave,
      grupo: 'indicador',
      rotulo: rotulo + ' atualizado',
      valor: 'R$ ' + n.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' bi',
      numero: n,
      nivel: 'atencao',
      meta: 'Impacto financeiro',
    })
  }

  const commodities = lista(
    d.commodities ?? d.demanda ?? d.demandaOferta ?? d.culturas ?? [],
  )

  for (const c of commodities) {
    const nome = txt(c.nome, c.name, c.produto, c.cultura)
    if (!nome) continue

    const estoque = num(c.estoqueMeses, c.estoque, c.meses, c.cobertura)
    const status = txt(c.status, c.situacao, c.classificacao)
    const pressao = num(c.pressao, c.pressaoPreco, c.variacao)

    if (estoque !== undefined) {
      const critico = estoque < 1
      sinais.push({
        id: 'commodity-' + nome.toLowerCase() + '-estoque',
        grupo: 'commodity',
        rotulo: nome + ': estoque em ' + estoque.toFixed(1) + ' mês',
        valor: estoque.toFixed(1) + ' m',
        numero: estoque,
        nivel: critico ? 'critico' : 'atencao',
        detalhe: critico
          ? 'Cobertura abaixo de um mês de consumo.'
          : 'Cobertura de estoque mudou frente ao retrato anterior.',
        meta: 'Demanda vs oferta',
      })
    }

    if (status) {
      sinais.push({
        id: 'commodity-' + nome.toLowerCase() + '-status',
        grupo: 'commodity',
        rotulo: nome + ' passou a ' + status,
        valor: status,
        nivel: nivelPorTexto(status),
        meta: 'Demanda vs oferta',
      })
    }

    if (pressao !== undefined) {
      sinais.push({
        id: 'commodity-' + nome.toLowerCase() + '-pressao',
        grupo: 'commodity',
        rotulo: 'Pressão de preço: ' + nome,
        valor: pressao.toFixed(1) + '%',
        numero: pressao,
        nivel: 'atencao',
        meta: 'Demanda vs oferta',
      })
    }
  }

  const fornecedores = lista(d.fornecedores ?? d.suppliers ?? d.contatos ?? [])

  for (const f of fornecedores) {
    const nome = txt(f.nome, f.name, f.empresa)
    const status = txt(f.status, f.situacao)
    if (!nome || !status) continue

    sinais.push({
      id: 'fornecedor-' + nome.toLowerCase(),
      grupo: 'fornecedor',
      rotulo: nome + ' agora está ' + status,
      valor: status,
      nivel: nivelPorTexto(status),
      meta: 'Fornecedores',
    })
  }

  const insights = lista(d.insights ?? d.sugestoes ?? d.recomendacoes ?? d.acoes ?? [])

  insights.forEach((i, indice) => {
    const texto = txt(i.texto, i.titulo, i.title, i.descricao, i.acao)
    if (!texto) return
    sinais.push({
      id: 'insight-' + texto.slice(0, 48).toLowerCase().replace(/\s+/g, '-') + '-' + indice,
      grupo: 'insight',
      rotulo: 'Nova recomendação do estrategista',
      valor: 'sugestão',
      nivel: 'info',
      detalhe: texto,
      meta: 'Insights e ações',
    })
  })

  const eficiencia = num(
    obj(d.alocacao ?? d.recursos ?? {}).eficiencia,
    d.eficiencia,
    obj(d.alocacao ?? {}).eficienciaPct,
  )

  if (eficiencia !== undefined) {
    sinais.push({
      id: 'indicador-eficiencia',
      grupo: 'indicador',
      rotulo: 'Eficiência de alocação',
      valor: eficiencia.toFixed(1) + '%',
      numero: eficiencia,
      nivel: eficiencia < 60 ? 'atencao' : 'info',
      meta: 'Alocação de recursos',
    })
  }

  return sinais
}
