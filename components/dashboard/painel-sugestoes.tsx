'use client'

import { RefreshCw, Loader2, Sparkles, Repeat, Bell, ShieldCheck, ListChecks } from 'lucide-react'
import {
  TIPO_LABEL,
  type Sugestao,
  type TipoSugestao,
  type SeveridadeSugestao,
} from '@/lib/data/sugestoes'

const ICONE: Record<TipoSugestao, typeof Repeat> = {
  reroteamento: Repeat,
  diplomatico: Bell,
  conformidade: ShieldCheck,
  risco: ListChecks,
}

const COR: Record<SeveridadeSugestao, { texto: string; borda: string; fundo: string }> = {
  alta: { texto: 'text-neon-red', borda: 'border-neon-red/40', fundo: 'bg-neon-red/5' },
  media: { texto: 'text-neon-amber', borda: 'border-neon-amber/40', fundo: 'bg-neon-amber/5' },
  baixa: { texto: 'text-neon-cyan', borda: 'border-neon-cyan/40', fundo: 'bg-neon-cyan/5' },
}

const SCROLL =
  'max-h-[26rem] overflow-y-auto pr-2 ' +
  '[scrollbar-width:thin] [scrollbar-color:var(--border)_transparent] ' +
  '[&::-webkit-scrollbar]:w-1.5 ' +
  '[&::-webkit-scrollbar-thumb]:rounded-full ' +
  '[&::-webkit-scrollbar-thumb]:bg-border ' +
  '[&::-webkit-scrollbar-track]:bg-transparent'

type Props = {
  sugestoes: Sugestao[]
  modo: 'regras' | 'ia'
  carregando: boolean
  onAnalisar: () => void
  onSelecionar: (s: Sugestao) => void
  selecionadaId: string | null
}

export function PainelSugestoes({
  sugestoes,
  modo,
  carregando,
  onAnalisar,
  onSelecionar,
  selecionadaId,
}: Props) {
  return (
    <div className="flex flex-col">
      <div className="mb-1 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Sparkles className="size-[22px] shrink-0 text-neon-amber" />
            <h3 className="text-[17px] font-semibold text-foreground">Sugestões por IA</h3>
          </div>
          <p className="mt-0.5 text-[12px] leading-snug text-muted-foreground">
            Derivadas dos {sugestoes.length > 0 ? 'alertas ativos no mapa' : 'alertas'}
            {' · '}
            {modo === 'ia' ? 'análise de modelo' : 'base de regras'}
          </p>
        </div>

        <button
          onClick={onAnalisar}
          disabled={carregando}
          title="Pedir uma nova análise à IA"
          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-neon-amber/40 bg-neon-amber/5 px-2.5 py-1.5 text-[12px] font-semibold text-neon-amber transition-colors hover:bg-neon-amber/10 disabled:opacity-50"
        >
          {carregando ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <RefreshCw className="size-3.5" />
          )}
          Analisar
        </button>
      </div>

      <div className={SCROLL}>
        {sugestoes.length === 0 && (
          <p className="py-6 text-center text-[12.5px] text-muted-foreground">
            Nenhum alerta ativo. Sem ação necessária no momento.
          </p>
        )}

        <ul>
          {sugestoes.map((s) => {
            const Icone = ICONE[s.tipo]
            const cor = COR[s.severidade]
            const ativa = s.id === selecionadaId

            return (
              <li key={s.id} className="border-b border-border last:border-b-0">
                <button
                  onClick={() => onSelecionar(s)}
                  className={
                    'w-full rounded px-1.5 py-2.5 text-left transition-colors ' +
                    (ativa ? 'bg-neon-amber/10' : 'hover:bg-background/40')
                  }
                >
                  <span className="flex items-start gap-2">
                    <Icone className={'mt-0.5 size-4 shrink-0 ' + cor.texto} />

                    <span className="min-w-0 flex-1">
                      <span className="flex items-start justify-between gap-2">
                        <span className="text-[13.5px] font-semibold leading-snug text-foreground">
                          {s.titulo}
                        </span>
                        <span
                          className={
                            'shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-semibold ' +
                            cor.borda +
                            ' ' +
                            cor.texto +
                            ' ' +
                            cor.fundo
                          }
                        >
                          {s.badge}
                        </span>
                      </span>

                      <span className="mt-1 block text-[12px] leading-relaxed text-muted-foreground">
                        {s.descricao}
                      </span>

                      <span className="mt-1.5 flex items-start gap-1.5 rounded-lg border border-border bg-background/40 px-2 py-1.5">
                        <span className="mt-px text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                          Ação
                        </span>
                        <span className="flex-1 text-[12px] leading-snug text-foreground">
                          {s.acao}
                        </span>
                      </span>

                      <span className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="rounded bg-background/60 px-1.5 py-0.5 text-[10.5px] font-medium text-muted-foreground">
                          {TIPO_LABEL[s.tipo]}
                        </span>
                        <span className="text-[11px] text-muted-foreground">{s.impacto}</span>
                        {s.origem === 'ia' && (
                          <span className="rounded border border-neon-amber/30 px-1.5 py-0.5 text-[10px] font-semibold text-neon-amber">
                            IA
                          </span>
                        )}
                      </span>
                    </span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      <p className="mt-2 border-t border-border pt-2 text-[11px] leading-snug text-muted-foreground">
        Clique numa sugestão para localizar o alerta no mapa e destacar os navios afetados.
      </p>
    </div>
  )
}
