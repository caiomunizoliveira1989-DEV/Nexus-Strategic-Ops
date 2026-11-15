// Fila e documentação nos órgãos ambientais que publicam essa contabilização.
// Cada linha traz a competência do dado, que varia entre os órgãos.

export type StatusOrgao = 'critico' | 'atencao' | 'regular' | 'monitoramento'

export type LinhaOrgao = {
  id: string
  orgao: string
  documento: string
  comDocumentacao: string
  naFila: string
  temFila: boolean
  competencia: string
  fonte: string
  status: StatusOrgao
}

export type BlocoConformidade = {
  id: string
  titulo: string
  descricao: string
  linhas: LinhaOrgao[]
}

export const BLOCOS: BlocoConformidade[] = [
  {
    id: 'licenciamento',
    titulo: 'Licenciamento Ambiental e Documentação Legal',
    descricao: 'Licenças e documentação em análise nos órgãos licenciadores',
    linhas: [
      {
        id: 'ibama',
        orgao: 'IBAMA',
        documento: 'Licenciamento Ambiental Federal',
        comDocumentacao: '850 licenças emitidas',
        naFila: '3.995 processos',
        temFila: true,
        competencia: 'fev/2026',
        fonte: 'Relatório de Gestão Ibama 2025',
        status: 'atencao',
      },
      {
        id: 'cetesb',
        orgao: 'CETESB · SP',
        documento: 'Licenciamento ambiental estadual',
        comDocumentacao: '4.292 em análise efetiva',
        naFila: '5.454 processos',
        temFila: true,
        competencia: '2024',
        fonte: 'Relatório da Administração 2024',
        status: 'atencao',
      },
      {
        id: 'iema',
        orgao: 'IEMA · ES',
        documento: 'Licenciamento ambiental estadual',
        comDocumentacao: '608 concluídos',
        naFila: '827 protocolados',
        temFila: true,
        competencia: '2025',
        fonte: 'Relatório de Gestão IEMA 2025',
        status: 'regular',
      },
    ],
  },
  {
    id: 'car',
    titulo: 'Certificação de Uso do Solo',
    descricao: 'Cadastro Ambiental Rural: inscritos e analisados',
    linhas: [
      {
        id: 'sicar',
        orgao: 'SFB · SICAR',
        documento: 'CAR — base nacional',
        comDocumentacao: '1,9 milhão com análise iniciada',
        naFila: '724 mil validados',
        temFila: true,
        competencia: '2025',
        fonte: 'CPI/PUC-Rio — Código Florestal',
        status: 'critico',
      },
      {
        id: 'car-amazonia',
        orgao: 'Amazônia Legal + MS',
        documento: 'CAR por unidade federativa',
        comDocumentacao: '1.579.733 cadastrados',
        naFila: '59.690 concluídos (3,8%)',
        temFila: true,
        competencia: 'ago/2026',
        fonte: 'STF — ADPF 743',
        status: 'critico',
      },
    ],
  },
  {
    id: 'desmatamento',
    titulo: 'Monitoramento de Desmatamento',
    descricao: 'Medição por satélite — não há fila de espera',
    linhas: [
      {
        id: 'prodes',
        orgao: 'INPE · PRODES',
        documento: 'Taxa anual de desmatamento',
        comDocumentacao: '3.335 km² em 2025/26',
        naFila: 'Não se aplica',
        temFila: false,
        competencia: 'ago/25 a jul/26',
        fonte: 'INPE — BiomasBR',
        status: 'regular',
      },
      {
        id: 'deter',
        orgao: 'INPE · DETER',
        documento: 'Alertas em tempo real',
        comDocumentacao: '2.874 km² sob alerta',
        naFila: 'Não se aplica',
        temFila: false,
        competencia: 'ago/25 a jul/26',
        fonte: 'INPE / MMA',
        status: 'regular',
      },
    ],
  },
  {
    id: 'agua',
    titulo: 'Outorga de Uso da Água',
    descricao: 'Autorizações federais de uso de recursos hídricos',
    linhas: [
      {
        id: 'ana',
        orgao: 'ANA',
        documento: 'Outorga de direito de uso',
        comDocumentacao: '13.537 outorgas publicadas',
        naFila: 'Fila não consolidada',
        temFila: false,
        competencia: '2025',
        fonte: 'ANA — Órgãos Gestores 2025',
        status: 'monitoramento',
      },
    ],
  },
]

export const ATUALIZADO_EM = '12/11/2026'

/** Blocos com todos os itens em situação regular ou de monitoramento. */
export function progressoConformidade(): number {
  const ok = BLOCOS.filter((b) =>
    b.linhas.every((l) => l.status === 'regular' || l.status === 'monitoramento'),
  ).length
  return Math.round((ok / BLOCOS.length) * 100)
}

/** Total de linhas com fila publicada. */
export function itensComFila(): number {
  return BLOCOS.reduce(
    (s, b) => s + b.linhas.filter((l) => l.temFila).length,
    0,
  )
}

/* ── Agrupamento para o painel ──
   Os dois primeiros blocos ficam sempre visíveis.
   Os demais aparecem dentro de uma área com rolagem. */
const IDS_PRINCIPAIS = ['licenciamento', 'car']

export const BLOCOS_PRINCIPAIS = BLOCOS.filter((b) =>
  IDS_PRINCIPAIS.includes(b.id),
)

export const BLOCOS_SECUNDARIOS = BLOCOS.filter(
  (b) => !IDS_PRINCIPAIS.includes(b.id),
)
