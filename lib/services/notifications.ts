export type NotificationCode =
  | 'storm'
  | 'rain'
  | 'windHigh'
  | 'water'
  | 'bridge'

export type NotificationSeverity = 'low' | 'medium' | 'high' | 'critical'

export type AppNotification = {
  id: string
  code: NotificationCode
  severity: NotificationSeverity
  farmId: string
  farmName: string
  region: string
  title: string
  detail: string
  dayOffset: number
}

export type FarmLike = {
  id: string
  name: string
  status?: string
  city?: string
  state?: string
}

const CATALOG: Record<
  NotificationCode,
  { severity: NotificationSeverity; title: string; detail: string }
> = {
  storm: {
    severity: 'critical',
    title: 'Tempestade prevista',
    detail: 'Rajadas acima de 70 km/h nas proximas 48h. Suspender pulverizacao.',
  },
  rain: {
    severity: 'medium',
    title: 'Chuva intensa',
    detail: 'Acumulado de 45 mm previsto. Revisar drenagem das parcelas baixas.',
  },
  windHigh: {
    severity: 'medium',
    title: 'Vento forte',
    detail: 'Vento constante acima de 40 km/h. Evitar aplicacao aerea.',
  },
  water: {
    severity: 'high',
    title: 'Risco hidrico',
    detail: 'Reservatorio abaixo de 35% da capacidade. Revisar o calendario de irrigacao.',
  },
  bridge: {
    severity: 'high',
    title: 'Ponte com restricao',
    detail: 'Ponte na via de escoamento interditada para carga pesada.',
  },
}

const CODES: NotificationCode[] = ['storm', 'rain', 'water', 'bridge', 'windHigh']

function hash(value: string): number {
  let h = 0
  for (let i = 0; i < value.length; i += 1) {
    h = (h * 31 + value.charCodeAt(i)) % 100000
  }
  return h
}

function toFarm(raw: unknown): FarmLike | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  const p =
    r.properties && typeof r.properties === 'object'
      ? (r.properties as Record<string, unknown>)
      : r

  const name =
    typeof p.name === 'string'
      ? p.name
      : typeof p.nome === 'string'
        ? p.nome
        : ''

  const id = typeof p.id === 'string' ? p.id : name
  if (!id) return null

  return {
    id,
    name: name || id,
    status: typeof p.status === 'string' ? p.status : undefined,
    city: typeof p.city === 'string' ? p.city : undefined,
    state: typeof p.state === 'string' ? p.state : undefined,
  }
}

export function normalizeFarms(input: unknown): FarmLike[] {
  if (Array.isArray(input)) {
    return input.map(toFarm).filter((f): f is FarmLike => f !== null)
  }
  const obj = input as { features?: unknown[] } | null
  if (obj && Array.isArray(obj.features)) {
    return obj.features.map(toFarm).filter((f): f is FarmLike => f !== null)
  }
  return []
}

export function buildNotifications(input: unknown): AppNotification[] {
  const farms = normalizeFarms(input)
  const alertFarms = farms.filter((farm) => farm.status === 'alert')
  const pool = alertFarms.length > 0 ? alertFarms : farms
  const out: AppNotification[] = []

  for (const farm of pool) {
    const base = hash(farm.id)
    const total = (base % 2) + 1

    for (let i = 0; i < total; i += 1) {
      const code = CODES[(base + i) % CODES.length]
      const meta = CATALOG[code]
      const region = [farm.city, farm.state].filter(Boolean).join(' / ')

      out.push({
        id: farm.id + '-' + code,
        code,
        severity: meta.severity,
        farmId: farm.id,
        farmName: farm.name,
        region,
        title: meta.title,
        detail: meta.detail,
        dayOffset: (base + i) % 3,
      })
    }

    if (out.length >= 8) break
  }

  return out
}
