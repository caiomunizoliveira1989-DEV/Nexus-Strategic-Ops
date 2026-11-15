import { NextResponse } from 'next/server'
import { gerarSugestoes, type NavioContexto, type Sugestao } from '@/lib/data/sugestoes'
import type { AlertaLogistica } from '@/lib/data/alertas-logistica'

type Corpo = { alertas: AlertaLogistica[]; navios: NavioContexto[] }

/* Configure no .env.local para ativar a camada de IA.
   Sem chave, a rota devolve o motor de regras e avisa no campo modo. */
const CHAVE = process.env.ALERTAS_IA_KEY
const MODELO = process.env.ALERTAS_IA_MODELO ?? 'gpt-4o-mini'
const BASE = process.env.ALERTAS_IA_BASE ?? 'https://api.openai.com/v1'

const INSTRUCAO = `Você é um analista de risco logístico marítimo.
Recebe alertas reais de conflito, clima, congestão e rota, e a situação dos navios.
Devolva no MÁXIMO 5 sugestões acionáveis, em português do Brasil, no formato JSON:
[{"tipo":"reroteamento|diplomatico|conformidade|risco","titulo":"...","descricao":"...","acao":"...","badge":"...","severidade":"alta|media|baixa","alertas":["id"],"impacto":"..."}]

Regras:
- Cada sugestão deve citar pelo menos um id de alerta existente em "alertas_ids".
- "acao" é um comando concreto e executável, não uma descrição genérica.
- "impacto" traz a consequência em dias, custo ou carga.
- Se a situação exigir algo que não está nas regras óbvias, proponha mesmo assim.
- Nunca invente alerta, porto ou navio que não esteja no payload.
Responda somente com o JSON, sem texto ao redor.`

async function gerarComIA(
  alertas: AlertaLogistica[],
  navios: NavioContexto[],
): Promise<Sugestao[] | null> {
  if (!CHAVE) return null

  const payload = {
    alertas_ids: alertas.map((a) => a.id),
    alertas: alertas.map((a) => ({
      id: a.id,
      titulo: a.titulo,
      local: a.local,
      categoria: a.categoria,
      severidade: a.severidade,
      risco: a.risco,
      resumo: a.resumo,
      fonte: a.fonte,
      data: a.data,
    })),
    navios,
  }

  try {
    const r = await fetch(BASE + '/chat/completions', {
      method: 'POST',
      signal: AbortSignal.timeout(30000),
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + CHAVE,
      },
      body: JSON.stringify({
        model: MODELO,
        temperature: 0.3,
        messages: [
          { role: 'system', content: INSTRUCAO },
          { role: 'user', content: JSON.stringify(payload) },
        ],
      }),
    })

    if (!r.ok) return null

    const json = await r.json()
    const texto: string = json?.choices?.[0]?.message?.content ?? ''
    const limpo = texto.replace(/```json|```/g, '').trim()
    const bruto = JSON.parse(limpo)

    if (!Array.isArray(bruto)) return null

    const idsValidos = new Set(alertas.map((a) => a.id))

    const saida: Sugestao[] = bruto
      .filter((s: any) => Array.isArray(s?.alertas))
      .map((s: any, i: number) => {
        const vinculados: string[] = s.alertas.filter((id: string) => idsValidos.has(id))
        return {
          id: 'ia-' + i,
          tipo: ['reroteamento', 'diplomatico', 'conformidade', 'risco'].includes(s.tipo)
            ? s.tipo
            : 'risco',
          titulo: String(s.titulo ?? 'Sugestão'),
          descricao: String(s.descricao ?? ''),
          acao: String(s.acao ?? ''),
          badge: String(s.badge ?? 'Analisar'),
          severidade: ['alta', 'media', 'baixa'].includes(s.severidade)
            ? s.severidade
            : 'media',
          alertas: vinculados,
          navios: navios
            .filter((n) => n.alertas.some((id) => vinculados.includes(id)))
            .map((n) => n.id),
          impacto: String(s.impacto ?? ''),
          origem: 'ia' as const,
        }
      })
      .filter((s) => s.alertas.length > 0)

    return saida.length > 0 ? saida : null
  } catch {
    return null
  }
}

export async function POST(req: Request) {
  let corpo: Corpo

  try {
    corpo = await req.json()
  } catch {
    return NextResponse.json({ erro: 'payload inválido' }, { status: 400 })
  }

  const alertas = corpo.alertas ?? []
  const navios = corpo.navios ?? []

  if (!alertas.length) {
    return NextResponse.json({ modo: 'regras', sugestoes: [] })
  }

  const daIA = await gerarComIA(alertas, navios)

  if (daIA) {
    return NextResponse.json({ modo: 'ia', modelo: MODELO, sugestoes: daIA })
  }

  return NextResponse.json({
    modo: 'regras',
    motivo: CHAVE ? 'falha na chamada' : 'sem chave configurada',
    sugestoes: gerarSugestoes(alertas, navios),
  })
}
