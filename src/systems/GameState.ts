import type { GameState as GameStateType } from '../types'

const defaultState: GameStateType = {
  resources: { alloy: 0, oil: 0, nodes: 0, biomass: 0 },
  systems: { hull: 20, mawCore: 10 },
  extractorCount: 1,
  maxIntegrity: 100,
  hasUnlockedExtractor2: false,
  hasReadSpool: false,
  completedWrecks: [],
  lastCompletedWreck: null,
}

let state: GameStateType = { ...defaultState }

export const GameState = {
  get: () => state,

  addResource(type: keyof GameStateType['resources'], amount: number) {
    state.resources[type] += amount
  },

  spendResource(type: keyof GameStateType['resources'], amount: number): boolean {
    if (state.resources[type] < amount) return false
    state.resources[type] -= amount
    return true
  },

  setSystem(system: keyof GameStateType['systems'], value: number) {
    state.systems[system] = Math.min(100, Math.max(0, value))
  },

  repairSystem(system: keyof GameStateType['systems'], amount: number) {
    state.systems[system] = Math.min(100, state.systems[system] + amount)
  },

  completeWreck(id: string) {
    if (!state.completedWrecks.includes(id)) {
      state.completedWrecks.push(id)
      state.lastCompletedWreck = id
    }
  },

  unlockExtractor2() {
    state.hasUnlockedExtractor2 = true
    state.extractorCount = 2
  },

  readSpool() {
    state.hasReadSpool = true
  },

  reset() {
    state = { ...defaultState }
  },
}
