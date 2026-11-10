import { NextResponse } from 'next/server'
import { getFarms, invalidateFarms } from '@/lib/data/farms-cache'
import { readConfig } from '@/lib/data/farms-source'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function unauthorized(): boolean {
  const expected = process.env.FARMS_SYNC_TOKEN
  if (!expected) return process.env.NODE_ENV === 'production'
  return true
}

function tokenMatches(request: Request): boolean {
  const expected = process.env.FARMS_SYNC_TOKEN
  if (!expected) return true

  const header = request.headers.get('authorization') ?? ''
  const fromHeader = header.replace(/^Bearer\s+/i, '').trim()
  const fromQuery = new URL(request.url).searchParams.get('token') ?? ''

  return fromHeader === expected || fromQuery === expected
}

export async function GET() {
  try {
    const snapshot = await getFarms(false)

    return NextResponse.json(
      {
        ok: true,
        meta: snapshot.meta,
        total: snapshot.features.length,
        features: snapshot.features,
      },
      { headers: { 'cache-control': 'no-store' } },
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'falha ao consultar a fonte'

    return NextResponse.json(
      { ok: false, error: message, hint: 'verifique FARMS_SOURCE_URL e os nomes dos campos' },
      { status: 502 },
    )
  }
}

export async function POST(request: Request) {
  const config = readConfig()

  if (!config) {
    return NextResponse.json(
      { ok: false, error: 'FARMS_SOURCE_URL nao configurada' },
      { status: 503 },
    )
  }

  if (unauthorized()) {
    return NextResponse.json(
      { ok: false, error: 'FARMS_SYNC_TOKEN nao configurado no servidor' },
      { status: 503 },
    )
  }

  if (!tokenMatches(request)) {
    return NextResponse.json({ ok: false, error: 'nao autorizado' }, { status: 401 })
  }

  try {
    invalidateFarms()
    const snapshot = await getFarms(true)

    return NextResponse.json(
      {
        ok: true,
        refreshed: true,
        received: snapshot.meta.remote + snapshot.meta.seed,
        total: snapshot.features.length,
        meta: snapshot.meta,
      },
      { headers: { 'cache-control': 'no-store' } },
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'falha ao sincronizar'
    return NextResponse.json({ ok: false, error: message }, { status: 502 })
  }
}
