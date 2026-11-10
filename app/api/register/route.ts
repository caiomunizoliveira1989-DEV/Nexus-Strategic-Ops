import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hashPassword } from '@/lib/password'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: Request) {
  let body: Record<string, unknown>

  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'Corpo invalido' }, { status: 400 })
  }

  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const email =
    typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const password = typeof body.password === 'string' ? body.password : ''

  if (name.length < 2) {
    return NextResponse.json(
      { error: 'Informe seu nome completo' },
      { status: 400 },
    )
  }

  if (!EMAIL_PATTERN.test(email)) {
    return NextResponse.json({ error: 'E-mail invalido' }, { status: 400 })
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: 'A senha precisa ter ao menos 8 caracteres' },
      { status: 400 },
    )
  }

  const existing = await prisma.user.findUnique({ where: { email: email } })

  if (existing) {
    return NextResponse.json(
      { error: 'Este e-mail ja esta cadastrado' },
      { status: 409 },
    )
  }

  const passwordHash = await hashPassword(password)

  let role = 'Analyst'

  if (typeof body.role === 'string') {
    const trimmed = body.role.trim()
    if (trimmed.length > 0) {
      role = trimmed.slice(0, 60)
    }
  }

  const user = await prisma.user.create({
    data: {
      email: email,
      name: name,
      passwordHash: passwordHash,
      role: role,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  })

  return NextResponse.json({ user: user }, { status: 201 })
}
