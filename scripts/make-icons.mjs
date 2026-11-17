import fs from 'node:fs'
import zlib from 'node:zlib'

const BG = [11, 15, 20, 255]
const CYAN = [34, 211, 238]
const GREEN = [34, 197, 94]

let TABLE = null
function crc32(buf) {
  if (!TABLE) {
    TABLE = new Array(256)
    for (let n = 0; n < 256; n++) {
      let c = n
      for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1)
      TABLE[n] = c >>> 0
    }
  }
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) c = TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length, 0)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body), 0)
  return Buffer.concat([len, body, crc])
}

function lerp(a, b, t) { return Math.round(a + (b - a) * t) }

function colorAt(x, y, size, pad) {
  const inset = Math.round(size * pad)
  const inner = size - inset * 2
  const barW = Math.max(1, Math.round(inner * 0.16))
  const gap = Math.max(1, Math.round(inner * 0.11))
  const totalW = barW * 3 + gap * 2
  const startX = Math.round((size - totalW) / 2)
  const baseY = size - inset - Math.round(inner * 0.08)
  const heights = [0.44, 0.64, 0.84].map(function (h) { return Math.round(inner * h) })
  for (let i = 0; i < 3; i++) {
    const x0 = startX + i * (barW + gap)
    const x1 = x0 + barW
    const top = baseY - heights[i]
    if (x >= x0 && x < x1 && y >= top && y < baseY) {
      const t = (y - top) / Math.max(1, heights[i])
      return [lerp(CYAN[0], GREEN[0], t), lerp(CYAN[1], GREEN[1], t), lerp(CYAN[2], GREEN[2], t), 255]
    }
  }
  return BG
}

function makePng(size, pad, file) {
  const stride = size * 4 + 1
  const raw = Buffer.alloc(stride * size)
  for (let y = 0; y < size; y++) {
    raw[y * stride] = 0
    for (let x = 0; x < size; x++) {
      const c = colorAt(x, y, size, pad)
      const o = y * stride + 1 + x * 4
      raw[o] = c[0]
      raw[o + 1] = c[1]
      raw[o + 2] = c[2]
      raw[o + 3] = c[3]
    }
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8
  ihdr[9] = 6
  const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
  fs.writeFileSync(file, png)
  console.log('gerado ' + file + ' (' + png.length + ' bytes)')
}

fs.mkdirSync('public/icons', { recursive: true })
makePng(192, 0.08, 'public/icons/icon-192.png')
makePng(512, 0.08, 'public/icons/icon-512.png')
makePng(512, 0.16, 'public/icons/icon-maskable-512.png')
