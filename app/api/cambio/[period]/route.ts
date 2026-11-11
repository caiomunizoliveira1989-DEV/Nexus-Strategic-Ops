import { NextResponse } from 'next/server'

const PTAX =
  'https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoDolarPeriodo'

type Row = { cotacaoCompra: number }

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ period: string }> },
) {
  const { period } = await ctx.params
  if (!/^\d{4}-\d{2}$/.test(period)) {
    return NextResponse.json({ error: 'Use AAAA-MM' }, { status: 400 })
  }

  const [ano, mes] = period.split('-')
  const ultimo = new Date(Number(ano), Number(mes), 0).getDate()
  const url =
    PTAX +
    '(dataInicial=@dataInicial,dataFinalCotacao=@dataFinalCotacao)' +
    "?@dataInicial='" + mes + '-01-' + ano + "'" +
    "&@dataFinalCotacao='" + mes + '-' + String(ultimo).padStart(2, '0') + '-' + ano + "'" +
    '&$format=json&$select=cotacaoCompra'

  try {
    const res = await fetch(url, { next: { revalidate: 3600 } })
    if (!res.ok) return NextResponse.json({ period, ptaxMedio: null })
    const json = (await res.json()) as { value?: Row[] }
    const rows = json.value ?? []
    const ptaxMedio = rows.length
      ? Math.round(
          (rows.reduce((a, r) => a + Number(r.cotacaoCompra), 0) / rows.length) * 10000,
        ) / 10000
      : null
    return NextResponse.json({ period, ptaxMedio, fonte: 'BCB/PTAX' })
  } catch {
    return NextResponse.json({ period, ptaxMedio: null })
  }
}
