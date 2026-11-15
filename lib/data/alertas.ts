export type CategoriaAlerta = 'desmatamento' | 'queimada'
export type Severidade = 'moderada' | 'grave'

export type ZonaAlerta = {
  id: string
  categoria: CategoriaAlerta
  severidade: Severidade
  hectares: number
  data: string
  fonte: string
  local: string
  centro: [number, number]
  anel: [number, number][] | null
}

export const COR_SEVERIDADE: Record<
  Severidade,
  { traco: string; preenchimento: string; rotulo: string }
> = {
  moderada: { traco: '#f97316', preenchimento: '#f97316', rotulo: 'Moderado' },
  grave: { traco: '#ef4444', preenchimento: '#ef4444', rotulo: 'Grave' },
}

export const ROTULO_CATEGORIA: Record<CategoriaAlerta, string> = {
  desmatamento: 'Desmatamento',
  queimada: 'Queimada',
}
