import pkg from '@prisma/client'
import { randomBytes, scrypt } from 'node:crypto'

const { PrismaClient } = pkg
const prisma = new PrismaClient()

function derive(password, salt) {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, 64, (error, derived) => {
      if (error) reject(error)
      else resolve(derived)
    })
  })
}

async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex')
  const derived = await derive(password, salt)
  return `${salt}:${derived.toString('hex')}`
}

const users = [
  {
    email: 'caio@nexus.com',
    name: 'Caio Muniz',
    role: 'Director',
    password: 'nexus2026',
  },
  {
    email: 'sara@nexus.com',
    name: 'Sara Jenkins',
    role: 'Head of Operations',
    password: 'nexus2026',
  },
]

for (const entry of users) {
  const passwordHash = await hashPassword(entry.password)

  await prisma.user.upsert({
    where: { email: entry.email },
    update: { passwordHash },
    create: {
      email: entry.email,
      name: entry.name,
      role: entry.role,
      passwordHash,
    },
  })

  console.log(`OK ${entry.email}`)
}

await prisma.$disconnect()
