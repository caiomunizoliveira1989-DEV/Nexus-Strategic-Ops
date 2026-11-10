export type ConflictZone = {
  id: string
  label: string
  x: number
  y: number
}

export type WeatherRow = {
  label: string
  value: string
  tone: 'default' | 'cyan'
}

export type MapLegendTone = 'red' | 'amber' | 'cyan'

export type MapLegendItem = {
  label: string
  value: string
  tone: MapLegendTone
}

export type ShipStatus = 'en_route' | 'conflict_zone'

export type Ship = {
  id: string
  name: string
  eta: string
  status: ShipStatus
}

export type SuggestionKind =
  | 'rerouting'
  | 'diplomatic_alert'
  | 'compliance_update'
  | 'risk_levels'

export type SuggestionTone = 'red' | 'amber'

export type Suggestion = {
  id: string
  kind: SuggestionKind
  title: string
  description: string
  badge: string
  tone: SuggestionTone
}

export type LogisticsMap = {
  imageSrc: string
  imageAlt: string
  activeRoutes: string[]
  alternativeRoute: string
  conflicts: ConflictZone[]
}

export type LogisticsWeather = {
  title: string
  summary: string
  rows: WeatherRow[]
  legend: MapLegendItem[]
}

export type LogisticsHeader = {
  presenterName: string
}

export type LogisticsDashboardData = {
  header: LogisticsHeader
  map: LogisticsMap
  weather: LogisticsWeather
  ships: Ship[]
  suggestions: Suggestion[]
}