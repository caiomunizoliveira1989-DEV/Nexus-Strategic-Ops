import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { ensureUser } from '@/lib/user'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const LIMITS = {
  name: 80,
  role: 60,
  company: 80,
  phone: 30,
  location: 80,
  bio: 500,
} as const

type Field = keyof typeof LIMITS

function sanitize(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

export async function GET() {
  const session = await auth()

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const user = await ensureUser(
    session.user.email,
    session.user.name ?? 'Usuário',
    session.user.role ?? 'Director',
  )

  return NextResponse.json({ user })
}

export async function PATCH(request: Request) {
  const session = await auth()

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  let body: Record<string, unknown>

  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'Corpo inválido' }, { status: 400 })
  }

  const data = {} as Record<Field, string>

  for (const field of Object.keys(LIMITS) as Field[]) {
    data[field] = sanitize(body[field], LIMITS[field])
  }

  if (!data.name) {
    return NextResponse.json(
      { error: 'O nome é obrigatório' },
      { status: 400 },
    )
  }

  if (!data.role) {
    data.role = 'Director'
  }

  await ensureUser(
    session.user.email,
    session.user.name ?? 'Usuário',
    session.user.role ?? 'Director',
  )

  const user = await prisma.user.update({
    where: { email: session.user.email.trim().toLowerCase() },
    data,
  })

  return NextResponse.json({ user })
}
