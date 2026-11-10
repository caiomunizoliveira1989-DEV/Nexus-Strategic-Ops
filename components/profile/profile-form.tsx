'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Save,
  TriangleAlert,
} from 'lucide-react'

export type ProfileData = {
  name: string
  email: string
  role: string
  company: string
  phone: string
  location: string
  bio: string
}

function getInitials(name: string, email: string): string {
  const source = name.trim() || email.trim()
  if (!source) return 'NX'
  const parts = source.split(/\s+/).filter(Boolean)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

export function ProfileForm({ initial }: { initial: ProfileData }) {
  const [form, setForm] = useState<ProfileData>(initial)
  const [pending, setPending] = useState(false)
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle')
  const [message, setMessage] = useState<string | null>(null)

  function update<K extends keyof ProfileData>(key: K, value: ProfileData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setStatus('idle')
    setMessage(null)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setStatus('idle')
    setMessage(null)

    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          role: form.role,
          company: form.company,
          phone: form.phone,
          location: form.location,
          bio: form.bio,
        }),
      })

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as
          | { error?: string }
          | null
        throw new Error(data?.error ?? 'Não foi possível salvar')
      }

      setStatus('saved')
      setMessage('Perfil salvo com sucesso.')
    } catch (error) {
      setStatus('error')
      setMessage(
        error instanceof Error ? error.message : 'Não foi possível salvar.',
      )
    } finally {
      setPending(false)
    }
  }

  const inputClass =
    'w-full rounded-lg border border-border bg-background/60 px-3 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-neon-green/60 focus:ring-2 focus:ring-neon-green/20 disabled:opacity-60'

  const labelClass =
    'block text-xs font-medium uppercase tracking-wide text-muted-foreground'

  return (
    <div className="space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Voltar ao dashboard
      </Link>

      <div className="flex items-center gap-4">
        <span className="grid size-16 place-items-center rounded-xl border border-neon-green/40 bg-neon-green/10 text-lg font-bold text-neon-green">
          {getInitials(form.name, form.email)}
        </span>
        <div>
          <h1 className="text-xl font-bold text-foreground sm:text-2xl">
            Meu perfil
          </h1>
          <p className="text-sm text-muted-foreground">{form.email}</p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-border bg-card/50 p-5 sm:p-6"
      >
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="name" className={labelClass}>
              Nome
            </label>
            <input
              id="name"
              required
              maxLength={80}
              value={form.name}
              onChange={(event) => update('name', event.target.value)}
              disabled={pending}
              className={inputClass}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="role" className={labelClass}>
              Cargo
            </label>
            <input
              id="role"
              maxLength={60}
              value={form.role}
              onChange={(event) => update('role', event.target.value)}
              disabled={pending}
              className={inputClass}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="company" className={labelClass}>
              Empresa
            </label>
            <input
              id="company"
              maxLength={80}
              value={form.company}
              onChange={(event) => update('company', event.target.value)}
              disabled={pending}
              placeholder="NEXUS Strategic Ops"
              className={inputClass}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="phone" className={labelClass}>
              Telefone
            </label>
            <input
              id="phone"
              maxLength={30}
              value={form.phone}
              onChange={(event) => update('phone', event.target.value)}
              disabled={pending}
              placeholder="+55 11 90000-0000"
              className={inputClass}
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label htmlFor="location" className={labelClass}>
              Localização
            </label>
            <input
              id="location"
              maxLength={80}
              value={form.location}
              onChange={(event) => update('location', event.target.value)}
              disabled={pending}
              placeholder="São Paulo, Brasil"
              className={inputClass}
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label htmlFor="bio" className={labelClass}>
              Bio
            </label>
            <textarea
              id="bio"
              rows={4}
              maxLength={500}
              value={form.bio}
              onChange={(event) => update('bio', event.target.value)}
              disabled={pending}
              placeholder="Responsável pela operação estratégica da companhia."
              className={`${inputClass} resize-none`}
            />
            <p className="text-right text-[11px] text-muted-foreground">
              {form.bio.length}/500
            </p>
          </div>
        </div>

        {message && (
          <div
            role="status"
            className={`mt-5 flex items-start gap-2 rounded-lg border px-3 py-2.5 text-xs ${
              status === 'saved'
                ? 'border-neon-green/40 bg-neon-green/10 text-neon-green'
                : 'border-neon-red/40 bg-neon-red/10 text-neon-red'
            }`}
          >
            {status === 'saved' ? (
              <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
            ) : (
              <TriangleAlert className="mt-0.5 size-4 shrink-0" />
            )}
            <span>{message}</span>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={pending || !form.name.trim()}
            className="flex items-center gap-2 rounded-lg border border-neon-green/50 bg-neon-green/15 px-4 py-2.5 text-sm font-semibold text-neon-green transition-colors hover:bg-neon-green/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Salvando...
              </>
            ) : (
              <>
                <Save className="size-4" /> Salvar perfil
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
