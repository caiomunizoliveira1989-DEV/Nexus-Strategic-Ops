import fs from 'node:fs'

const file = 'components/dashboard/views/agriculture-view.tsx'
let src = fs.readFileSync(file, 'utf8')
const original = src

const staticRe = /import\s*\{\s*AgricultureMapPanel\s*\}\s*from\s*'@\/components\/dashboard\/agriculture-map-panel'\s*\n/

if (!staticRe.test(src)) {
  console.error('ERRO: import estatico do mapa nao encontrado')
  process.exit(2)
}

const replacement = `import dynamic from 'next/dynamic'

const AgricultureMapPanel = dynamic(
  () =>
    import('@/components/dashboard/agriculture-map-panel').then(
      (mod) => mod.AgricultureMapPanel,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="grid h-full min-h-[22.5rem] w-full place-items-center rounded-xl bg-card/40 text-xs text-muted-foreground">
        Carregando mapa...
      </div>
    ),
  },
)
`

src = src.replace(staticRe, replacement)
fs.writeFileSync(file + '.bak', original, 'utf8')
fs.writeFileSync(file, src, 'utf8')
console.log('OK: mapa passou a carregar so no cliente')
