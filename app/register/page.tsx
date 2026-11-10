'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, TriangleAlert, UserPlus } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError(null)

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as
          | { error?: string }
          | null
        throw new Error(data?.error ?? 'Nao foi possivel cadastrar')
      }

      router.push('/login?registered=1')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Erro ao cadastrar')
      setPending(false)
    }
  }

  const inputClass =
    'w-full rounded-lg border border-border bg-background/60 px-3 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-neon-green/60 focus:ring-2 focus:ring-neon-green/20 disabled:opacity-60'

  const labelClass =
    'block text-xs font-medium uppercase tracking-wide text-muted-foreground'

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <Link
          href="/login"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Voltar ao login
        </Link>

        <div className="mb-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-neon-green">
            NEXUS Strategic Ops
          </p>
          <h1 className="mt-1 text-2xl font-bold text-foreground">
            Criar acesso
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Cadastre-se para acessar o painel de operacoes.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-border bg-card/50 p-5 sm:p-6"
        >
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="name" className={labelClass}>
                Nome
              </label>
              <input
                id="name"
                required
                maxLength={80}
                value={name}
                onChange={(event) => setName(event.target.value)}
                disabled={pending}
                placeholder="Seu nome completo"
                className={inputClass}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="email" className={labelClass}>
                E-mail
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={pending}
                placeholder="voce@nexus.com"
                className={inputClass}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className={labelClass}>
                Senha
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={pending}
                placeholder="Minimo de 8 caracteres"
                className={inputClass}
              />
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="mt-5 flex items-start gap-2 rounded-lg border border-neon-red/40 bg-neon-red/10 px-3 py-2.5 text-xs text-neon-red"
            >
              <TriangleAlert className="mt-0.5 size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={pending}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border border-neon-green/50 bg-neon-green/15 px-4 py-2.5 text-sm font-semibold text-neon-green transition-colors hover:bg-neon-green/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Cadastrando...
              </>
            ) : (
              <>
                <UserPlus className="size-4" /> Criar conta
              </>
            )}
          </button>
        </form>
      </div>
    </main>
  )
}
