'use client'

import { useState } from 'react'
import { montarRelatorio } from '@/lib/report/estrategia-relatorio'
import { renderRelatorioHtml } from '@/lib/report/render-relatorio'

type Accent = 'green' | 'blue' | 'magenta'

const ACCENT_CLASSES: Record<Accent, string> = {
  green: 'bg-neon-green text-black',
  blue: 'bg-neon-blue text-black',
  magenta: 'bg-neon-magenta text-black',
}

type Props = {
  ano?: number
  tri?: 1 | 2 | 3 | 4
  accent?: Accent
}

export function GenerateReportButton({ ano = 2026, tri = 2, accent = 'green' }: Props) {
  const [gerando, setGerando] = useState(false)

  function gerar() {
    setGerando(true)
    try {
      const relatorio = montarRelatorio({ ano, tri, geradoEm: new Date() })
      const html = renderRelatorioHtml(relatorio)

      const janela = window.open('', '_blank')
      if (!janela) {
        alert('Permita pop-ups para gerar o relatório.')
        return
      }

      janela.document.open()
      janela.document.write(html)
      janela.document.close()
      setTimeout(() => janela.print(), 400)
    } catch (err) {
      console.error(err)
      alert(
        'Não foi possível gerar o relatório: ' +
          (err instanceof Error ? err.message : 'erro desconhecido'),
      )
    } finally {
      setGerando(false)
    }
  }

  return (
    <button
      type="button"
      onClick={gerar}
      disabled={gerando}
      className={`rounded-xl px-4 py-2.5 text-sm font-semibold ${ACCENT_CLASSES[accent]} disabled:opacity-60`}
    >
      {gerando ? 'Gerando…' : 'Gerar Relatório'}
    </button>
  )
}