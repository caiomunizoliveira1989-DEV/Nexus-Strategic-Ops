import { prisma } from '@/lib/db'
import type { User } from '@prisma/client'

export async function ensureUser(
  email: string,
  name: string,
  role: string,
): Promise<User> {
  const normalized = email.trim().toLowerCase()

  return prisma.user.upsert({
    where: { email: normalized },
    update: {},
    create: {
      email: normalized,
      name,
      role,
    },
  })
}
