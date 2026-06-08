# The Maw — A Game of Reclamation

## Core Premise

You are a **Drifter** — an entity from another galaxy, fleeing something you can barely remember. Your vessel was crippled in the escape. For thousands of years you drifted through intergalactic void, frozen, systems in standby.

You wake to the red glow of emergency lighting and the hum of failing power cells. The Milky Way. You made it.

But something is wrong. The spaceways are silent. The signals that should flood this galaxy's communications are dead. You drift through ship graveyards, abandoned stations, the skeletal remains of a civilization that burned out before you arrived.

Your vessel is barely functional. Its processing core — **The Maw** — can still break down wreckage, converting it into raw materials, fuel, and spare parts. You'll need to feed it. Repair your ship. Piece together what happened here.

And figure out if whatever killed this galaxy is still hunting.

---

## The Core Loop

You navigate your damaged vessel through the dead zones of the Milky Way. Each region contains **wrecks** — derelict ships, stations, and debris fields from the fallen human civilization. You deploy extractors from the Maw to latch onto, process, and absorb these wrecks.

The central tension: **Your ship is falling apart.** Life support flickers. Engines leak. The Maw itself is damaged and inefficient. You must constantly repair just to stay alive, while exploring deeper into the graveyard to find answers.

- **Integrity** — Your ship's overall health. Low = systems fail, processing slows, you lose stored resources. High = efficiency bonuses, access to dangerous wrecks.
- **Repair Level** — How much of your ship you've restored. Gates progression — unlocks new systems, new processing capabilities, new regions.

### The Scanner — Your Window into the Graveyard

Before you can process anything, you must find it. Your ship mounts a **Phase-Array Scanner** — a damaged but functional sensor suite that can sweep a system and reveal what's hiding in the dark.

When you enter a new system or region, you engage the scanner:

1. **Discovery Sweep** — A passive ping that reveals the broad contents of the system: celestial bodies (stars, planets, moons), asteroid fields, signal sources, and wreckage clusters. Each ping consumes a small amount of Integrity (your sensors are damaged).

2. **Target Analysis** — Once you've detected a contact, you can focus the scanner on it to reveal details: wreck size, approximate mass, risk level, resource profile. Higher scanner levels can identify specific ship models and cargo manifests before you latch on.

3. **Deep Scan** — Some objects are hidden. Stealth wrecks, encrypted signals, buried installations. These require a focused, prolonged scan to reveal. Deep scanning drains more Integrity but is the only way to access rare and dangerous content.

The scanner has three key stats that gate progression:

- **Range** — How far your sweep reaches. Upgraded range lets you detect targets from deeper in a system, and eventually scan entire regions at once.
- **Resolution** — Detail level of scan results. Low resolution reveals "Wreck — Medium" at best. High resolution identifies "Ballast — Mass 22 — Risk Very High — Cargo: Military Rations, Processor Nodes potential."
- **Penetration** — Ability to pierce interference. Stealth coatings, energy storms, derelict jamming stations. You need penetration to find the best wrecks.

Scanning is also how you discover the **story**. Every system you fully scan reveals data about that region — colony histories, disaster records, the last known transmissions from the human worlds. The scanner is your archaeology tool as much as your salvage tool.

---

## Resource System

Your ship breaks wrecks down into base components. Every material feeds a specific system. Nothing is abstract — every unit of resource is a unit of repair.

### Your Ship's Systems

Your vessel has six core systems, each degraded from the escape. You must restore them to unlock progression:

| System | Function | Damaged Condition | Fully Restored |
|---|---|---|---|
| **Hull** | Physical structure, storage, defense | Leaking, brittle — limits max Integrity to 30% | Max Integrity 100%, heavy cargo capacity |
| **Life Support** | Atmosphere, temperature, nutrient cycling | Flickering — Integrity decays 2x faster | Stable environment, passive Integrity regen |
| **Propulsion** | Sub-light thrust, V-Drive jump range | Crippled — can only reach Tier 1-2 wrecks | Full range, access to all tiers |
| **Maw Core** | Processing speed, extractor count, probe capacity | Atrophied — single extractor, 1x speed | Multiple extractors, probe swarm, high-speed processing |
| **Scanner Array** | Detection range, resolution, penetration | Blinded — Discovery Sweep range of 1 unit | Full system mapping, pre-scan identification |
| **Power Grid** | Energy distribution, weapon capacity | Overloaded — systems compete for power | All systems run simultaneously at peak |

### Resources & What They Repair

| Resource | Where It Comes From | What It Repairs | 1 Unit Repairs |
|---|---|---|---|
| **Biomass Fuel** | Crew quarters, bio-sections, galleys — organic residue rendered into fuel | **Life Support** — keeps your atmosphere cycling and your biomass fed | +2% Life Support |
| **Scrap Alloy** | Hull panels, armor belts, structural frames — alloys stripped and reforged | **Hull** — patching breaches, reinforcing bulkheads, expanding cargo holds | +1% Hull |
| **Synovial Oil** | Engine blocks, hydraulic lines, drive couplings — lubricants and coolants refined | **Propulsion** — restoring thruster response, V-Drive coherence, maneuverability | +1% Propulsion |
| **Processor Nodes** | Data cores, ship AI, neural processors — computational matter harvested and cross-wired | **Maw Core** — optimizing processing throughput, increasing extractor capacity, accelerating decomposition | +3% Maw Core |
| **Conductive Filaments** | Wiring looms, power conduits, circuit boards — copper, silver, and superconductors drawn and spun | **Power Grid** — replacing fried lines, stabilizing flux, routing energy | +2% Power Grid |
| **Optical Crystals** | Sensor lenses, communication arrays, data storage — silica and rare-earth lattices | **Scanner Array** — restoring imaging resolution, signal clarity, penetration depth | +3% Scanner Array |
| **Corrosive Charge** | Reactor cores, munitions, fuel cells — volatile compounds stabilized in magnetic containment | **Weapons / Emergency Systems** — not a repair resource, but a consumable; used to destroy obstacles or overload processing for burst speed | (consumable) |
| **Data Spools** | Crew data logs, personal recordings, black boxes — magnetic tape and storage media salvaged intact | **Cognitive Recovery** — not a ship system; unlocks story fragments, passive bonuses from understanding the past | +0% ship — but essential for progress |
| **Exotic Alloys** | Refined precious metals, rare earths, corporate vaults — luxury cargo refined through the Maw's processing chambers | **Permanent Overclock** — consumed to permanently boost any system's efficiency beyond its natural maximum | +0.5% to chosen system cap |

### How Repair Works

Each system has a **repair progress** (0% → 100%). You allocate resources to systems manually — the Maw doesn't know which system to prioritize.

**Example:** You have 50 Scrap Alloy. Your Hull is at 30%. You commit all 50 Alloy to Hull repair. Hull reaches 80%.

**System unlock thresholds:**
- **30%** — System becomes functional (base capability)
- **60%** — System performs well (bonus effects, new abilities)
- **100%** — System fully restored (maximum capability, permanent passive bonus)

When a system is below 30%, it actively penalizes you:
- Hull < 30% → max Integrity cap (you physically can't be healthy)
- Life Support < 30% → Integrity decays 2x faster than normal
- Propulsion < 30% → can only access current region's wrecks
- Maw Core < 30% → single extractor only
- Scanner < 30% → scan range severely limited
- Power Grid < 30% → running any system drains others

### Resource Flow (Visual)

```
Wreck → Latch → Process Sections → Absorb → Raw Materials in Storage
                                                           ↓
                                                    Assign to System
                                                           ↓
                                                    System % increases
                                                           ↓
                                                    New capabilities unlocked
```

### Resource Priority — What to Target

Different wrecks yield different resource profiles. You choose which sections to target with your extractors:

| Wreck Section | Yields | Best When |
|---|---|---|
| Crew Quarters, Galley, Bio-Sections | Biomass Fuel | Life Support is failing |
| Hull Armor, Frame, Bulkheads | Scrap Alloy | You're taking damage or need cargo space |
| Engines, Drives, Hydraulics | Synovial Oil | You need to reach new regions |
| Data Core, Bridge, AI Module | Processor Nodes | Maw is too slow, too few extractors |
| Power Plant, Conduits, Capacitors | Conductive Filaments | Systems keep overloading |
| Sensor Array, Comm Tower, Nav Computer | Optical Crystals | Can't find good wrecks |
| Reactor Core, Munitions Storage | Corrosive Charge | You need burst speed or to clear obstacles |
| Captain's Log, Crew Terminals, Passenger Cabins | Data Spools | You want story and lore |

### Advanced Resources (Higher Tiers)

| Resource | Source | What It Does |
|---|---|---|
| **Singularity Core** | Capital ships, station cores, World Engines | Upgrades Propulsion beyond 100% — enables FTL between regions |
| **Exotic Matter** | Deep-science vessels, World Engines, anomalous wrecks | Upgrades Maw Core beyond 100% — alien tech integration, impossible processing |
| **Signal Crystals** | Luxury ships, entertainment vessels, unknown sources | Upgrades Scanner beyond 100% — psychic/empathic sensing |
| **Nanite Swarm** | Construction Rigs, Megaships, automated facilities | Self-repair system — auto-allocates resources to lowest system |
| **Cryo-Essence** | Troop Transports, Prison Ships, Generation Ships | Ultra-dense biomass concentrate — 100x Biomass Fuel value in one unit |
| **Graal Residue** | All Graal wrecks | Unlocks corrosion resistance, alien system grafting |

### Concrete Cost Examples

| Upgrade | Cost |
|---|---|
| Extractor #2 (second active click stream) | 120 Processor Nodes, Maw Core must be ≥ 30% |
| Extractor #3 | 400 Processor Nodes, Maw Core ≥ 50% |
| Discovery Sweep upgrade (range ×2) | 80 Optical Crystals, Scanner ≥ 30% |
| Full system scan (region reveal) | 200 Optical Crystals, Scanner ≥ 60% |
| Hull patch (raise max Integrity cap by 10%) | 150 Scrap Alloy |
| V-Drive repair (unlock next region) | 300 Synovial Oil, Propulsion ≥ 50% |
| Life Support stabilizer (stop decay) | 200 Biomass Fuel, Life Support ≥ 30% |
| Exotic Alloys overclock (permanent +5% to one stat) | 50 Alloys + 200 of that system's resource |

---

## The Processing Mechanic

Once your scanner has identified a target, you move in. The Maw extends. This is where the clicking happens.

Processing has two layers: **extractors** for active play, **probes** for passive automation.

### Step 1: Latch

You select a scanned wreck and **latch on**. The wreck appears on screen as a cross-section — a ship sliced open, its internal compartments exposed. Each **section** is a target with its own integrity bar and resource label.

Sections revealed depends on your **Scanner Resolution**. Low-res scans reveal only 1-2 sections. High-res reveals everything, including hidden compartments and data cores.

### Step 2: Deploy Extractors (Setup)

Before you can process, you must **deploy extractors**. Each extractor is a heavy processing unit that locks onto one section and grinds it down.

- You have a limited number of extractors (starts at 1). Each can be deployed on one section.
- Deploying costs a small amount of Synovial Oil (lubricants, hydraulics).
- Once deployed, the extractor anchors onto that section and is ready for activation.
- Extractors can be recalled and redeployed to different sections.

### Step 3: Active Processing — Click to Operate Extractors

With extractors deployed, you **click to activate** them. Each click drives the extractor deeper, dealing processing damage to its section.

- **Click a deployed extractor** to fire it. Each click deals X damage to that section.
- **Hold to auto-click** — sustained fire on the same extractor.
- **Multiple extractors** — at higher Maw Core levels you can deploy more extractors. Clicking cycles through all active extractors, or you can focus-fire one.

Each section has an integrity bar. When it reaches 0%, the extractor finishes and the section yields its resource:

| Section | Yields |
|---|---|
| Hull Armor / Frame | Scrap Alloy |
| Crew Quarters / Galley / Bio-Section | Biomass Fuel |
| Engines / Drives / Hydraulics | Synovial Oil |
| Data Core / Bridge / AI Module | Processor Nodes |
| Power Plant / Conduits / Capacitors | Conductive Filaments |
| Sensor Array / Comm Tower / Nav Computer | Optical Crystals |
| Reactor Core / Munitions | Corrosive Charge (risky — chance of detonation) |
| Captain's Log / Terminals / Passenger Cabins | Data Spools |

Resources flow directly into storage as each section is cleared.

### Step 3b: Passive Income — Probes (Automation)

While extractors handle active processing, **probes** work in the background. Probes are small autonomous units that fly to the wreck, harvest a small amount of material, and return.

- **Probes auto-launch** when you latch onto a wreck. They fly to random undepleted sections and return with resources.
- Each probe takes ~10-30 seconds per round trip, depending on distance and probe upgrades.
- Probes never trigger wreck stress — they're too small.
- Probe yield is lower than extractor processing but completely passive.
- You can queue probes to prioritize specific resource types (at higher upgrade levels).

**Probes vs Extractors:**

| | Extractors | Probes |
|---|---|---|
| **Play style** | Active clicking | Passive background |
| **Speed** | Fast (seconds per section) | Slow (minutes per trip) |
| **Risk** | Generates wreck stress | None |
| **Control** | Target specific sections | Auto-targets (can prioritize later) |
| **Cost** | Synovial Oil to deploy | Free |
| **Capacity** | Limited (upgrade to increase) | Limited (upgrade to increase) |

### Step 4: Risk — Wreck Stress

Every extractor strike generates **stress** on the wreck. Stress accumulates per active extractor. Too much stress too fast triggers **catastrophic failure**:

- The wreck ruptures violently
- All unprocessed sections are lost
- Your extractors are damaged — must be repaired before redeployment
- Probes auto-recall safely (they're already returning)
- You recover a fraction of what was already processed

**Stress management:** Run fewer extractors (safe, steady) or all at once (fast yield, higher risk). Risk tolerance upgrades reduce stress accumulation. Some wrecks (Tier 7-8) have intrinsic stress — they're unstable before you even latch.

### Step 5: Detach

You can detach at any time, keeping everything processed so far. Detaching early is sometimes optimal:
- The wreck is too unstable (stress is high)
- You got what you came for
- Threats are approaching (Whalers, scavengers, Ghost Signals)

Full processing (all sections cleared) gives a **clean salvage bonus** — extra resources and no stress penalties.

### Step 6: Allocate (Post-Processing)

Once back in the quiet void, you open your ship's systems panel and **assign resources** to repair. Each resource type feeds a specific system (see Resource System above). This is the meta-layer — deciding what to repair next based on what you need to progress.

Processing loop visual:

```
┌─────────────┐     ┌──────────────┐     ┌──────────────────────┐     ┌──────────────┐
│  SCAN       │ ──→ │  LATCH       │ ──→ │  PROCESS              │ ──→ │  ALLOCATE    │
│  Find wreck │     │  Lock on     │     │  Deploy extractors    │     │  Repair ship │
│  Identify   │     │  View comps  │     │  Click to operate     │     │  Upgrade     │
│  Analyze    │     │  Target      │     │  Probes auto-harvest  │     │  Grow        │
│             │     │              │     │  Manage stress        │     │              │
└─────────────┘     └──────────────┘     └──────────────────────┘     └──────────────┘
```

---

## The Ships (Your Prey)

The Milky Way's human civilization spanned thousands of years and hundreds of star systems. The ships you find represent every era of that history — from humble beginnings to a species that reached for the stars and grasped too far.

Ships progress across 8 tiers, from tiny escape pods to city-sized stations and impossible alien constructs. Higher-tier ships require deeper systems restoration — your ship's **Hopper Capacity** (processing buffer), **Extractor Strength**, and **Scanner Resolution** must all be upgraded before you can tackle larger prey.

Progression is gated by **Ship Integrity** — a measure of how much of your vessel you've restored. At key Integrity thresholds, new ship systems come online, allowing access to larger wrecks and more dangerous regions.

Ships from across the galaxy end up in the dead zones. The manufacturers — **Langford Armaments**, **Forge Industries**, **Zephyr Solutions**, **Aethel Shipbuilding**, **Meridian Shipbuilding**, **Sapphire Cruises** — each left their signature on the wreckage. You learn to read the bones.

### Tier 1 — Debris & Scraps (Tutorial / Pre-Clicker)
*Nothing here requires clicking. Your extractors are barely functional — these barely qualify as ships.*

| Ship | Mass | Risk | Profile | Yields |
|---|---|---|---|---|
| **Escape Pod** | 1 | None | Crude lifesupport, ration packs, a few panicked scratches on the walls | Biomass, Data Spool (faint) |
| **Debris Cluster** | 1 | None | Tangled wreckage of multiple small craft | Alloy (trace), Synovial Oil (trace) |
| **Drone** | 1 | None | Single-function utility craft, minimal internals | Synovial Oil, trace Biomass |
| **Recon Probe** | 2 | Low | Sensors still pinging faint signals | Processor Nodes (tiny), Data Spool (data burst) |
| **Ship-Launched Fighter** | 2 | Low | Compact combat craft, ejected from a dying carrier | Synovial Oil, Alloy, trace Processor Nodes |

### Tier 2 — Light Craft (Early Game)
*The smallest piloted ships. Your ship is barely holding together — capacity for one extractor. These were the ships of couriers, beginners, and the desperate.*

| Ship | Mass | Risk | Profile | Yields |
|---|---|---|---|---|
| **Alula** | 3 | Low | The galaxy's most common starter ship. Cheap, modular, every scuff and dent tells a story. | Biomass, Data Spools |
| **Dart** | 3 | Low | Light combat ship, three hardpoints, pilot ego to match. Every Dart wreck has a tale of overconfidence. | Synovial Oil, Alloy, Corrosive Charge (trace) |
| **Skiff** | 4 | Low | Meridian's bare-bones freighter. Thin hull, enormous cockpit window. The pilot died staring at what hit them. | Alloy (light), Biomass, rare ore traces |
| **Mender** | 4 | Low | Ugly, reliable, multi-role. Feels like it was assembled from scrap — which makes processing it ironic. | Biomass, Synovial Oil, Alloy |
| **Lancet** | 4 | Low | Aethel Shipbuilding's budget combat craft. Sleek, fragile, owned by Hegemony wannabes who couldn't afford a Herald. | Synovial Oil, Alloy, Data Spools (vanity) |

### Tier 3 — Small Multi-Role (Early-Mid)
*Two extractors. A single probe running loops. These ships have real mass, real crews, and real reasons for being here. Some are still transmitting distress calls.*

| Ship | Mass | Risk | Profile | Yields |
|---|---|---|---|---|
| **Barb** | 6 | Medium | Classic combat ship. Fast, fragile, flown by bounty hunters who picked one fight too many. | Synovial Oil, Alloy, Corrosive Charge |
| **Reeve** | 7 | Medium | The most famous multi-role ship in history. Pirate favorite. Every Reeve wreck has cargo — the question is what kind. | Biomass, Alloy, Data Spools, random loot |
| **Keel** | 7 | Medium | Heavier, slower, tougher Keel. Fatigued hull plates suggest it saw years of service before the end. | Alloy, Corrosive Charge, Synovial Oil |
| **Seam** | 8 | Medium | Controversial. Compromised. The ship everyone mocked — now it's your meal. Even the Maw finds it bland. | Biomass, Alloy, rare ores |
| **Beacon** | 6 | Medium | Meridian's purpose-built scout. Sensors still flickering. It saw something before it died. | Processor Nodes, Data Spools (data bursts) |

### Tier 4 — Mid-Size Vessels (Mid Game)
*Two extractors, a probe swarm starting to grow. You've restored basic systems. These ships belong to professionals — traders, explorers, bounty hunters with something to prove.*

| Ship | Mass | Risk | Profile | Yields |
|---|---|---|---|---|
| **Porpoise** | 10 | Medium | Sapphire Cruises' entry-level passenger liner. Luxury fittings, panicked evacuation trails, half-eaten meals in the galley. | Data Spools, Biomass, Exotic Alloys |
| **Pathfind** | 11 | Medium | The long-range explorer's workhorse. Jump data in the computers. It went further than it should have. | Processor Nodes, Data Spools, Alloy |
| **Anvil** | 12 | High | Meridian's combat freighter. A Lighter with teeth — fighter bay, turrets, and a hull full of holes. | Alloy, Synovial Oil, Biomass |
| **Herald** | 10 | Medium | Aethel Shipbuilding's masterpiece. Speed, shields, elegance. The cockpit still smells of perfume and ozone. | Synovial Oil, Data Spools, Alloy (light) |
| **Shrike** | 11 | Medium | Modern update of the classic. Boost drive fried mid-jump. You taste the future in its circuits. | Synovial Oil, Processor Nodes, Data Spools |
| **Harrier** | 12 | High | Dedicated heavy fighter. Two large hardpoints, one obsessive pilot. The canopy is cracked from the inside. | Corrosive Charge, Alloy, Processor Nodes |
| **Kestrel Mk II** | 13 | High | Zephyr Solutions's compact hunter-killer. Fast, well-armed, short-ranged. It caught what it was hunting. | Synovial Oil, Corrosive Charge, Processor Nodes |
| **Lighter** | 14 | Medium | Meridian's medium freighter. Empty cargo racks and a reactor that ran until it couldn't. | Alloy, Biomass, rare ores |

### Tier 5 — Heavy Vessels (Late Mid)
*Three extractors. A healthy probe fleet. Whispers of the Hegemony's fall appear in the data logs. The wrecks here are recent — some are booby-trapped.*

| Ship | Mass | Risk | Profile | Yields |
|---|---|---|---|---|
| **Osprey** | 18 | High | Meridian's exploration scout. Overshadowed by its bigger sibling. A ship that tried hard and still failed. | Processor Nodes, Data Spools, Alloy |
| **Peregrine** | 20 | High | The explorer's gold standard. Massive jump range, panoramic cockpit, data cores full of undiscovered systems. | Data Spools, Processor Nodes, Exotic Matter (rare) |
| **Ballast** | 22 | Very High | Forge Industries' planetary assault ship. Armored, ugly, effective. The troop bay is still pressurized. | Alloy, Biomass (military rations), Processor Nodes |
| **Sleuth** | 20 | High | New-generation explorer. Boost Drive-optimized. Its flight recorder shows it was running from something. | Processor Nodes, Data Spools, Synovial Oil |
| **Vanguard** | 24 | Very High | Meridian's combat design. Maneuverable, heavily armed, crewed by the Accord's finest — or what's left of them. | Alloy, Corrosive Charge, Processor Nodes |
| **Outrider** | 24 | Very High | The heavy striker. Forge Industries' striker. Its armor is scarred by something that looks like your own weapons. | Alloy (heavy), Corrosive Charge, Processor Nodes |
| **Cutlass** | 25 | High | Aethel Shipbuilding's large multi-role. Fast, elegant, Hegemonic. The cargo hold contains... interesting artifacts. | Synovial Oil, Exotic Alloys, Data Spools |
| **Galleon** | 28 | Very High | The Galleon. Fighter bay, marine complement, and a bridge that's been breached from the inside. | Alloy, Processor Nodes, Biomass (heavy) |
| **Trooper** | 30 | High | Meridian's large freighter. Big box. Big target. The cargo manifest lists "mixed goods" — always suspicious. | Alloy (bulk), Biomass, rare ores |
| **Bulwark** | 30 | Very High | Heaviest of the Accord trio. More guns, more armor, more dead. | Alloy, Corrosive Charge, Processor Nodes |

### Tier 6 — Capital-Class (Late Game)
*Four extractors. Probe saturation. The Hegemony sent its finest ships here to die in its final days. Some are still fighting.*

| Ship | Mass | Risk | Profile | Yields |
|---|---|---|---|---|
| **Directorate Gunship** | 40 | Extreme | Gunship. All the guns. Every hardpoint is loaded. It went down firing at something in the void. | Corrosive Charge (massive), Alloy, Processor Nodes |
| **Portage** | 35 | High | Modern Meridian freighter. Reinforced hull, improved systems, still dead. | Alloy, Synovial Oil, Biomass |
| **Wraith** | 38 | Very High | Explorer variant of the Wraith. Light, fast, long-ranged. The view from the wreck is spectacular — and damning. | Data Spools, Processor Nodes, Alloy |
| **Specter** | 42 | Very High | The pirate king's choice. Fighter bay, huge hardpoints, legendary durability. It took a lot of killing. | Alloy, Corrosive Charge, Data Spools, Biomass |
| **Sloop** | 40 | High | Sapphire Cruises' midsize liner. Speed and luxury. The passenger logs are a who's-who of the wealthy and compromised — all dead now. | Exotic Alloys, Data Spools, Biomass |
| **Lance** | 36 | Extreme | Zephyr Solutions's combat masterpiece. Every bounty hunter's dream. Rich with combat data. | Processor Nodes, Corrosive Charge, Alloy, Synovial Oil |
| **Bore** | 35 | Extreme | The fastest ship in the galaxy. It was gone before it hit. The wreck is scattered across two kilometers. | Synovial Oil (pure), Alloy, Corrosive Charge |
| **Constrictor** | 45 | Extreme | The medium pad king. Multi-role perfection. Every compartment tells a story of profit and loss in a collapsing economy. | All basic resources, Data Spools |
| **Marauder** | 44 | Extreme | Combat specialist variant. More guns, less cargo. A ship designed to kill — and it did, until it didn't. | Corrosive Charge, Alloy, Processor Nodes |
| **Type-11 Prospector** | 38 | High | Meridian's dedicated miner. The drills are still spinning. The refinery is full of processed ore — and a log about a "strange signal." | Exotic Alloys, Alloy, rare ores (abundant) |
| **Marlin** | 42 | Very High | The new jack-of-all-trades. Boost drive, fighter bay, good bones. The final generation of human shipbuilding. | All basic, Synovial Oil, Data Spools |

### Tier 7 — Behemoths (Endgame)
*Five extractors. Your ship is mostly restored. These wrecks are city-sized, crewed by legions, built to last centuries. They died anyway. Their logs hold the darkest truths.*

| Ship | Mass | Risk | Profile | Yields |
|---|---|---|---|---|
| **Colossus** | 70 | Very High | Meridian's flying warehouse. The largest conventional freighter. Its holds could feed a star system — where did its cargo go? | Alloy (enormous), Biomass, rare ores (massive), all basics |
| **Abyss** | 75 | Extreme | Sapphire Cruises' crown jewel. A flying palace. Thousands of staterooms, swimming pools, art galleries. The final evacuation never launched. | Exotic Alloys (abundant), Data Spools (thousands), Biomass |
| **Sovereign** | 80 | Extreme | Aethel Shipbuilding's ultimate statement. Shield strength of a small moon. Hegemony armor, Hegemony secrets — including what the Hegemony knew and hid. | Alloy (super-dense), Corrosive Charge, Exotic Alloys, Data Spools |
| **Juggernaut** | 85 | Extreme | The flying fortress. More guns than the Gunship, more armor than the Sovereign. It was built to fight Graal. It found something worse. | Alloy (extreme), Corrosive Charge, Processor Nodes |
| **Titan** | 75 | Extreme | Langford Armaments's multi-role legend. Explorer, trader, warship — the Titan did everything. Its data cores span decades of the decline. | All resources, Data Spools (pure), Processor Nodes |
| **Directorate Corvette** | 90 | Extreme | Forge Industries' finest. Two huge hardpoints, Directorate armor, a ship built to project power. The bridge is still lit. The captain's log is still playing. | Alloy (military-grade), Corrosive Charge, Processor Nodes, Data Spools |
| **Caspian Explorer** | 95 | Extreme | Long-range survey vessel, pushed beyond its limits. Its logs contain star maps no human has followed — and the last known location of something important. | Data Spools (ancient), Graal Spores, Exotic Matter |
| **Mammoth** | 100 | Very High | The mythical freighter made real. 1,238 tons of cargo capacity. Its holds are a graveyard of smaller dreams — and a full record of the supply chain collapse. | All resources in unparalleled quantity |
| **Megaship** | 120 | Extreme | Modular industrial / scientific vessel. Mobile city. Research labs, refineries, habitation rings. The chief researcher's logs describe "contact." | All resources, Singularity Cores, Exotic Matter |
| **Prison Ship** | 110 | Extreme | Transport containing thousands of cryo-frozen inmates. The locks are still active. The prisoners are still dreaming. The warden's log explains why they were never woken. | Biomass (immense), Data Spools (disturbed), Processor Nodes |

### Tier 8 — Impossible Things (Post-Endgame)
*Your ship is nearly complete. You are approaching the truth. These wrecks were not caused by the collapse. They were caused by what ended the Hegemony.*

| Ship | Mass | Risk | Profile | Yields |
|---|---|---|---|---|
| **Graal Scout** | 60 | Extreme | Small, agile, organic. An alien vessel from a species that fought humanity for centuries. The Maw tastes the void between stars in its carapace. | Exotic Alloys, Signal Crystals, Processor Nodes (alien) |
| **Graal Interceptor** | 150 | Extreme | The classic Graal vessel. Eight petals, corrosive weapons, a mind that doesn't think like ours. It's still pulsing. It was fighting something else when it died. | Signal Crystals, Exotic Alloys, Processor Nodes (pure), Data Spools (incomprehensible) |
| **Graal Hunter** | 120 | Extreme | Purpose-built killer. It was hunting something — and it found it. The damage patterns match... your own ship's technology. | Corrosive Charge (alien), Alloy (organic), Processor Nodes |
| **Dreadnought-Class Battle Cruiser** | 200 | Extreme | Directorate capital ship. A mobile fortress. Its spinal cannon alone is worth a fortune in exotic alloys. It fought to the last shell — against what, exactly? | Alloy (capital-grade), Corrosive Charge (massive), Singularity Cores, Exotic Matter |
| **Fortress-Class Interdictor** | 220 | Extreme | Hegemony capital ship. A palace of war. Its shields failed, its hull was breached, its crew... are still aboard. They've been "asleep" for a long time. The ship's log contains the Emperor's final broadcast. | Exotic Alloys, Data Spools (Hegemony archives), Singularity Cores |
| **Graal Titan** | 350 | Extreme | The apex of Graal might. A living weapon the size of a station. It crashed. It's not dead. It's trying to communicate something. The Maw is cautious — and curious. | Signal Crystals (extreme), Processor Nodes (infinite), ??? |
| **Generation Ship** | 180 | Extreme | Humanity's oldest dream. A contained civilization, launched centuries before the collapse. It never returned. Its inhabitants saw something in the deep black. | Biomass (infinite), Data Spools (trillions), All basics |
| **Derelict Maw** | 400 | Extreme | Another of your kind. Dead. Its vessel is shattered. Its data core is intact. You are not the only refugee — and the others did not survive. | Processor Nodes (massive), Data Spools (your own kind's memories), Graal Spores, ??? |
| **World Engine** | 500 | Extreme | Planet-scale constructor. Its purpose is unknown. Its defenses are absolute. It was the Hegemony's last project — built to answer a question they should never have asked. | Singularity Cores (pure), Exotic Matter, Endgame-only resources |

---

## Progression / Upgrade Tree

Two parallel trees — your **Vessel** (physical ship systems) and your own **Cognitive Evolution** (your alien mind's recovery).

### Ship Systems (Vessel Upgrades)
- **Hopper Capacity** — How much of one wreck you can hold before processing
- **Cutter Arrays** — Processing speed per extractor
- **Hull Integrity** — Damage resistance, storage capacity
- **Refinery Specialization** — Favor specific resource types during processing
- **Extractor Capacity** — Max simultaneous extractors deployed on a wreck

### Scanner Array (Discovery Upgrades)
- **Sweep Range** — How far your Discovery Sweep reaches. Each level doubles effective scan radius. High enough range lets you map entire systems in a single ping.
- **Target Resolution** — Detail level of scan results. Unlocks pre-scan identification of ship model, mass, risk, and exact resource yield. Essential for efficient hunting.
- **Signal Penetration** — Ability to pierce interference. Required to find stealth wrecks, encrypted logs, buried installations, and Graal vessels.
- **Echo Focus** — Reduces Integrity cost of scanning. Passive scans become nearly free at max level. Deep scans still cost but become sustainable.
- **Wideband Antennae** — Unlocks detection of narrative signals: lore beacons, faction transmissions, the mysterious Echo signal that follows you.
- **Spectral Analysis** — Reveals resource composition from scan alone. Lets you skip poor wrecks and target exactly what you need.

### Cognitive Evolution (Mind Upgrades)
- **Probe Command** — Max simultaneous probes deployed (auto-clickers / automation). Each probe autonomously flies to the wreck and returns with resources.
- **Probe Efficiency** — Resources per trip, faster return cycles. Upgraded probes bring back more per run and spend less time in transit.
- **Neural Grafting** — Permanent cognitive stat boosts, processing speed
- **Language Decryption** — Decode human languages, faction dialects, encrypted logs
- **Pain Tolerance** — Reduce stress from extractor operations, survive wreck failures
- **Graal-Sight** — See hidden contents and threats before latching

---

## The Threat / Tension

The Milky Way is dead, but not empty. Something remains.

- **Ghost Signals** — Automated defense systems, derelict AI, military remnants that still fire on anything organic.
- **The Scavengers** — Other survivors? Rival beings drawn to the same wreckage. They're not hostile — yet. But they want what you want.
- **The Echo** — A signal you catch on long-range sensors. It's familiar. It's following you. It might be from your home galaxy.
- **System Decay** — Your ship is always deteriorating. Stand still too long and systems fail. The graveyard won't wait.
- **The Truth** — As you piece together what happened to humanity, you begin to understand that the extinction event was not random. And it may not be over.

---

## Story / Lore Structure

The narrative is delivered through **Data Spools** — recordings, logs, and archives recovered from ship terminals, personal devices, and black boxes. They are organized into threads:

### Thread 1: The Fall
Logs from the final years of human civilization. Economic collapse. War. Strange signals from the edge of the galaxy. The Hegemony's response — denial, then panic, then silence.

### Thread 2: The Home Galaxy
Fragments of your own memory, recovered as you heal. You fled something. Was it the same thing that destroyed humanity? Did you bring it with you?

### Thread 3: The Others
Records of a species encountered before the fall. The Graal. They fought humanity for centuries. But in the end, they were fighting the same enemy. Some logs suggest they tried to warn humanity.

### Thread 4: The Derelict Maw
You are not the first of your kind to reach the Milky Way. The others arrived earlier. They made contact. They tried to help — or to conquer. Their wrecks hold the key to understanding what's coming.

### Thread 5: The Signal
A broadcast, repeating on all frequencies. It predates human civilization. It's a warning — or an invitation. It's coming from the galactic core.

---

## Visual / Audio Direction

### Visual
Utilitarian industrial sci-fi with a 1970s analog feel. Your ship is a workshop of exposed circuitry, riveted panels, and repurposed components. Nothing is sleek. Everything has a function, and the function shows.

- **Ship interior:** Control room filled with CRT monitors displaying amber or green raster scans. Physical toggle switches, chunky buttons, analog gauges with mechanical needles. Warning decals stenciled directly onto metal. Cable bundles snake along bulkheads.
- **The Maw (processing core):** Not an organic organ — a massive industrial crusher. Hydraulic pistons, grinding gears, conveyor feeds, hopper chutes. Steam and hydraulic fluid. It looks like a factory floor compressed into a single chamber.
- **Wreck cross-section view:** Displayed on a large CRT monitor with scanlines. Sections are highlighted with crosshairs and text overlays in monochrome. Think wireframe models on a radar screen, not biological cutaways.
- **Scanner interface:** A radar/oscilloscope hybrid. Sweeping line leaves phosphor trails. Contacts appear as blips. Deep scan mode shows interference patterns and static.
- **Color palette:** Dull industrial grays, worn metal browns, faded warning yellows. The only bright colors are amber CRT glow, green scanlines, and red emergency lighting.
- **Human ship wrecks:** Clean, corporate, angular — a deliberate contrast to your grimy, patched-together vessel. Their hulls are white, gray, and blue. Your ship is rust, grease, and welded-on parts.
- **Data Spool playback:** A small CRT terminal. Text scrolls up in green monochrome. Occasional analog video static reveals fragmented images. Audio plays through a tinny speaker with limited frequency range.

### Audio
- **Ambient:** Low 60 Hz hum of power systems. Cooling fans cycling. Distant hydraulic pumps. The creak of metal under stress.
- **Scanner:** Sweeping tone like an old radar. A satisfying *ping* when a contact is found. Deep scan has a slow, descending frequency sweep.
- **Extractors:** Heavy mechanical impacts. Hydraulic hiss. Metal grinding against metal. Each click is a punch.
- **Probes:** High-pitched whine of small thrusters. A soft *clunk* when they dock and deposit resources.
- **UI sounds:** Mechanical relay clicks, keypress beeps, the buzz of a CRT turning on.
- **Data Spools:** Play back through a lo-fi filter — compressed audio, tape warble, limited frequency range. Voices sound like they're being transmitted through damaged equipment.

---

## Endgame / Victory Conditions

Not a "win" so much as a **choice**:

1. **Reclamation** — Fully repair your vessel. Become whole again. Leave the Milky Way behind. Return home with the knowledge of what happened — and face whatever destroyed your galaxy and this one.

2. **Integration** — Merge your technology with what remains of human civilization. Become the new custodian of the Milky Way. Use the Hegemony's final projects to restore life to the dead galaxy.

3. **The Signal** — Follow the ancient broadcast to its source. Discover what ended both civilizations. Decide whether to destroy it, contain it, or join it.

4. **The Maw Remembers** — Find every Data Spool. Piece together the complete truth of what happened — across both galaxies. The final entry is not from a human. It's from you — before you went into cryosleep. You already knew what you would find.
