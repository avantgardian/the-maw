# Prototype Scope

The smallest playable slice of The Maw that proves the core loop is fun. Build target: **7 days**.

## Minimum Viable Loop

```
Boot → ScannerScene          → ProcessingScene       → ShipScene → SpoolScene
        Discovery Sweep        click extractor         assign resources   read log
        see 3 contacts         clear sections          repair Hull
        pick one               manage stress           upgrade Maw Core
                               detach with resources
```

Player completes this loop 2-3 times before the prototype ends (a single Data Spool as the capstone reward).

## Scene Breakdown

### BootScene
- Phaser scene, runs once
- Shows "INITIALIZING..." on black background with amber CRT shader
- Fades into ScannerScene after 1.5s
- **No assets loaded** — everything is procedural

### ScannerScene
- **What player does:** Clicks "DISCOVERY SWEEP" button → watch radar sweep animation → sees 3 contacts appear → clicks one to latch
- **What they see:**
  - Radar display (Phaser Graphics): sweeping line, trailing phosphor dots, contact blips
  - Contact list (Phaser text): name, mass, risk level
  - "LATCH" button on selected contact
- **Backend:** Hardcoded 3 contacts generated from ship roster: Escape Pod (Tier 1), Alula (Tier 2), Skiff (Tier 2). After 2nd loop, Barb (Tier 3) also appears.
- **State:** No scan range/resolution mechanics — always succeeds. This is v0.1.

### ProcessingScene
- **What player does:** Clicks the extractor (single) repeatedly → each click deals damage to current section → section integrity bar depletes → when section hits 0%, resource awarded → click to advance to next section → when all sections cleared (or stress too high) → click "DETACH"
- **What they see:**
  - Wreck cross-section: rectangle representing the ship, divided into 2-3 sub-rectangles (sections)
  - Section labels (e.g. "HULL PLATING", "COCKPIT", "CARGO BAY")
  - Each section has an integrity bar (Phaser Graphics) that depletes on click
  - Stress meter at bottom — rises per click, fills faster on larger wrecks
  - Resource counter showing what's been collected this run
  - DETACH button (always available)
- **Extractor click:** Each click does fixed damage (e.g. 10). Section integrity = 100-200. So 10-20 clicks per section.
- **Stress:** Starts at 0, max 100. Each click adds 1-3 stress (higher on larger wrecks). If stress hits 100, wreck ruptures — lose unprocessed sections, keep what's collected.
- **Progression:** Wreck 1 (Escape Pod — 2 sections, 50 integrity each, no stress). Wreck 2 (Alula — 2 sections, 100 integrity each, 1 stress/click). Wreck 3 (Skiff — 3 sections, 150 integrity each, 2 stress/click). After unlocking Extractor #2: Wreck 4 (Barb — 3 sections, 200 integrity each, 2 stress/click, can use 2 extractors).

### ShipScene
- **What player does:** Sees current resource counts (Alloy, Oil, Nodes). Sees 2 system bars (Hull, Maw Core). Drags resource slider or clicks "ALLOCATE" to spend resources on repair.
- **What they see:**
  - Two progress bars: Hull 0-100%, Maw Core 0-100%
  - Resource counters: Scrap Alloy, Synovial Oil, Processor Nodes
  - Allocation controls per system: slider or +/- buttons
  - "CONFIRM ALLOCATION" button
  - Passive decay indicator (Hull below 30% → Integrity decays 2x, but not modeled in v0.1 — just show the warning)
- **Unlock triggers:**
  - **Extractor #2:** Maw Core ≥ 30% + 550 Processor Nodes spent → auto-unlocks next run
  - **Hull patch:** 150 Scrap Alloy spent on Hull → max Integrity +10% (displayed but not mechanically enforced in v0.1 — more of a "feel" unlock)

### SpoolScene
- **What player does:** Triggered only once — when first wreck is fully cleared
- **What they see:**
  - CRT terminal, green monochrome text
  - Data Spool scrolls up line by line (typewriter effect, ~0.1s per character)
  - Final line stays on screen: "END TRANSMISSION"
  - "RETURN TO SCANNER" button
- **Content:** 1 Data Spool from "The Last Voices" thread. A single log entry (~50-80 words) from a human captain whose ship was one of the last to transmit before the Silence reached their system.

## Ship Roster (Prototype)

| Ship | Tier | Mass | Sections | Per-Section Integrity | Stress/Click | Unlock Condition |
|---|---|---|---|---|---|---|
| Escape Pod | 1 | 1 | 2 | 50 | 0 | Always |
| Alula | 2 | 3 | 2 | 100 | 1 | After first pod clear |
| Skiff | 2 | 4 | 3 | 150 | 2 | After Alula clear |
| Barb | 3 | 6 | 3 | 200 | 2 | After Extractor #2 unlocked |

## Resource System (Prototype)

**3 resources, 2 systems:**

| Resource | Source Sections | Repairs | 1 Unit Repairs |
|---|---|---|---|
| Scrap Alloy | Hull Plating, Frame | Hull | +1% Hull |
| Synovial Oil | Engines, Drives | Propulsion | Not used in v0.1 (shown but non-functional) |
| Processor Nodes | Data Core, Cockpit | Maw Core | +3% Maw Core |

**Hardcoded yields per section:**

| Section | Yields |
|---|---|
| Hull Plating | 20 Scrap Alloy |
| Frame | 30 Scrap Alloy |
| Cockpit | 10 Processor Nodes |
| Data Core | 20 Processor Nodes |
| Engines | 15 Synovial Oil |
| Drives | 25 Synovial Oil |

Escape Pod yields: 5 Biomass Fuel (no system — just visual). First wreck is a tutorial — shows resources being collected but no system to assign them to.

## Upgrade Tree (Prototype)

| Upgrade | Cost | Effect | Unlock Text |
|---|---|---|---|
| Extractor #2 | Maw Core ≥ 30% + 550 Processor Nodes spent | Deploy 2 extractors simultaneously | "SECOND EXTRACTOR ARRAY ONLINE" |
| Hull Reinforcement | 150 Scrap Alloy spent on Hull | Max Integrity +10% (visual only in v0.1) | "HULL PLATING REINFORCED" |

All other upgrades show "LOCKED — COMING SOON."

## UI (Prototype)

- **No sprites.** Everything is drawn with Phaser.Graphics (rectangles, circles, lines) and bitmap text.
- **CRT overlay** applied globally via Phaser pipeline — scanlines, phosphor glow, slight barrel distortion.
- **Color palette per scene:**
  - Boot: amber (0xFFB000) on black
  - Scanner: green (0x00FF66) on black
  - Processing: orange/amber (0xFF8800) on dark gray
  - Ship: cool white (0xCCCCDD) on dark blue-gray
  - Spool: green (0x00FF41) on black
- **No mouse cursor** — hidden. All interaction via clickable regions that highlight on hover.
- **Font:** Monospace bitmap (~10px glyphs). No custom font loading — Phaser's built-in bitmap text or Canvas text with monospace fallback.

## Cut List — Not in v0.1

- Probes (passive income automation)
- Ghost Signals, Scavengers, The Echo
- Cults / special encounters
- Graal wrecks
- Save/load system
- Audio (all sounds)
- Animations beyond essential click feedback (extractor impact, bar depletion, sweep ping)
- Upgrade shop — unlocks are automatic at thresholds
- Multiple regions / navigation
- Ship variants — all wrecks are fixed loadouts
- Section flavor text — just labels
- Exotic Alloys / Data Spools beyond the 1 capstone
- V-Drive / Scanner / Power Grid / Life Support systems
- Resource allocation visualization (sliders are fine)
- Tutorial text — player learns by doing

## Success Criteria

**Expansion-worthy if:**
- Clicking the extractor feels satisfying (visual + numeric feedback)
- Choosing between Hull and Maw Core creates 2 seconds of hesitation (interesting decision)
- The Data Spool makes the player want to find another one

**Kill the project if:**
- Clicking has no feedback (just a number changing)
- Repair is optimal to auto-assign (no real choice)
- The narrative feels like a wall of text the player skips

## Build Plan

| Day | Milestone | Files Touched |
|---|---|---|
| 1 | Vite scaffold, Phaser config, BootScene, CRT shader, GitHub Pages deploy test | `vite.config.ts`, `src/main.ts`, `src/config.ts`, `src/scenes/BootScene.ts`, `src/shaders/crt.pipeline.ts`, `.github/workflows/deploy.yml` |
| 2 | ScannerScene — sweep animation, contact generation, latch flow | `src/scenes/ScannerScene.ts`, `src/data/ships.ts` (prototype entries) |
| 3 | ProcessingScene — wreck section rendering, extractor clicking, stress system | `src/scenes/ProcessingScene.ts`, `src/systems/Processing.ts` |
| 4 | ShipScene — resource display, 2 system bars, allocation, unlock triggers | `src/scenes/ShipScene.ts`, `src/systems/Inventory.ts` |
| 5 | SpoolScene — Data Spool terminal, typewriter effect, Data Spool content | `src/scenes/SpoolScene.ts`, `src/data/spools.ts` |
| 6 | Polish — click feel, stress visual, CRT tuning, edge cases, scene transitions | All scenes |
| 7 | Playtest, bug fix, deploy to GitHub Pages | — |

## Build Target

Phaser.js 3 + Vite + TypeScript. Static files hosted on GitHub Pages at `https://<user>.github.io/the-clicker/`.

No external assets. No runtime dependencies. Single `npm run build` produces `dist/` which is deployed via GitHub Actions on push to `main`.

**File count target:** ~15 files including config, scenes, systems, data, shaders. Total bundle < 350 KB gzipped.
