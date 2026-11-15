/* Snapshot verificado em 14/11/2026.
   Cada alerta traz coordenada real, raio de influência e fonte.
   Para trocar por feed ao vivo, mantenha o tipo AlertaLogistica. */

export type CategoriaAlerta = 'conflito' | 'clima' | 'congestao' | 'rota'
export type SeveridadeAlerta = 'grave' | 'moderada'

export type AlertaLogistica = {
  id: string
  titulo: string
  local: string
  categoria: CategoriaAlerta
  severidade: SeveridadeAlerta
  lat: number
  lng: number
  raioKm: number
  risco: string
  resumo: string
  fonte: string
  data: string
}

export const COR_SEVERIDADE: Record<
  SeveridadeAlerta,
  { traco: string; preenchimento: string; rotulo: string }
> = {
  grave: { traco: '#ef4444', preenchimento: '#ef4444', rotulo: 'Grave' },
  moderada: { traco: '#f97316', preenchimento: '#f97316', rotulo: 'Moderado' },
}

export const ROTULO_CATEGORIA: Record<CategoriaAlerta, string> = {
  conflito: 'Conflito',
  clima: 'Clima',
  congestao: 'Congestão',
  rota: 'Rota',
}

export const ALERTAS_LOGISTICA: AlertaLogistica[] = [
  {
    id: 'hormuz',
    titulo: 'Estreito de Ormuz',
    local: 'Irã · Omã',
    categoria: 'conflito',
    severidade: 'grave',
    lat: 26.57,
    lng: 56.25,
    raioKm: 130,
    risco: 'Crítico · dia 254',
    resumo:
      'Bloqueio dos EUA ativo. 10 navios transitaram em 12/nov, sendo 8 sem sinal AIS. UKMTO confirmou petroleiro em chamas perto de Khasab e segundo navio atingido na saída; 23 embarcações atingidas desde 1º/out. Brent a US$ 98,32.',
    fonte: 'UKMTO · Windward · Global Energy Flow',
    data: '12/11/2026',
  },
  {
    id: 'mandeb',
    titulo: 'Bab el-Mandeb',
    local: 'Iêmen · Djibuti',
    categoria: 'conflito',
    severidade: 'grave',
    lat: 12.58,
    lng: 43.33,
    raioKm: 95,
    risco: 'Alto',
    resumo:
      'Travessias subiram para 37 em 12/nov, contra 22 no dia anterior. Ataques houthis contra a Arábia Saudita mantêm o risco de navegação e seguem pressionando seguros de guerra.',
    fonte: 'Windward · El País',
    data: '12/11/2026',
  },
  {
    id: 'suez',
    titulo: 'Canal de Suez',
    local: 'Egito',
    categoria: 'rota',
    severidade: 'moderada',
    lat: 30.01,
    lng: 32.58,
    raioKm: 110,
    risco: 'Retomada em curso',
    resumo:
      'Cerca de 60% da capacidade Ásia-Europa voltou ao canal. Travessias caíram de 53 para 41 em 12/nov. Evergreen retomou o NEU7 e o Premier Alliance volta em dezembro.',
    fonte: 'Suez Canal Authority · The Loadstar',
    data: '12/11/2026',
  },
  {
    id: 'panama',
    titulo: 'Canal do Panamá',
    local: 'Panamá',
    categoria: 'rota',
    severidade: 'moderada',
    lat: 9.08,
    lng: -79.68,
    raioKm: 75,
    risco: 'Restrição hídrica',
    resumo:
      'Capacidade diária ampliada para 34 slots entre Neopanamax e Panamax, com categoria Super subindo de 18 para 19. Calado liberado no Neopanamax, mas a seca ligada ao El Niño ainda limita o tráfego.',
    fonte: 'Panama Canal Authority · A-42-2026',
    data: '09/11/2026',
  },
  {
    id: 'congestao-global',
    titulo: 'Congestão global de contêineres',
    local: 'Norte da Ásia',
    categoria: 'congestao',
    severidade: 'grave',
    lat: 25.5,
    lng: 122.0,
    raioKm: 420,
    risco: 'Crítico',
    resumo:
      '3,57 milhões de TEU — 10,3% da frota global de porta-contêineres — estavam presos em congestão em 1º/nov. O Norte da Ásia concentra cerca de 40%, seguido por Norte da Europa e Índia/Oriente Médio com 14% cada.',
    fonte: 'Sea Intelligence · Kuehne+Nagel',
    data: '10/11/2026',
  },
  {
    id: 'conacri',
    titulo: 'Porto de Conacri',
    local: 'Guiné',
    categoria: 'congestao',
    severidade: 'grave',
    lat: 9.51,
    lng: -13.71,
    raioKm: 45,
    risco: 'Crítico · 10 dias',
    resumo:
      'Espera média de 10 dias na janela de 4 a 10 de novembro. Congestão severa, atracação por ordem de chegada e limitada a um navio por armador.',
    fonte: 'Kuehne+Nagel · myKN',
    data: '10/11/2026',
  },
  {
    id: 'ningbo',
    titulo: 'Porto de Ningbo',
    local: 'China',
    categoria: 'congestao',
    severidade: 'grave',
    lat: 29.87,
    lng: 121.55,
    raioKm: 65,
    risco: 'Alto · 2,3 dias',
    resumo:
      'Espera de 2,3 dias com acúmulo de navios na aproximação. A dragagem do MSICT está suspensa, o que agrava a fila de atracação.',
    fonte: 'Kuehne+Nagel · myKN',
    data: '10/11/2026',
  },
  {
    id: 'tema',
    titulo: 'Porto de Tema',
    local: 'Gana',
    categoria: 'congestao',
    severidade: 'moderada',
    lat: 5.63,
    lng: 0.02,
    raioKm: 35,
    risco: 'Moderado · 6,7 dias',
    resumo:
      'Espera de 6,7 dias. Volume pesado, pátio acima da ocupação normal, alto uso de reefer e falta de caminhões travando a evacuação de carga. Serviço Durban–Tema passou a semanal.',
    fonte: 'Kuehne+Nagel · myKN',
    data: '10/11/2026',
  },
  {
    id: 'abidjan',
    titulo: 'Porto de Abidjan',
    local: 'Costa do Marfim',
    categoria: 'congestao',
    severidade: 'moderada',
    lat: 5.29,
    lng: -4.0,
    raioKm: 30,
    risco: 'Moderado · 2,3 dias',
    resumo:
      'Espera de 2,3 dias. Densidade alta de pátio, atrasos de berço, capacidade de caminhões limitada e evacuação lenta de carga restringem a produtividade do terminal.',
    fonte: 'Kuehne+Nagel · myKN',
    data: '10/11/2026',
  },
  {
    id: 'pacifico-tufoes',
    titulo: 'Pacífico Ocidental · tufões',
    local: 'Ásia · Pacífico',
    categoria: 'clima',
    severidade: 'moderada',
    lat: 22.0,
    lng: 135.0,
    raioKm: 520,
    risco: 'Atenção',
    resumo:
      'Tufões consecutivos desorganizaram escalas e deixaram backlog nos portos asiáticos. A fila está em recuperação, mas a disponibilidade de reserva na rota Trans-Pacífico ainda varia por serviço.',
    fonte: 'C.H. Robinson · Sekologistics',
    data: '14/11/2026',
  },
  {
    id: 'boa-esperanca',
    titulo: 'Cabo da Boa Esperança',
    local: 'África do Sul',
    categoria: 'rota',
    severidade: 'moderada',
    lat: -34.36,
    lng: 18.47,
    raioKm: 320,
    risco: 'Desvio em queda',
    resumo:
      'Aproximadamente 180 porta-contêineres ainda contornam o Cabo, contra média de 350 nos dois anos anteriores. 30 de 52 loops a oeste e 32 de 57 a leste já voltaram ao Suez.',
    fonte: 'Linerlytica · C.H. Robinson',
    data: '14/11/2026',
  },
  {
    id: 'norte-europa',
    titulo: 'Norte da Europa · convergência',
    local: 'Roterdã · Antuérpia',
    categoria: 'congestao',
    severidade: 'moderada',
    lat: 51.95,
    lng: 4.14,
    raioKm: 120,
    risco: 'Atenção',
    resumo:
      'Navios que retornam pelo Suez passam a chegar junto com os que completam a rota do Cabo, concentrando escalas nos portos do norte europeu e elevando o tempo de espera em berço.',
    fonte: 'C.H. Robinson · Metro Global',
    data: '10/11/2026',
  },
]

export const RESULTADO_ALERTAS = {
  referencia: '14/11/2026',
  fontes: [
    'UKMTO',
    'Windward',
    'Global Energy Flow',
    'Suez Canal Authority',
    'Panama Canal Authority',
    'Kuehne+Nagel',
    'Sea Intelligence',
    'C.H. Robinson',
    'Linerlytica',
  ],
}

export function resumoAlertas(alertas: AlertaLogistica[]) {
  const graves = alertas.filter((a) => a.severidade === 'grave')
  return {
    total: alertas.length,
    graves: graves.length,
    moderadas: alertas.length - graves.length,
    conflitos: alertas.filter((a) => a.categoria === 'conflito').length,
  }
}
