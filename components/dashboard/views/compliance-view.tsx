'use client'

import { useEffect, useState } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts'
import { CheckCircle2, ChevronDown, Clock, MapPin } from 'lucide-react'
import { Panel } from '@/components/dashboard/panel'
import { GenerateReportButton } from '@/components/dashboard/generate-report-button'
import type {
  CarbonCreditData,
  CarbonCreditPoint,
  ComplianceChecklist,
  ComplianceChecklistItem,
  ComplianceMapArea,
  ComplianceStatus,
} from '@/lib/entities/compliance'
import { MOCK_COMPLIANCE } from '@/lib/mock/compliance'

type ChecklistTone = 'green' | 'amber'

const CHECKLIST_TONE_CLASSES: Record<ChecklistTone, string> = {
  green: 'border-neon-green/50 text-neon-green',
  amber: 'border-neon-amber/50 text-neon-amber',
}

const CHECKLIST_STATUS_LABELS: Record<ComplianceStatus, string> = {
  verified: 'VERIFICADO',
  pending: 'PENDENTE',
}

const CHECKLIST_TONES: Record<ComplianceStatus, ChecklistTone> = {
  verified: 'green',
  pending: 'amber',
}

type ChecklistItemDisplay = {
  id: string
  title: string
  statusLabel: string
  toneClass: string
  verifiedLabel: string | null
  verified: boolean
}

type ChecklistDisplay = {
  sectionTitle: string
  completionLabel: string
  items: ChecklistItemDisplay[]
}

type CarbonDisplay = {
  growthLabel: string
  balanceLabel: string
  chartData: { monthLabel: string; balance: number }[]
}

type MapDisplay = {
  name: string
  boundaryLabel: string
  coordinates: string
  imageSrc: string
  imageAlt: string
  boundaryPath: string
}

function formatDate(timestamp: string): string {
  return new Date(timestamp).toLocaleDateString('pt-BR', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

function formatToday(date: Date): string {
  return date.toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  })
}

function toChecklistItemDisplay(
  item: ComplianceChecklistItem,
): ChecklistItemDisplay {
  return {
    id: item.id,
    title: item.title,
    statusLabel: CHECKLIST_STATUS_LABELS[item.status],
    toneClass: CHECKLIST_TONE_CLASSES[CHECKLIST_TONES[item.status]],
    verifiedLabel: item.verifiedAt ? formatDate(item.verifiedAt) : null,
    verified: item.status === 'verified',
  }
}

function toChecklistDisplay(checklist: ComplianceChecklist): ChecklistDisplay {
  return {
    sectionTitle: checklist.sectionTitle,
    completionLabel: `${checklist.completionPct}% Complete`,
    items: checklist.items.map(toChecklistItemDisplay),
  }
}

function toCarbonPointDisplay(point: CarbonCreditPoint) {
  return {
    monthLabel: point.monthLabel,
    balance: point.balanceTons,
  }
}

function toCarbonDisplay(carbon: CarbonCreditData): CarbonDisplay {
  return {
    growthLabel: `+${carbon.growthPct.toFixed(1)}%`,
    balanceLabel: `${carbon.currentBalanceTons.toLocaleString('pt-BR')} tCO2e`,
    chartData: carbon.points.map(toCarbonPointDisplay),
  }
}

function toMapDisplay(map: ComplianceMapArea): MapDisplay {
  return {
    name: map.name,
    boundaryLabel: map.boundaryLabel,
    coordinates: map.coordinates,
    imageSrc: map.imageSrc,
    imageAlt: map.imageAlt,
    boundaryPath: map.boundaryPath,
  }
}

function deriveCompliancePresentation(data: typeof MOCK_COMPLIANCE) {
  return {
    map: toMapDisplay(data.map),
    checklist: toChecklistDisplay(data.checklist),
    carbon: toCarbonDisplay(data.carbon),
  }
}

export function ComplianceView() {
  const [todayLabel, setTodayLabel] = useState<string | null>(null)

  useEffect(() => {
    setTodayLabel(formatToday(new Date()))
  }, [])

  const compliancePresentation = deriveCompliancePresentation(MOCK_COMPLIANCE)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Visão Geral de Conformidade{' '}
          <span className="font-normal text-muted-foreground">
            | {todayLabel ?? ''}
          </span>
        </h1>
        <GenerateReportButton accent="cyan" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Panel className="overflow-hidden p-0">
          <div className="relative h-full min-h-[520px]">
            <img
              src={compliancePresentation.map.imageSrc}
              alt={compliancePresentation.map.imageAlt}
              className="absolute inset-0 size-full object-cover"
            />
            <svg
              viewBox="0 0 400 520"
              className="absolute inset-0 size-full"
              preserveAspectRatio="xMidYMid slice"
            >
              <path
                d={compliancePresentation.map.boundaryPath}
                fill="var(--neon-green)"
                fillOpacity="0.28"
                stroke="var(--neon-green)"
                strokeWidth="2.5"
              />
            </svg>
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="rounded-lg border border-border bg-background/85 px-3 py-1.5 text-xs font-medium text-foreground backdrop-blur">
                {compliancePresentation.map.name}
              </div>
              <MapPin className="mx-auto mt-1 size-6 text-neon-green drop-shadow-[0_0_8px_var(--neon-green)]" />
            </div>
            <div className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-3 rounded-xl border border-border bg-background/85 p-3 backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="grid size-12 place-items-center rounded-lg bg-neon-green/10">
                  <MapPin className="size-6 text-neon-green" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {compliancePresentation.map.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {compliancePresentation.map.boundaryLabel}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {compliancePresentation.map.coordinates}
                  </p>
                </div>
              </div>
              <div className="grid size-14 place-items-center rounded-lg border border-neon-green/40 bg-neon-green/5">
                <div className="size-6 rounded border border-neon-green/60" />
              </div>
            </div>
          </div>
        </Panel>

        <div className="space-y-6">
          <Panel>
            <h3 className="mb-4 text-base font-semibold text-foreground">
              Checklist de Conformidade
            </h3>
            <div className="mb-2 flex items-center justify-between rounded-lg bg-accent px-3 py-2.5">
              <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                <ChevronDown className="size-4" />{' '}
                {compliancePresentation.checklist.sectionTitle}
              </span>
              <span className="text-xs text-neon-green">
                {compliancePresentation.checklist.completionLabel}
              </span>
            </div>
            <div className="grid grid-cols-[1fr_auto_auto] gap-x-4 px-1 pb-2 text-[11px] uppercase tracking-wide text-muted-foreground">
              <span>Item</span>
              <span className="text-right">Status</span>
              <span className="text-right">Ícone</span>
            </div>
            <ul>
              {compliancePresentation.checklist.items.map((item) => (
                <li
                  key={item.id}
                  className="grid grid-cols-[1fr_auto_auto] items-center gap-x-4 border-t border-border py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="size-4 rounded border border-border" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {item.title}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="rounded bg-neon-cyan/10 px-1.5 py-0.5 text-[10px] font-semibold text-neon-cyan">
                          VERIFICADO POR IA
                        </span>
                        {item.verifiedLabel && (
                          <span className="text-[11px] text-muted-foreground">
                            {item.verifiedLabel}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`justify-self-end rounded-md border px-2 py-0.5 text-[10px] font-semibold ${item.toneClass}`}
                  >
                    {item.statusLabel}
                  </span>
                  {item.verified ? (
                    <CheckCircle2 className="size-5 justify-self-end text-neon-green" />
                  ) : (
                    <Clock className="size-5 justify-self-end text-neon-amber" />
                  )}
                </li>
              ))}
            </ul>
          </Panel>

          <Panel>
            <div className="mb-1 flex items-start justify-between">
              <h3 className="text-base font-semibold text-foreground">
                Saldo de Créditos de Carbono
              </h3>
              <p className="text-sm font-semibold text-neon-green">
                {compliancePresentation.carbon.growthLabel}
              </p>
            </div>
            <div className="mb-4 flex items-end justify-between">
              <p className="text-sm text-muted-foreground">
                Saldo Atual:{' '}
                <span className="font-bold text-foreground">
                  {compliancePresentation.carbon.balanceLabel}
                </span>
              </p>
              <p className="text-xs text-muted-foreground">Crescimento Mensal</p>
            </div>
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={compliancePresentation.carbon.chartData}
                  margin={{ top: 10, right: 6, bottom: 0, left: -10 }}
                >
                  <CartesianGrid stroke="var(--border)" vertical={false} />
                  <XAxis
                    dataKey="monthLabel"
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 2000]}
                    ticks={[0, 500, 1000, 1500, 2000]}
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="balance"
                    stroke="var(--neon-cyan)"
                    strokeWidth={3}
                    dot={{ r: 3, fill: 'var(--neon-cyan)' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  )
}