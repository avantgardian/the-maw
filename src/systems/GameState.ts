import type { GameState as GameStateType } from '../types'

const defaultState: GameStateType = {
  resources: { alloy: 0, oil: 0, nodes: 0, biomass: 0 },
  unlockedSpools: [],
  readSpools: [],
  partialWrecks: {},
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

  completeWreck(id: string) {
    if (!state.completedWrecks.includes(id)) {
      state.completedWrecks.push(id)
      state.lastCompletedWreck = id
    }
  },

  unlockSpool(id: string) {
    if (!state.unlockedSpools.includes(id)) {
      state.unlockedSpools.push(id)
    }
  },

  hasUnlockedSpool(id: string): boolean {
    return state.unlockedSpools.includes(id)
  },

  getUnlockedSpools(): string[] {
    return [...state.unlockedSpools]
  },

  markSpoolRead(id: string) {
    if (!state.readSpools.includes(id)) {
      state.readSpools.push(id)
    }
  },

  hasReadSpool(id: string): boolean {
    return state.readSpools.includes(id)
  },

  savePartialWreck(id: string, sections: number[]) {
    state.partialWrecks[id] = [...sections]
  },

  getPartialWreck(id: string): number[] | undefined {
    return state.partialWrecks[id]
  },

  clearPartialWreck(id: string) {
    delete state.partialWrecks[id]
  },

  reset() {
    state = { ...defaultState }
  },
}
