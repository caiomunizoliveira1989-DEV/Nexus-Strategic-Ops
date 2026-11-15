export type StatusConformidade = 'verificado' | 'pendente'

export type ItemChecklist = {
  id: string
  nome: string
  status: StatusConformidade
  verificadoPorIA: boolean
  dataVerificacao: string | null
}

export type AreaMonitorada = {
  nome: string
  subtitulo: string
  latitude: string
  longitude: string
}

export type PontoCredito = {
  mes: string
  saldo: number
}

export type DadosConformidade = {
  checklist: {
    titulo: string
    secao: string
    itens: ItemChecklist[]
  }
  area: AreaMonitorada
  creditos: {
    titulo: string
    saldoAtual: number
    unidade: string
    crescimentoPct: number
    serie: PontoCredito[]
  }
}
