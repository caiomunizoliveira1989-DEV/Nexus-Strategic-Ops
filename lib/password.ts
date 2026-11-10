import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto'

const KEY_LENGTH = 64

function derive(password: string, salt: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, KEY_LENGTH, (error, derived) => {
      if (error) reject(error)
      else resolve(derived)
    })
  })
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex')
  const derived = await derive(password, salt)
  return `${salt}:${derived.toString('hex')}`
}

export async function verifyPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  if (!stored || !stored.includes(':')) return false

  const [salt, hash] = stored.split(':')
  if (!salt || !hash) return false

  const derived = await derive(password, salt)
  const expected = Buffer.from(hash, 'hex')

  if (derived.length !== expected.length) return false

  return timingSafeEqual(derived, expected)
}
