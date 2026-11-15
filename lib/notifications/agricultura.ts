import type { NivelNotificacao, Notificacao } from '@/lib/notifications/store'

export type GrupoAgro = 'solo' | 'lavoura' | 'clima' | 'praga' | 'fazenda' | 'alerta' | 'feed'

export type SinalAgro = {
  id: string
  grupo: GrupoAgro
  rotulo: string
  valor: string
  numero?: number
  limiar?: number
  nivel: NivelNotificacao
  detalhe?: string
  meta?: string
  mapa?: { lat: number; lng: number; zoom: number }
}

type Registro = { v: string; n?: number }
type Snapshot = { dia: string; sinais: Record<string, Registro> }

const CHAVE = 'nexus:agricultura:snapshot:v1'
const RELATIVO = 0.005

function hoje(): string {
  return new Date().toISOString().slice(0, 10)
}

function ler(): Snapshot | null {
  if (typeof window === 'undefined') return null
  try {
    const bruto = window.localStorage.getItem(CHAVE)
    if (!bruto) return null
    const s = JSON.parse(bruto)
    if (!s || typeof s.sinais !== 'object') return null
    return { dia: String(s.dia ?? ''), sinais: s.sinais }
  } catch {
    return null
  }
}

function gravar(s: Snapshot) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(CHAVE, JSON.stringify(s))
  } catch {
    /* sem storage */
  }
}

function variou(ant: Registro, atual: SinalAgro): boolean {
  if (ant.v === atual.valor) return false
  if (typeof ant.n === 'number' && typeof atual.numero === 'number') {
    const delta = Math.abs(atual.numero - ant.n)
    if (typeof atual.limiar === 'number') return delta >= atual.limiar
    const base = Math.abs(ant.n)
    return base === 0 ? delta > 0 : delta / base >= RELATIVO
  }
  return true
}

const ORDEM: Record<NivelNotificacao, number> = { critico: 0, atencao: 1, info: 2 }

export function notificacoesDeAgricultura(sinais: SinalAgro[]): Notificacao[] {
  const mapa: Record<string, Registro> = {}
  for (const s of sinais) {
    mapa[s.id] = typeof s.numero === 'number' ? { v: s.valor, n: s.numero } : { v: s.valor }
  }

  const anterior = ler()

  if (anterior && anterior.dia === hoje()) return []

  if (!anterior) {
    gravar({ dia: hoje(), sinais: mapa })
    return []
  }

  const novos: { sinal: SinalAgro; ant: Registro | null }[] = []

  for (const s of sinais) {
    const ant = anterior.sinais[s.id] ?? null
    if (!ant) {
      novos.push({ sinal: s, ant: null })
      continue
    }
    if (s.grupo === 'feed') continue
    if (variou(ant, s)) novos.push({ sinal: s, ant })
  }

  gravar({ dia: hoje(), sinais: mapa })

  return novos
    .sort((a, b) => ORDEM[a.sinal.nivel] - ORDEM[b.sinal.nivel])
    .slice(0, 10)
    .map(({ sinal, ant }) => ({
      id: 'agro-' + sinal.id + '-' + (ant?.v ?? 'novo'),
      nivel: sinal.nivel,
      titulo: sinal.rotulo,
      local: sinal.valor,
      descricao: ant
        ? (sinal.detalhe ? sinal.detalhe + ' ' : '') + 'Antes: ' + ant.v + '.'
        : sinal.detalhe ?? 'Leitura nova, não registrada no retrato anterior da tela.',
      meta: sinal.meta ?? sinal.grupo,
      quando: 'hoje',
      mapa: sinal.mapa,
    }))
}

/* ---------- leitura tolerante ---------- */

type Solto = Record<string, unknown>

const obj = (v: unknown): Solto => (v && typeof v === 'object' ? (v as Solto) : {})
const lista = (v: unknown): Solto[] => (Array.isArray(v) ? v.map(obj) : [])

function num(v: unknown): number | undefined {
  if (typeof v === 'number' && Number.isFinite(v)) return v
  if (v && typeof v === 'object') {
    const o = v as Solto
    return num(o.valor ?? o.value ?? o.atual ?? o.total ?? o.count)
  }
  if (typeof v === 'string') {
    const s = v.trim().replace(/%/g, '').replace(/\s/g, '')
    if (!s) return undefined
    const limpo = s.includes(',') ? s.replace(/\./g, '').replace(',', '.') : s
    const n = Number(limpo.replace(/[^0-9.-]/g, ''))
    return Number.isFinite(n) ? n : undefined
  }
  return undefined
}

function txt(...c: unknown[]): string {
  for (const v of c) if (typeof v === 'string' && v.trim()) return v.trim()
  return ''
}

function arred(n: number, casas = 0): string {
  return n.toLocaleString('pt-BR', {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  })
}

/* Severity vem como 'low' | 'medium' | 'high' ou equivalente em PT */
function nivelDe(t: string): NivelNotificacao {
  const s = t.toLowerCase()
  if (/high|alto|crit|grav|sever/.test(s)) return 'critico'
  if (/medium|méd|med|aten|moder/.test(s)) return 'atencao'
  return 'info'
}

function coord(...c: unknown[]): { lat: number; lng: number } | null {
  const lat = num(c[0])
  const lng = num(c[1])
  if (lat === undefined || lng === undefined) return null
  if (!lat || !lng) return null
  return { lat, lng }
}

function codigoBonito(c: string): string {
  return c
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^\w/, (l) => l.toUpperCase())
}

export function sinaisDeAgricultura(dados: unknown): SinalAgro[] {
  const d = obj(dados)
  const sinais: SinalAgro[] = []

  const stats = obj(d.stats ?? d.indicadores ?? d.resumo)

  const solo = num(
    d.umidadeSolo ?? d.soilMoisture ?? d.umidadeSoloPct ?? d.umidade ?? stats.umidadeSolo ?? stats.soilMoisture,
  )
  if (solo !== undefined) {
    sinais.push({
      id: 'solo',
      grupo: 'solo',
      rotulo: 'Umidade do solo mudou',
      valor: arred(solo) + '%',
      numero: solo,
      limiar: 2,
      nivel: solo < 25 ? 'atencao' : 'info',
      detalhe: solo < 25 ? 'Abaixo de 25%: risco de estresse hídrico.' : undefined,
      meta: 'Indicadores',
    })
  }

  const saude = num(
    d.saudeLavoura ?? d.cropHealth ?? d.saude ?? d.indiceSaude ?? stats.saudeLavoura ?? stats.cropHealth,
  )
  if (saude !== undefined) {
    sinais.push({
      id: 'saude',
      grupo: 'lavoura',
      rotulo: 'Saúde da lavoura mudou',
      valor: arred(saude) + '%',
      numero: saude,
      limiar: 2,
      nivel: saude < 60 ? 'atencao' : 'info',
      detalhe: saude < 60 ? 'Fora da faixa ideal de 55 a 75%.' : undefined,
      meta: 'Indicadores',
    })
  }

  /* alertas: cada código vira um sinal próprio */
  const alertas = lista(d.alertas ?? d.alerts ?? d.alertasClimaticos ?? [])

  for (const a of alertas) {
    const code = txt(a.code, a.codigo, a.id, a.tipo)
    if (!code) continue
    const sev = txt(a.severity, a.severidade, a.nivel) || 'low'
    const quando = txt(a.ts, a.timestamp, a.data, a.date)

    sinais.push({
      id: 'alerta-' + code.toLowerCase(),
      grupo: 'alerta',
      rotulo: 'Novo alerta: ' + codigoBonito(code),
      valor: sev,
      nivel: nivelDe(sev),
      detalhe: txt(a.mensagem, a.message, a.descricao) || 'Alerta emitido para a área monitorada.',
      meta: 'INMET · CEMADEN · INPE',
      mapa: coord(a.lat, a.lng) ? { ...coord(a.lat, a.lng)!, zoom: 11 } : undefined,
    })

    if (quando) {
      sinais.push({
        id: 'alerta-' + code.toLowerCase() + '-ts',
        grupo: 'alerta',
        rotulo: 'Horário do alerta ' + codigoBonito(code),
        valor: quando,
        nivel: 'info',
        meta: 'Feed',
      })
    }
  }

  const contagem = num(
    d.alertasClimaticosAtivos ?? d.alertasAtivos ?? d.alertasCount ?? stats.alertasClimaticosAtivos,
  )
  if (contagem !== undefined) {
    sinais.push({
      id: 'alertas-clima',
      grupo: 'clima',
      rotulo:
        contagem > 0
          ? contagem + ' alerta(s) climático(s) ativo(s)'
          : 'Alertas climáticos zerados',
      valor: String(contagem),
      numero: contagem,
      limiar: 1,
      nivel: contagem > 0 ? 'critico' : 'info',
      detalhe: contagem > 0 ? 'Aviso oficial vigente para a área.' : undefined,
      meta: 'INMET · CEMADEN · INPE',
    })
  }

  const praga = txt(d.riscoPraga ?? d.praga ?? d.zonasRiscoPraga ?? stats.riscoPraga)
  if (praga) {
    sinais.push({
      id: 'praga',
      grupo: 'praga',
      rotulo: 'Risco de praga passou para ' + praga,
      valor: praga,
      nivel: nivelDe(praga),
      meta: 'Risco fitossanitário',
    })
  }

  const ndvi = num(d.ndvi ?? d.NDVI ?? obj(d.mapa).ndvi)
  if (ndvi !== undefined) {
    sinais.push({
      id: 'ndvi',
      grupo: 'lavoura',
      rotulo: 'NDVI atualizado',
      valor: arred(ndvi, 2),
      numero: ndvi,
      limiar: 0.03,
      nivel: ndvi < 0.5 ? 'atencao' : 'info',
      detalhe: ndvi < 0.5 ? 'Vigor vegetativo abaixo do esperado.' : undefined,
      meta: 'Índice de vegetação',
    })
  }

  const clima = obj(d.clima ?? d.weather ?? d.condicoes ?? d.previsao ?? d.forecast)
  const atual = obj(clima.atual ?? clima.current ?? clima.agora ?? clima)

  const temp = num(atual.temperatura ?? atual.temp ?? atual.temperature)
  if (temp !== undefined) {
    sinais.push({
      id: 'temperatura',
      grupo: 'clima',
      rotulo: 'Temperatura na fazenda',
      valor: arred(temp, 1) + ' °C',
      numero: temp,
      limiar: 1,
      nivel: temp >= 35 || temp <= 5 ? 'atencao' : 'info',
      meta: 'Open-Meteo',
    })
  }

  const ur = num(atual.umidadeRelativa ?? atual.umidade ?? atual.humidity ?? atual.rh)
  if (ur !== undefined) {
    sinais.push({
      id: 'umidade-relativa',
      grupo: 'clima',
      rotulo: 'Umidade relativa do ar',
      valor: arred(ur) + '%',
      numero: ur,
      limiar: 3,
      nivel: ur < 30 ? 'atencao' : 'info',
      meta: 'Open-Meteo',
    })
  }

  const vento = num(atual.vento ?? atual.wind ?? atual.windSpeed)
  if (vento !== undefined) {
    sinais.push({
      id: 'vento',
      grupo: 'clima',
      rotulo: 'Vento medido',
      valor: arred(vento) + ' km/h',
      numero: vento,
      limiar: 5,
      nivel: vento >= 30 ? 'atencao' : 'info',
      meta: 'Open-Meteo',
    })
  }

  const chuva = num(atual.precipitacao ?? atual.chuva ?? atual.rain ?? atual.precipitation)
  if (chuva !== undefined) {
    sinais.push({
      id: 'precipitacao',
      grupo: 'clima',
      rotulo: 'Precipitação acumulada',
      valor: arred(chuva, 1) + ' mm',
      numero: chuva,
      limiar: 1,
      nivel: 'info',
      meta: 'Open-Meteo',
    })
  }

  for (const f of lista(d.fazendas ?? d.farms ?? d.areas ?? d.farmList)) {
    const nome = txt(f.nome, f.name, f.titulo, f.label)
    const status = txt(f.status, f.situacao, f.estado, f.state)
    if (!nome || !status) continue

    const c = coord(f.lat ?? f.latitude, f.lng ?? f.longitude ?? f.lon)
    const emAlerta = /alert/i.test(status)

    sinais.push({
      id: 'fazenda-' + nome.toLowerCase().replace(/\s+/g, '-'),
      grupo: 'fazenda',
      rotulo: nome + ' passou a ' + status,
      valor: status,
      nivel: emAlerta ? 'critico' : 'info',
      detalhe: emAlerta ? 'A área saiu de monitorada e entrou em alerta.' : undefined,
      meta: 'Fazendas monitoradas',
      mapa: c ? { lat: c.lat, lng: c.lng, zoom: 11 } : undefined,
    })
  }

  lista(d.feed ?? d.atividades ?? d.eventos ?? d.activity).forEach((a, i) => {
    const code = txt(a.code, a.codigo, a.tipo)
    const texto = txt(a.texto, a.descricao, a.titulo, a.mensagem, a.message)
    const chave = code || texto
    if (!chave) return

    const c = coord(a.lat, a.lng)

    sinais.push({
      id: 'feed-' + chave.slice(0, 40).toLowerCase().replace(/\s+/g, '-') + '-' + i,
      grupo: 'feed',
      rotulo: 'Nova atividade: ' + (code ? codigoBonito(code) : 'evento'),
      valor: texto || code || 'evento',
      nivel: nivelDe(txt(a.severity, a.severidade) || 'low'),
      detalhe: texto || undefined,
      meta: 'Feed ao vivo',
      mapa: c ? { lat: c.lat, lng: c.lng, zoom: 11 } : undefined,
    })
  })

  return sinais
}
