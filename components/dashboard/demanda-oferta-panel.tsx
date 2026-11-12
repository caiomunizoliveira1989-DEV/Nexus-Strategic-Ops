'use client'

import {
  INDICADORES,
  agregar,
  SAFRA,
  POPULACAO,
  type Indicador,
  type Status,
} from '@/lib/data/demanda-oferta'

const BARRA: Record<Status, string> = {
  critico: 'bg-neon-amber',
  apertado: 'bg-neon-cyan',
  equilibrado: 'bg-neon-green',
  folgado: 'bg-neon-blue',
}

const ROTULO: Record<Status, string> = {
  critico: 'crítico',
  apertado: 'apertado',
  equilibrado: 'equilibrado',
  folgado: 'folgado',
}

const ESCALA_MESES = 3

function sinal(v: number): string {
  return (v >= 0 ? '+' : '') + v.toFixed(1) + '%'
}

function Linha({ c }: { c: Indicador }) {
  const largura = Math.max(2, Math.min(100, (c.coberturaMeses / ESCALA_MESES) * 100))

  return (
    <li className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between gap-2 text-xs">
        <span className="font-semibold text-foreground">{c.nome}</span>
        <span className="text-muted-foreground">
          {c.coberturaMeses.toFixed(1)} m · {ROTULO[c.status]}
        </span>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className={'h-full rounded-full ' + BARRA[c.status]}
          style={{ width: largura + '%' }}
        />
      </div>

      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>exporta {Math.round(c.taxaExportacao * 100)}%</span>
        <span>pressão {sinal(c.pressaoPct)}</span>
      </div>
    </li>
  )
}

export function DemandaOfertaPanel() {
  const ag = agregar()

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground">
          Safra {SAFRA} · {(POPULACAO / 1e6).toFixed(0)} mi hab.
        </span>
        <span className="rounded-lg border border-neon-green/30 bg-neon-green/5 px-2 py-1 text-xs font-semibold text-neon-green">
          Impacto {ag.contribuicaoTotal.toFixed(2)} p.p.
        </span>
      </div>

      <ul className="flex min-h-0 flex-1 flex-col justify-between gap-2.5 overflow-y-auto pr-1">
        {INDICADORES.map((c) => (
          <Linha key={c.id} c={c} />
        ))}
      </ul>

      {ag.maisCritico && (
        <p className="rounded-lg border border-neon-amber/30 bg-neon-amber/5 px-3 py-2 text-[11px] leading-snug text-muted-foreground">
          Ponto mais frágil:{' '}
          <span className="font-semibold text-foreground">{ag.maisCritico.nome}</span> com{' '}
          {ag.maisCritico.coberturaMeses.toFixed(1)} mês de estoque.
        </p>
      )}
    </div>
  )
}
