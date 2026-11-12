// Recomendações do painel "Insights e Ações".
// Cada item é uma prática adotada por outro país, com resultado medido.

export type Insight = {
  id: string
  text: string
  pais: string
  fonte: string
}

export const INSIGHTS: Insight[] = [
  {
    id: 'filipinas-tarifa',
    text: 'Cortar a tarifa do arroz importado de 35% para 15%, como as Filipinas em 2024',
    pais: 'Filipinas',
    fonte: 'Executive Order 62/2024 — Department of Agriculture',
  },
  {
    id: 'india-estoque',
    text: 'Liberar estoque regulador do feijão quando a cobertura cair a 1 mês, como a Índia',
    pais: 'Índia',
    fonte: 'OECD Agricultural Policy Monitoring 2024',
  },
  {
    id: 'china-dois-niveis',
    text: 'Reserva em dois níveis como a China: 700 Mt e piso de estoque/uso em 17%',
    pais: 'China',
    fonte: 'Sinograin / National Food and Strategic Reserves Administration',
  },
]
