'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { ArrowRight, CheckCircle2, Loader2, TriangleAlert } from 'lucide-react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const callbackUrl = searchParams.get('callbackUrl') ?? '/'
  const justRegistered = searchParams.get('registered') === '1'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError(null)

    const result = await signIn('credentials', {
      email: email.trim().toLowerCase(),
      password,
      redirect: false,
    })

    if (!result || result.error) {
      setError('Credenciais inválidas. Verifique e-mail e senha.')
      setPending(false)
      return
    }

    router.push(callbackUrl)
    router.refresh()
  }

  const inputClass =
    'w-full rounded-lg border border-border bg-background/60 px-3 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-neon-green/60 focus:ring-2 focus:ring-neon-green/20 disabled:opacity-60'

  const labelClass =
    'block text-xs font-medium uppercase tracking-wide text-muted-foreground'

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-md border border-neon-green/40 bg-neon-green/10 text-sm font-bold text-neon-green">
            N
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            NEXUS Strategic Ops
          </span>
        </div>

        <h1 className="text-2xl font-bold text-foreground">Acessar o painel</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Entre para visualizar as operações estratégicas.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-6 rounded-2xl border border-border bg-card/50 p-5 sm:p-6"
        >
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className={labelClass}>
                E-mail
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
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
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={pending}
                placeholder="........"
                className={inputClass}
              />
            </div>
          </div>

          {justRegistered && !error && (
            <div
              role="status"
              className="mt-5 flex items-start gap-2 rounded-lg border border-neon-green/40 bg-neon-green/10 px-3 py-2.5 text-xs text-neon-green"
            >
              <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
              <span>Conta criada. Entre com suas credenciais.</span>
            </div>
          )}

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
                <Loader2 className="size-4 animate-spin" /> Entrando...
              </>
            ) : (
              <>
                Entrar <ArrowRight className="size-4" />
              </>
            )}
          </button>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Não tem acesso?{' '}
            <Link
              href="/register"
              className="font-semibold text-neon-green transition-colors hover:underline"
            >
              Criar conta
            </Link>
          </p>
        </form>

        <p className="mt-6 text-center text-[11px] text-muted-foreground">
          Acesso restrito. As credenciais de demonstração são fornecidas pela
          equipe.
        </p>
      </div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}
