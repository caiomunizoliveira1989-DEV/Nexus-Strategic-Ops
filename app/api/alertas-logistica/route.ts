import { NextResponse } from 'next/server'
import {
  ALERTAS_LOGISTICA,
  RESULTADO_ALERTAS,
  resumoAlertas,
} from '@/lib/data/alertas-logistica'

/* Busca uma vez por dia: o Next guarda a resposta por 24h.
   Para plugar um feed ao vivo (UKMTO, MarineTraffic, portos),
   faça o fetch aqui dentro e normaliza para o tipo AlertaLogistica. */
export const revalidate = 86400

export async function GET() {
  const agora = new Date()

  return NextResponse.json({
    atualizadoEm: agora.toISOString(),
    referencia: RESULTADO_ALERTAS.referencia,
    fontes: RESULTADO_ALERTAS.fontes,
    alertas: ALERTAS_LOGISTICA,
    resumo: resumoAlertas(ALERTAS_LOGISTICA),
  })
}
