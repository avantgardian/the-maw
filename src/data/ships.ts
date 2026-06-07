import type { ShipDef } from '../types'

export const SHIPS: ShipDef[] = [
  {
    id: 'escape-pod',
    name: 'Escape Pod',
    tier: 1,
    mass: 1,
    risk: 'None',
    stressPerClick: 0,
    minPropulsion: 0,
    flavor: 'Crude lifesupport, ration packs, a few panicked scratches on the walls.',
    sections: [
      { label: 'HULL', integrity: 50, yieldType: 'alloy', yieldAmount: 5 },
      { label: 'COCKPIT', integrity: 50, yieldType: 'biomass', yieldAmount: 3 },
    ],
  },
  {
    id: 'alula',
    name: 'Alula',
    tier: 2,
    mass: 3,
    risk: 'Low',
    stressPerClick: 1,
    minPropulsion: 0,
    flavor: 'The most common starter ship. Cheap, modular, every scuff tells a story.',
    sections: [
      { label: 'HULL', integrity: 100, yieldType: 'alloy', yieldAmount: 15 },
      { label: 'COCKPIT', integrity: 100, yieldType: 'nodes', yieldAmount: 10 },
    ],
  },
  {
    id: 'skiff',
    name: 'Skiff',
    tier: 2,
    mass: 4,
    risk: 'Low',
    stressPerClick: 2,
    minPropulsion: 0,
    flavor: 'Bare-bones freighter. Thin hull, enormous cockpit window.',
    sections: [
      { label: 'HULL', integrity: 150, yieldType: 'alloy', yieldAmount: 25 },
      { label: 'DRIVES', integrity: 150, yieldType: 'oil', yieldAmount: 20 },
      { label: 'COCKPIT', integrity: 150, yieldType: 'nodes', yieldAmount: 15 },
    ],
  },
  {
    id: 'barb',
    name: 'Barb',
    tier: 3,
    mass: 6,
    risk: 'Medium',
    stressPerClick: 2,
    minPropulsion: 0,
    flavor: 'Classic combat ship. Fast, fragile, flown by bounty hunters.',
    sections: [
      { label: 'HULL', integrity: 200, yieldType: 'alloy', yieldAmount: 30 },
      { label: 'ENGINES', integrity: 200, yieldType: 'oil', yieldAmount: 25 },
      { label: 'COCKPIT', integrity: 200, yieldType: 'nodes', yieldAmount: 20 },
    ],
  },
]

export function getShip(id: string): ShipDef | undefined {
  return SHIPS.find(s => s.id === id)
}

function getTier(tier: number): ShipDef[] {
  return SHIPS.filter(s => s.tier === tier)
}

export function getAvailableShips(completedIds: string[]): ShipDef[] {
  const available: ShipDef[] = []
  const completed = new Set(completedIds)

  const tier1 = getTier(1)
  const tier2 = getTier(2)
  const tier3 = getTier(3)

  // Tier 1 always available if not completed
  const pod = tier1.find(s => !completed.has(s.id))
  if (pod) available.push(pod)

  // Tier 2 available after pod is done
  if (completed.has('escape-pod')) {
    for (const s of tier2) {
      if (!completed.has(s.id)) {
        available.push(s)
        break
      }
    }
  }

  // Tier 3 available after at least 2 wrecks done
  if (completedIds.length >= 2) {
    const barb = tier3.find(s => !completed.has(s.id))
    if (barb) available.push(barb)
  }

  return available
}
