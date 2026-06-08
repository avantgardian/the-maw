export interface ShipDef {
  id: string
  name: string
  tier: 1 | 2 | 3
  mass: number
  risk: string
  sections: SectionDef[]
  stressPerClick: number
  minPropulsion: number
  flavor: string
}

export interface SectionDef {
  label: string
  integrity: number
  yieldType: ResourceType
  yieldAmount: number
}

export type ResourceType = 'alloy' | 'oil' | 'nodes' | 'biomass'

export interface ResourceState {
  alloy: number
  oil: number
  nodes: number
  biomass: number
}

export interface SystemState {
  hull: number
  mawCore: number
}

export interface GameState {
  resources: ResourceState
  systems: SystemState
  extractorCount: number
  maxIntegrity: number
  hasUnlockedExtractor2: boolean
  unlockedSpools: string[]
  readSpools: string[]
  completedWrecks: string[]
  lastCompletedWreck: string | null
}

export interface ContactData {
  shipId: string
  angle: number
  distance: number
  revealed: boolean
}

export interface SpoolDef {
  id: string
  title: string
  thread: string
  lines: string[]
}
