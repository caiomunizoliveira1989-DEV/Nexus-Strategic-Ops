/* Zonas de alerta ambiental sobrepostas ao mapa.
   Estrutura compatível com GeoJSON: cada item tem um anel de coordenadas
   [lat, lng]. Quando a ingestão oficial estiver ligada, basta substituir
   o array ZONAS_ALERTA pelo resultado da API, mantendo estes campos. */

export type Severidade = 'moderada' | 'grave'

export type CategoriaAlerta = 'desmatamento' | 'queimada' | 'grilagem'

export type ZonaAlerta = {
  id: string
  categoria: CategoriaAlerta
  severidade: Severidade
  hectares: number
  detectadoEm: string
  fonte: string
  coordenadas: [number, number][]
}

export const COR_SEVERIDADE: Record<Severidade, { traco: string; preenchimento: string; rotulo: string }> = {
  moderada: { traco: '#f97316', preenchimento: '#f97316', rotulo: 'Moderado' },
  grave: { traco: '#ef4444', preenchimento: '#ef4444', rotulo: 'Grave' },
}

export const ROTULO_CATEGORIA: Record<CategoriaAlerta, string> = {
  desmatamento: 'Desmatamento',
  queimada: 'Queimada',
  grilagem: 'Grilagem',
}

export const ZONAS_ALERTA: ZonaAlerta[] = [
  {
    id: 'AL-001',
    categoria: 'desmatamento',
    severidade: 'grave',
    hectares: 1840,
    detectadoEm: '03/11/2026',
    fonte: 'PRODES / INPE',
    coordenadas: [
      [-3.352, -59.958],
      [-3.338, -59.884],
      [-3.404, -59.862],
      [-3.442, -59.918],
    ],
  },
  {
    id: 'AL-002',
    categoria: 'desmatamento',
    severidade: 'moderada',
    hectares: 420,
    detectadoEm: '28/10/2026',
    fonte: 'DETER / INPE',
    coordenadas: [
      [-3.524, -60.118],
      [-3.512, -60.062],
      [-3.566, -60.048],
      [-3.578, -60.104],
    ],
  },
  {
    id: 'AL-003',
    categoria: 'queimada',
    severidade: 'grave',
    hectares: 2650,
    detectadoEm: '05/11/2026',
    fonte: 'Queimadas / INPE',
    coordenadas: [
      [-3.276, -60.186],
      [-3.262, -60.096],
      [-3.338, -60.078],
      [-3.352, -60.168],
      [-3.318, -60.202],
    ],
  },
  {
    id: 'AL-004',
    categoria: 'queimada',
    severidade: 'moderada',
    hectares: 310,
    detectadoEm: '30/10/2026',
    fonte: 'Queimadas / INPE',
    coordenadas: [
      [-3.612, -59.972],
      [-3.604, -59.928],
      [-3.652, -59.920],
      [-3.660, -59.964],
    ],
  },
  {
    id: 'AL-005',
    categoria: 'grilagem',
    severidade: 'grave',
    hectares: 1120,
    detectadoEm: '01/11/2026',
    fonte: 'SIGEF / INCRA',
    coordenadas: [
      [-3.468, -60.268],
      [-3.452, -60.196],
      [-3.512, -60.182],
      [-3.534, -60.244],
    ],
  },
  {
    id: 'AL-006',
    categoria: 'grilagem',
    severidade: 'moderada',
    hectares: 275,
    detectadoEm: '22/10/2026',
    fonte: 'SIGEF / INCRA',
    coordenadas: [
      [-3.586, -60.196],
      [-3.576, -60.152],
      [-3.616, -60.146],
      [-3.624, -60.190],
    ],
  },
]

export function resumoAlertas() {
  const graves = ZONAS_ALERTA.filter((z) => z.severidade === 'grave')
  const moderadas = ZONAS_ALERTA.filter((z) => z.severidade === 'moderada')
  const hectares = ZONAS_ALERTA.reduce((soma, z) => soma + z.hectares, 0)
  return { graves: graves.length, moderadas: moderadas.length, hectares }
}
