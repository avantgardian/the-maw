# Tech Stack

Engine, language, tooling, and platform decisions for The Maw.

## Decision Summary

| Layer | Choice | Rationale |
|---|---|---|
| **Engine** | Phaser.js 3.70+ | 2D game engine, browser-native, WebGL renderer, built-in scene/input/audio/tween systems. Requires no backend, compiles to static files. |
| **Build Tool** | Vite 5+ | Zero-config dev server with HMR. Produces static `dist/` for hosting. First-class TypeScript support. |
| **Language** | TypeScript (strict mode) | Type safety for complex data structures (ship stats, upgrade trees, narrative DAG). Gradual adoption — plain JS works anywhere. |
| **Rendering** | Phaser WebGL pipeline + custom CRT shader | Scanlines, phosphor decay, monitor curvature, chromatic aberration via GLSL. Phaser's Pipeline system makes this a single registration. |
| **Data Store** | TypeScript modules + typed JSON | Ship rosters, upgrade costs, Data Spool content, encounter definitions live in `src/data/*.ts`. Strongly typed, tree-shakeable, easy to mod. |
| **Persistence** | localStorage (compressed JSON) | No server needed. Save file = single key. Compression via lz-string for larger save states. Export/import as base64 string. |
| **Audio** | Web Audio API + procedural / short pre-rendered clips | No streaming. Short SFX (clicks, pings, thuds) generated or embedded as base64. Ambient layers built from looped noise/synth. |
| **CI/CD** | GitHub Actions → Pages | On push to `main`: `npm ci && npm run build && deploy dist/` to `gh-pages` branch. Custom domain optional. |
| **Linting** | ESLint + @typescript-eslint + Prettier | Consistent code. No runtime deps needed. |
| **Testing** | Vitest (unit), Playwright (integration) | Optional later. Vitest shares Vite config. |

---

## Why Phaser over Alternatives

| Option | Problem |
|---|---|
| **Unity / Godot** | Overkill for a 2D clicker. Adds 50+ MB to download, requires engine install, complex export pipeline. Godot's HTML5 export is still unstable. |
| **Vanilla Canvas** | More control but you're re-inventing scenes, tweens, input handling, particle systems, audio management. Phaser gives all of this for ~250 KB. |
| **React / Svelte / Vue** | Built for UIs, not games. You can force a clicker into DOM but you lose smooth 60fps animation, shader pipelines, and efficient sprite rendering. |
| **Electron / Tauri** | Overhead for v0.1. GH Pages hosting is free and instant. Can wrap in Tauri later if desktop distribution proves necessary. |

## Why Vite

- `npm create vite@latest` gives a working Phaser + TS scaffold in seconds
- `vite dev` — instant server, HMR preserves Phaser scene state during development
- `vite build` — tree-shakes unused Phaser modules, produces ~300 KB gzipped bundle
- Deploy: `npm run build && npx gh-pages -d dist`

## Directory Structure

```
the-clicker/
├── index.html                  # Entry point — mounts Phaser canvas
├── vite.config.ts              # Vite config (base path for GH Pages, build target)
├── tsconfig.json               # strict mode, path aliases
├── package.json
├── .github/
│   └── workflows/
│       └── deploy.yml          # Build + deploy to Pages
├── public/
│   └── favicon.ico             # CRT scanline favicon
├── src/
│   ├── main.ts                 # Phaser.Game bootstrap
│   ├── config.ts               # Phaser.Types.Core.GameConfig
│   ├── scenes/
│   │   ├── BootScene.ts        # Preload assets, show loading bar
│   │   ├── ScannerScene.ts     # System overview, sweep animation, contact list
│   │   ├── ProcessingScene.ts  # Wreck cross-section, extractors, probes
│   │   └── ShipScene.ts        # System repair panel, resource allocation
│   ├── systems/
│   │   ├── Scanner.ts          # Scan logic, range/resolution/penetration
│   │   ├── Processing.ts       # Extractor/probe damage, stress tracking
│   │   ├── Inventory.ts        # Resource storage, allocation
│   │   └── SaveManager.ts      # Serialize/deserialize to localStorage
│   ├── ui/
│   │   ├── CRTButton.ts        # Reusable button with analog-click animation
│   │   ├── ProgressBar.ts      # Fill bar with CRT-pattern overlay
│   │   ├── ScanlineOverlay.ts  # Full-screen CRT effect
│   │   └── DataSpoolPlayer.ts  # Scroll-text terminal with tape noise
│   ├── shaders/
│   │   ├── crt.pipeline.ts     # Phaser pipeline: scanlines + phosphor glow
│   │   └── monochrome.pipeline.ts  # Per-scene color tint (amber, green, white)
│   ├── data/
│   │   ├── ships.ts            # Full ship roster — 63 entries, typed
│   │   ├── upgrades.ts         # Upgrade tree costs + effects
│   │   ├── spools.ts           # Data Spool content with thread/trigger metadata
│   │   └── encounters.ts       # Cult encounters, special wreck states
│   └── types/
│       └── index.ts            # Shared TypeScript interfaces
```

## Rendering Pipeline

```
Canvas (Phaser WebGL)
  ├── Scene layers (sprites, text, UI)
  ├── CRT Pipeline (applied last)
  │   ├── Scanline overlay — alternating transparent/horizontal lines
  │   ├── Phosphor decay — luminance trails on bright elements
  │   ├── Chromatic aberration — slight RGB offset at edges
  │   └── Screen curvature — barrel distortion (subtle, optional)
  └── Final framebuffer → display canvas
```

CRT shader parameters are exposed via Phaser pipeline uniforms so each scene can tweak intensity (Scanner scene = bright amber, Processing scene = industrial green, Ship scene = cool white).

## Data Architecture

**Static type definitions** in `src/data/*.ts`:

```ts
// src/data/ships.ts
export interface ShipDef {
  id: string
  name: string
  tier: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
  mass: number
  sections: SectionDef[]
  stressLimit: number
  risks: RiskTag[]
  minPropulsion: number  // Propulsion% required to reach
  minMaw: number        // Maw Core% required to process
  spoolDrops: string[]  // Data Spool IDs that can drop
}

export const SHIPS: ShipDef[] = [
  { id: 'alula', name: 'Alula', tier: 2, mass: 3, ... },
  // 63 entries
]
```

Same pattern for upgrades, spools, and encounters. Each file exports its array + a typed lookup function.

**No runtime database, no API calls.** Data is loaded at boot into a registry and queried by scene systems.

## Save System

```ts
interface SaveData {
  version: 1
  timestamp: number
  systems: { hull: number, lifeSupport: number, propulsion: number,
             mawCore: number, scanner: number, powerGrid: number }
  resources: Record<ResourceType, number>
  extractorCount: number
  probeCount: number
  completedEncounters: string[]
  discoveredSpools: string[]
  currentRegion: string
  // ...
}
```

- Serialized to JSON → lz-string compressed → stored in `localStorage['maw-save']`
- Auto-save every 30s + on scene transitions
- Export/import as base64 (for backup or move between browsers)
- Save version field for forward migration

## Audio Pipeline

**Phase 1 (prototype):** Procedural only — no audio files, zero asset management.
- Click sounds = Web Audio oscillator (short square wave burst + filter envelope)
- Scanner ping = sine wave with descending pitch
- Extractor impact = noise burst + low-pass filter sweep
- Ambient = two detuned saw waves through reverb (ConvolverNode)

**Phase 2:** Replace procedural sounds with short (~0.5-3s) pre-rendered WAV files stored as base64 strings in `src/audio/` or fetched from `public/audio/`. No streaming — all clips loaded into AudioBuffer at boot.

**Phase 3 (post-MVP):** Layered ambient system — low drone track + intermittent mechanical sounds triggered by game state.

## Distribution

| Target | Method | Effort |
|---|---|---|
| **GitHub Pages** | Primary. Web. `gh-pages` branch via Actions | Zero cost, instant |
| **itch.io** | Manual upload of `dist/` as HTML game | 5 minutes |
| **Desktop (optional)** | Wrap `dist/` in Tauri — ~5 MB binary | Later, low effort |
| **Mobile (optional)** | Phaser has touch Input — responsive canvas | Later, minimal changes |

## Dev Workflow

```bash
npm create vite@latest the-clicker -- --template vanilla-ts
npm install phaser
npm run dev              # local dev at localhost:5173
npm run build            # dist/
npx gh-pages -d dist     # manual deploy (or use Actions)
```

## GitHub Actions Deploy

`.github/workflows/deploy.yml`:

```yaml
name: Deploy to Pages
on:
  push:
    branches: [main]
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

Pushes to `main` → build → deploy to `gh-pages` → live at `https://<user>.github.io/the-clicker/`

## Future-Proofing

| Concern | How We Handle It |
|---|---|
| **More scenes** | Phaser's scene manager — add `new Scene()` in `config.ts`, no routing lib needed |
| **More ships/data** | Add entries to typed arrays in `src/data/`, auto-imported |
| **Translations** | All text in Data Spools, ship descriptions, UI labels = string keys in JSON. Swap locale file at boot. |
| **Desktop build** | Wrap `dist/` in Tauri. No code changes. |
| **Multiplayer/leaderboard** | Add a server later. Phaser scene logic is decoupled from networking — treat game state as authoritative on client, sync via WebSocket. |
