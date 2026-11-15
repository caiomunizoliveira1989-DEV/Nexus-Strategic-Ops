'use client'

import { CheckCircle2, Clock, MinusCircle, Sparkles } from 'lucide-react'
import { Panel, PanelTitle } from '@/components/dashboard/panel'
import { ComplianceMap } from '@/components/dashboard/compliance-map'
import { CreditosCarbono } from '@/components/dashboard/creditos-carbono'
import { MOCK_CONFORMIDADE } from '@/lib/mock/compliance'
import {
  BLOCOS,
  ATUALIZADO_EM,
  progressoConformidade,
  itensComFila,
  type BlocoConformidade,
  type LinhaOrgao,
  type StatusOrgao,
} from '@/lib/data/conformidade-orgaos'

const numero = new Intl.NumberFormat('pt-BR')

const STATUS_TEXTO: Record<StatusOrgao, string> = {
  critico: 'Pendente',
  atencao: 'Em análise',
  regular: 'Verificado',
  monitoramento: 'Monitorado',
}

const STATUS_COR: Record<StatusOrgao, string> = {
  critico: 'text-neon-amber',
  atencao: 'text-neon-cyan',
  regular: 'text-neon-green',
  monitoramento: 'text-muted-foreground',
}

const SCROLL_CHECKLIST =
  'max-h-[22rem] overflow-y-auto pr-2 ' +
  '[scrollbar-width:thin] [scrollbar-color:var(--border)_transparent] ' +
  '[&::-webkit-scrollbar]:w-2 ' +
  '[&::-webkit-scrollbar-thumb]:rounded-full ' +
  '[&::-webkit-scrollbar-thumb]:bg-border ' +
  '[&::-webkit-scrollbar-track]:bg-transparent'

function IconeStatus({ status }: { status: StatusOrgao }) {
  if (status === 'regular') return <CheckCircle2 className="size-4" />
  if (status === 'monitoramento') return <MinusCircle className="size-4" />
  return <Clock className="size-4" />
}

function Linha({ linha }: { linha: LinhaOrgao }) {
  return (
    <li className="flex items-start gap-2.5 border-b border-border py-2 last:border-b-0">
      <span className="mt-1.5 size-3.5 shrink-0 rounded border border-border" aria-hidden />
      <span className="min-w-0 flex-1">
        <p className="text-base font-semibold leading-tight text-foreground">
          {linha.orgao}
        </p>
        <p className="text-xs leading-snug text-muted-foreground">{linha.documento}</p>
        <span className="mt-1 flex flex-wrap items-center gap-1.5">
          <span className="flex items-center gap-1 rounded border border-neon-blue/30 bg-neon-blue/5 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-neon-blue">
            <Sparkles className="size-2.5" /> {linha.competencia}
          </span>
          <span className="text-[10px] text-muted-foreground">{linha.fonte}</span>
        </span>
      </span>
      <span className="shrink-0 text-right">
        <span
          className={
            'flex items-center justify-end gap-1 text-xs font-semibold ' +
            STATUS_COR[linha.status]
          }
        >
          <IconeStatus status={linha.status} />
          {STATUS_TEXTO[linha.status]}
        </span>
        <span className="mt-0.5 block text-[11px] text-muted-foreground">
          {linha.comDocumentacao}
        </span>
        {linha.temFila && (
          <span className="mt-0.5 block text-[11px] font-semibold text-foreground">
            {linha.naFila} na fila
          </span>
        )}
      </span>
    </li>
  )
}

function Bloco({ bloco }: { bloco: BlocoConformidade }) {
  return (
    <div className="mb-2.5 last:mb-0">
      <p className="text-xs font-bold uppercase leading-tight tracking-wide text-foreground">
        {bloco.titulo}
      </p>
      <p className="text-[10px] leading-snug text-muted-foreground">{bloco.descricao}</p>
      <ul>
        {bloco.linhas.map((linha) => (
          <Linha key={linha.id} linha={linha} />
        ))}
      </ul>
    </div>
  )
}

export function ComplianceView() {
  const dados = MOCK_CONFORMIDADE
  const progresso = progressoConformidade()

  return (
    <div className="w-full space-y-3">
      <div>
        <h1 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
          Conformidade Ambiental
        </h1>
        <p className="text-[11px] text-muted-foreground">
          {dados.area.nome} · fontes oficiais atualizadas em {ATUALIZADO_EM}
        </p>
      </div>

      <div className="flex w-full flex-col gap-4 md:flex-row md:items-stretch">
        <div className="flex min-w-0 flex-col md:w-[60%]">
          <Panel className="flex h-full w-full min-h-0 flex-col">
            <PanelTitle className="mb-2 shrink-0">Mapa de Limites</PanelTitle>
            <ComplianceMap area={dados.area} />
          </Panel>
        </div>

        <div className="flex min-w-0 flex-col gap-4 md:w-[40%]">
          <Panel className="flex w-full flex-col">
            <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
              <PanelTitle className="mb-0">Checklist de Conformidade</PanelTitle>
              <span className="rounded-lg border border-neon-green/30 bg-neon-green/5 px-2 py-0.5 text-[11px] font-semibold text-neon-green">
                {progresso}% concluído
              </span>
            </div>

            <div className={SCROLL_CHECKLIST}>
              {BLOCOS.map((bloco) => (
                <Bloco key={bloco.id} bloco={bloco} />
              ))}
            </div>

            <p className="mt-1.5 border-t border-border pt-1.5 text-[10px] text-muted-foreground">
              {itensComFila()} itens com fila publicada · {numero.format(BLOCOS.length)} blocos
            </p>
          </Panel>

          <Panel className="flex w-full flex-col">
            <CreditosCarbono />
          </Panel>
        </div>
      </div>
    </div>
  )
}
