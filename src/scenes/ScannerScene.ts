import Phaser from 'phaser'
import { CRTManager } from '../systems/CRTManager'
import { GameState } from '../systems/GameState'
import { getAvailableShips, getShip } from '../data/ships'
import type { ShipDef, ResourceType } from '../types'

const SWEEP_DURATION = 3000
const G = '#00ff66'
const G_DIM = '#004422'
const O = '#ff8800'
const O_DIM = '#553300'
const O_BG = '#1a0e00'
const R_DIM = '#661111'

const CX = 175
const CY = 225
const RADIUS = 150
const PANEL_X = 285
const PANEL_W = 675
const SPOOL_IDS = ['last-voices-01', 'engine-log-07', 'cargo-manifest-3b']

type PanelMode = 'idle' | 'selected' | 'processing'

interface SectionState {
  label: string
  current: number
  max: number
  yieldType: ResourceType
  yieldAmount: number
  containsSpool: boolean
}

export class ScannerScene extends Phaser.Scene {
  // Radar
  private sweepAngle = 0
  private ambientAngle = 0
  private isSweeping = false
  private ambientScan = false
  private sweepStartTime = 0
  private contacts: { shipId: string; angle: number; revealed: boolean; lastPinged: number; zone: Phaser.GameObjects.Zone | null }[] = []
  private sweepGraphics!: Phaser.GameObjects.Graphics
  private sweepBtn!: Phaser.GameObjects.Text
  private statusBar!: Phaser.GameObjects.Text

  // Resource widget
  private resWidget!: Phaser.GameObjects.Text
  private splBtn!: Phaser.GameObjects.Text

  // Right panel
  private panelMode: PanelMode = 'idle'
  private panelContainer!: Phaser.GameObjects.Container
  private selectedShip: ShipDef | null = null

  // Processing state
  private sections: SectionState[] = []
  private activeSection = 0
  private stress = 0
  private stressMax = 100
  private isRuined = false
  private spoolFoundThisRun = false
  private detached = false

  // Processing graphics (reused across frames)
  private sectionGfx!: Phaser.GameObjects.Graphics
  private sectionBars: Phaser.GameObjects.Text[] = []
  private stressGfx!: Phaser.GameObjects.Graphics
  private stressLabel!: Phaser.GameObjects.Text
  private resourceText!: Phaser.GameObjects.Text
  private statusText!: Phaser.GameObjects.Text

  private boxW = 160
  private boxH = 100
  private gap = 20
  private cols = 3

  constructor() {
    super({ key: 'ScannerScene' })
  }

  create() {
    CRTManager.setTint(0.0, 1.0, 0.4)
    this.cameras.main.setPostPipeline('CRTPipeline')
    this.cameras.main.setBackgroundColor('#000000')

    const H = this.scale.height

    // ── Radar ──
    this.sweepGraphics = this.add.graphics()
    this.isSweeping = false
    this.ambientScan = false
    this.contacts = []
    this.selectedShip = null

    this.add.text(CX, 24, 'PHASE-ARRAY SCANNER', {
      fontFamily: 'monospace', fontSize: '12px', color: G,
    }).setOrigin(0.5)

    this.add.text(CX, 40, 'v0.1 — RANGE: SHORT', {
      fontFamily: 'monospace', fontSize: '9px', color: G_DIM,
    }).setOrigin(0.5)

    this.sweepBtn = this.add.text(CX, 460, '[ DISCOVERY SWEEP ]', {
      fontFamily: 'monospace', fontSize: '13px', color: G,
      backgroundColor: '#001a00', padding: { x: 10, y: 5 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })
    this.sweepBtn.on('pointerover', () => this.sweepBtn.setColor('#ffffff'))
    this.sweepBtn.on('pointerout', () => this.sweepBtn.setColor(G))
    this.sweepBtn.on('pointerdown', () => this.startSweep())

    this.statusBar = this.add.text(6, H - 14, 'SCN> READY', {
      fontFamily: 'monospace', fontSize: '9px', color: G_DIM,
    })

    // ── Right panel surface ──
    const panelBg = this.add.graphics()
    panelBg.fillStyle(0x000a00, 0.15)
    panelBg.fillRect(PANEL_X, 0, PANEL_W, H)

    this.panelContainer = this.add.container(PANEL_X, 0)

    // Idle by default
    this.renderIdlePanel()

    // ── Resource widget (top-right corner) ──
    this.resWidget = this.add.text(948, 12, '', {
      fontFamily: 'monospace', fontSize: '8px', color: '#ccccdd', lineSpacing: 2,
    }).setOrigin(1, 0)
    this.updateResWidget()

    this.splBtn = this.add.text(948, 12 + 4 * 11 + 6, '[SPL]', {
      fontFamily: 'monospace', fontSize: '8px', color: '#44ff88',
      backgroundColor: '#002211', padding: { x: 5, y: 2 },
    }).setOrigin(1, 0).setInteractive({ useHandCursor: true })
    this.splBtn.on('pointerover', () => this.splBtn.setColor('#ffffff'))
    this.splBtn.on('pointerout', () => this.splBtn.setColor('#44ff88'))
    this.splBtn.on('pointerdown', () => {
      if (!this.scene.isActive('SpoolPanelScene')) {
        this.scene.launch('SpoolPanelScene')
      }
    })
  }

  update(time: number, delta: number) {
    this.sweepGraphics.clear()

    // ── Radar rings ──
    this.sweepGraphics.lineStyle(1, 0x00ff66, 0.6)
    this.sweepGraphics.strokeCircle(CX, CY, RADIUS)
    this.sweepGraphics.strokeCircle(CX, CY, RADIUS * 0.6)
    this.sweepGraphics.strokeCircle(CX, CY, RADIUS * 0.2)

    this.sweepGraphics.lineStyle(1, 0x00ff66, 0.3)
    this.sweepGraphics.lineBetween(CX - RADIUS, CY, CX + RADIUS, CY)
    this.sweepGraphics.lineBetween(CX, CY - RADIUS, CX, CY + RADIUS)

    this.sweepGraphics.fillStyle(0x00ff66, 0.8)
    this.sweepGraphics.fillCircle(CX, CY, 3)

    // ── Sweep line ──
    if (this.isSweeping) {
      const elapsed = time - this.sweepStartTime
      const progress = Math.min(elapsed / SWEEP_DURATION, 1)
      this.sweepAngle = progress * Math.PI * 2

      if (progress >= 1) {
        this.isSweeping = false
        this.onSweepComplete()
      }

      const sx = CX + Math.cos(this.sweepAngle) * RADIUS * 0.95
      const sy = CY + Math.sin(this.sweepAngle) * RADIUS * 0.95

      for (let i = 0; i < 20; i++) {
        const a = this.sweepAngle - i * 0.02
        const px = CX + Math.cos(a) * RADIUS * 0.95
        const py = CY + Math.sin(a) * RADIUS * 0.95
        this.sweepGraphics.lineStyle(1, 0x00ff66, 0.3 - i * 0.015)
        this.sweepGraphics.lineBetween(CX, CY, px, py)
      }

      this.sweepGraphics.lineStyle(1, 0x00ff66, 0.8)
      this.sweepGraphics.lineBetween(CX, CY, sx, sy)
    } else if (this.ambientScan) {
      this.ambientAngle = (this.ambientAngle + 0.00209 * delta) % (Math.PI * 2)
      const sx = CX + Math.cos(this.ambientAngle) * RADIUS * 0.95
      const sy = CY + Math.sin(this.ambientAngle) * RADIUS * 0.95

      for (let i = 0; i < 10; i++) {
        const a = this.ambientAngle - i * 0.03
        const px = CX + Math.cos(a) * RADIUS * 0.95
        const py = CY + Math.sin(a) * RADIUS * 0.95
        this.sweepGraphics.lineStyle(1, 0x00ff66, 0.15 - i * 0.013)
        this.sweepGraphics.lineBetween(CX, CY, px, py)
      }

      this.sweepGraphics.lineStyle(1, 0x00ff66, 0.4)
      this.sweepGraphics.lineBetween(CX, CY, sx, sy)
    }

    // ── Contacts on radar ──
    const lineAngle = this.isSweeping ? this.sweepAngle : this.ambientScan ? this.ambientAngle : -1
    for (const c of this.contacts) {
      if (!c.revealed) continue

      if (lineAngle >= 0) {
        let diff = lineAngle - c.angle
        diff = ((diff + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI
        if (Math.abs(diff) < 0.08) {
          c.lastPinged = time
        }
      }

      const elapsed = time - c.lastPinged
      const fadeStart = 300
      const fadeEnd = 2500
      let alpha: number
      if (elapsed < fadeStart) {
        alpha = 0.9
      } else if (elapsed > fadeEnd) {
        alpha = 0.05
      } else {
        alpha = 0.9 - (elapsed - fadeStart) / (fadeEnd - fadeStart) * 0.85
      }

      const px = CX + Math.cos(c.angle) * RADIUS * 0.45
      const py = CY + Math.sin(c.angle) * RADIUS * 0.45
      this.sweepGraphics.fillStyle(0x00ff66, alpha)
      this.sweepGraphics.fillCircle(px, py, 4)
    }

    // ── Pulse sweep button ──
    if (this.contacts.length === 0 && !this.isSweeping && this.panelMode === 'idle') {
      this.sweepBtn.setAlpha(0.55 + 0.45 * Math.sin(time / 400))
    }

    // ── Processing frame update ──
    if (this.panelMode === 'processing') {
      this.drawSections()
      this.drawStressBar()
    }

    // ── Resource widget ──
    this.updateResWidget()
  }

  // ═══════════════ RADAR ═══════════════

  private startSweep() {
    if (this.panelMode !== 'idle' || this.isSweeping) return
    this.isSweeping = true
    this.ambientScan = false
    this.sweepAngle = 0
    this.sweepStartTime = this.time.now
    this.sweepBtn.disableInteractive()
    this.sweepBtn.setAlpha(0.4)
    this.updateStatus('SWEEP IN PROGRESS...')

    this.contacts.forEach(c => { if (c.zone) c.zone.destroy() })
    this.contacts = []
    this.selectedShip = null
    this.panelContainer.removeAll(true)
    this.renderIdlePanel()
  }

  private onSweepComplete() {
    this.sweepBtn.setAlpha(1)
    this.sweepBtn.setInteractive({ useHandCursor: true })
    this.ambientScan = true
    this.ambientAngle = this.sweepAngle % (Math.PI * 2)

    const completed = GameState.get().completedWrecks
    const available = getAvailableShips(completed)

    this.contacts = []

    const startAngle = -Math.PI / 3
    const step = Math.PI / 4

    available.forEach((ship, i) => {
      const angle = startAngle + step * i
      this.contacts.push({
        shipId: ship.id,
        angle,
        revealed: false,
        lastPinged: 0,
        zone: null,
      })
    })

    this.contacts.forEach((c, i) => {
      this.time.delayedCall(200 + i * 300, () => {
        c.revealed = true
        c.lastPinged = this.time.now

        const px = CX + Math.cos(c.angle) * RADIUS * 0.45
        const py = CY + Math.sin(c.angle) * RADIUS * 0.45
        c.zone = this.add.zone(px, py, 20, 20).setInteractive({ useHandCursor: true })
        c.zone.on('pointerdown', () => {
          const ship = getShip(c.shipId)
          if (ship) this.selectContact(ship)
        })
      })
    })

    this.time.delayedCall(200 + this.contacts.length * 300, () => {
      this.updateStatus('CONTACTS DETECTED — SELECT TARGET')
    })
  }

  // ═══════════════ RIGHT PANEL ═══════════════

  private renderIdlePanel() {
    this.panelMode = 'idle'
    this.panelContainer.removeAll(true)

    const cy = this.scale.height / 2 - 20
    const msg = this.add.text(PANEL_W / 2, cy,
      this.contacts.length > 0
        ? 'CLICK A CONTACT\nON THE RADAR'
        : 'SWEEP THE RADAR\nTO FIND CONTACTS', {
      fontFamily: 'monospace', fontSize: '11px', color: G_DIM, align: 'center',
    }).setOrigin(0.5)
    this.panelContainer.add(msg)
  }

  private renderSelectedPanel(ship: ShipDef) {
    this.panelMode = 'selected'
    this.selectedShip = ship
    this.panelContainer.removeAll(true)

    const header = this.add.text(PANEL_W / 2, 20, `SELECTED: ${ship.name.toUpperCase()}`, {
      fontFamily: 'monospace', fontSize: '13px', color: G,
    }).setOrigin(0.5)
    this.panelContainer.add(header)

    const sub = this.add.text(PANEL_W / 2, 36, `MASS ${ship.mass}  TIER ${ship.tier}  RISK ${ship.risk}`, {
      fontFamily: 'monospace', fontSize: '9px', color: G_DIM,
    }).setOrigin(0.5)
    this.panelContainer.add(sub)

    const flavor = this.add.text(20, 70, `"${ship.flavor}"`, {
      fontFamily: 'monospace', fontSize: '10px', color: G, wordWrap: { width: PANEL_W - 40 }, lineSpacing: 3,
    })
    this.panelContainer.add(flavor)

    const info = this.add.text(20, 140,
      `SECTIONS: ${ship.sections.length}\n` +
      ship.sections.map(s => `  ${s.label}: ${s.integrity}HP (${s.yieldType.toUpperCase()} ${s.yieldAmount})`).join('\n'), {
      fontFamily: 'monospace', fontSize: '9px', color: G_DIM, lineSpacing: 2,
    })
    this.panelContainer.add(info)

    const latchBtn = this.add.text(PANEL_W / 2, this.scale.height - 70, '[ LATCH & PROCESS ]', {
      fontFamily: 'monospace', fontSize: '13px', color: G,
      backgroundColor: '#001a00', padding: { x: 12, y: 6 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })
    latchBtn.on('pointerover', () => latchBtn.setColor('#ffffff'))
    latchBtn.on('pointerout', () => latchBtn.setColor(G))
    latchBtn.on('pointerdown', () => {
      if (this.panelMode !== 'selected') return
      latchBtn.removeInteractive()
      this.updateStatus('LATCHING...')
      this.time.delayedCall(400, () => this.startProcessing(ship))
    })
    this.panelContainer.add(latchBtn)
  }

  // ═══════════════ PROCESSING ═══════════════

  private startProcessing(ship: ShipDef) {
    this.panelMode = 'processing'
    this.selectedShip = ship
    this.stress = 0
    this.isRuined = false
    this.spoolFoundThisRun = false
    this.detached = false
    this.sectionBars = []
    this.activeSection = 0

    this.sections = ship.sections.map(s => ({
      label: s.label,
      current: s.integrity,
      max: s.integrity,
      yieldType: s.yieldType,
      yieldAmount: s.yieldAmount,
      containsSpool: false,
    }))

    // Restore partial progress
    const partial = GameState.getPartialWreck(ship.id)
    if (partial) {
      for (let i = 0; i < this.sections.length; i++) {
        if (i < partial.length) this.sections[i].current = partial[i]
      }
      this.activeSection = this.sections.findIndex(s => s.current > 0)
      if (this.activeSection < 0) this.activeSection = 0
    }

    // Mark spool
    const nextSpool = SPOOL_IDS.find(id => !GameState.get().unlockedSpools.includes(id))
    if (nextSpool) {
      const idx = Phaser.Math.Between(0, this.sections.length - 1)
      this.sections[idx].containsSpool = true
    }

    this.panelContainer.removeAll(true)

    this.cols = this.sections.length <= 3 ? this.sections.length : 3
    this.boxW = this.sections.length <= 2 ? 200 : 160

    // Header
    const h = this.add.text(PANEL_W / 2, 14, `LATCHED: ${ship.name.toUpperCase()}`, {
      fontFamily: 'monospace', fontSize: '13px', color: O,
    }).setOrigin(0.5)
    this.panelContainer.add(h)

    const h2 = this.add.text(PANEL_W / 2, 30, `MASS ${ship.mass}  TIER ${ship.tier}  RISK ${ship.risk}`, {
      fontFamily: 'monospace', fontSize: '8px', color: O_DIM,
    }).setOrigin(0.5)
    this.panelContainer.add(h2)

    // Close button
    const closeBtn = this.add.text(PANEL_W - 14, 8, '[X]', {
      fontFamily: 'monospace', fontSize: '11px', color: R_DIM,
    }).setOrigin(1, 0).setInteractive({ useHandCursor: true })
    closeBtn.on('pointerdown', () => this.closeProcessing())
    closeBtn.on('pointerover', () => closeBtn.setColor('#ff4444'))
    closeBtn.on('pointerout', () => closeBtn.setColor(R_DIM))
    this.panelContainer.add(closeBtn)

    // Section graphics
    this.sectionGfx = this.add.graphics()
    this.panelContainer.add(this.sectionGfx)

    this.createSectionZones()

    // Stress
    const stressY = 340
    const sl = this.add.text(16, stressY - 14, 'WRECK STRESS', {
      fontFamily: 'monospace', fontSize: '9px', color: O_DIM,
    })
    this.panelContainer.add(sl)

    this.stressGfx = this.add.graphics()
    this.panelContainer.add(this.stressGfx)

    this.stressLabel = this.add.text(PANEL_W - 130, stressY - 14, '0%', {
      fontFamily: 'monospace', fontSize: '9px', color: O,
    })
    this.panelContainer.add(this.stressLabel)

    // Resource text
    this.resourceText = this.add.text(16, 380, '', {
      fontFamily: 'monospace', fontSize: '10px', color: O, lineSpacing: 4,
    })
    this.panelContainer.add(this.resourceText)

    // Status
    this.statusText = this.add.text(16, 420, 'CLICK A SECTION TO DEPLOY EXTRACTOR', {
      fontFamily: 'monospace', fontSize: '9px', color: O_DIM,
    })
    this.panelContainer.add(this.statusText)

    // Detach
    const detachBtn = this.add.text(PANEL_W - 16, 420, '[ DETACH ]', {
      fontFamily: 'monospace', fontSize: '12px', color: O,
      backgroundColor: O_BG, padding: { x: 10, y: 5 },
    }).setOrigin(1, 0).setInteractive({ useHandCursor: true })
    detachBtn.on('pointerdown', () => this.detach())
    detachBtn.on('pointerover', () => detachBtn.setColor('#ffffff'))
    detachBtn.on('pointerout', () => detachBtn.setColor(O))
    this.panelContainer.add(detachBtn)

    // Initial draw
    this.drawSections()
    this.drawStressBar()
    this.updateResourceDisplay()

    this.updateStatus('PROCESSING')
  }

  private createSectionZones() {
    const totalRowW = this.cols * this.boxW + (this.cols - 1) * this.gap
    const startX = (PANEL_W - totalRowW) / 2

    for (let i = 0; i < this.sections.length; i++) {
      const row = Math.floor(i / this.cols)
      const col = i % this.cols
      const x = startX + col * (this.boxW + this.gap)
      const y = 60 + row * (this.boxH + this.gap + 14)

      const l = this.add.text(x + this.boxW / 2, y + this.boxH - 10, this.sections[i].label, {
        fontFamily: 'monospace', fontSize: '9px', color: O_DIM,
      }).setOrigin(0.5, 1)
      this.panelContainer.add(l)

      const barY = y + this.boxH + 4
      const bt = this.add.text(0, 0, '', {
        fontFamily: 'monospace', fontSize: '8px', color: O,
      })
      bt.setPosition(x + this.boxW / 2 - bt.width / 2, barY + 1)
      this.panelContainer.add(bt)
      this.sectionBars.push(bt)

      const zone = this.add.zone(x + this.boxW / 2, y + this.boxH / 2, this.boxW, this.boxH)
        .setInteractive({ useHandCursor: true })
      const idx = i
      zone.on('pointerdown', () => this.clickSection(idx))
      this.panelContainer.add(zone)
    }
  }

  private drawSections() {
    const g = this.sectionGfx
    g.clear()

    const totalRowW = this.cols * this.boxW + (this.cols - 1) * this.gap
    const startX = (PANEL_W - totalRowW) / 2

    for (let i = 0; i < this.sections.length; i++) {
      const s = this.sections[i]
      const row = Math.floor(i / this.cols)
      const col = i % this.cols
      const x = startX + col * (this.boxW + this.gap)
      const y = 60 + row * (this.boxH + this.gap + 14)

      const active = i === this.activeSection && !this.isRuined
      const depleted = s.current <= 0
      const bgColor = depleted ? 0x111100 : active ? 0x221100 : 0x110a00

      g.fillStyle(bgColor, 1)
      g.fillRect(x, y, this.boxW, this.boxH)
      g.lineStyle(1, active ? 0xff8800 : 0x553300, 1)
      g.strokeRect(x, y, this.boxW, this.boxH)

      if (depleted) {
        g.lineStyle(1, 0x553300, 0.5)
        g.lineBetween(x, y, x + this.boxW, y + this.boxH)
        g.lineBetween(x + this.boxW, y, x, y + this.boxH)
      }

      const barX = x
      const barY = y + this.boxH + 4
      const barW = this.boxW
      const barH = 8
      const pct = s.max > 0 ? s.current / s.max : 0

      g.fillStyle(0x111100, 1)
      g.fillRect(barX, barY, barW, barH)

      const fillColor = pct > 0.5 ? 0xff8800 : pct > 0.25 ? 0xff6600 : 0xff4400
      g.fillStyle(fillColor, 0.8)
      g.fillRect(barX, barY, barW * pct, barH)

      g.lineStyle(1, 0x553300, 1)
      g.strokeRect(barX, barY, barW, barH)

      const barText = this.sectionBars[i]
      if (barText) {
        barText.setText(`${Math.ceil(pct * 100)}%`)
        barText.setPosition(barX + this.boxW / 2 - barText.width / 2, barY + 1)
      }
    }
  }

  private clickSection(index: number) {
    if (this.isRuined || this.detached) return
    const s = this.sections[index]
    if (s.current <= 0) return

    const damage = 15

    s.current = Math.max(0, s.current - damage)
    this.activeSection = index

    this.stress += this.ship().stressPerClick
    if (this.stress >= this.stressMax) {
      this.stress = this.stressMax
      this.rupture()
      return
    }

    this.cameras.main.shake(50, 0.003)

    if (s.current <= 0) {
      this.awardSectionYield(index)
      this.advanceToNextSection()
    }

    this.updateResourceDisplay()
    this.updateStatus(`EXTRACTOR IMPACT — ${s.label} REMAINING: ${this.remainingSections()}`)
  }

  private awardSectionYield(index: number) {
    const s = this.sections[index]
    const type = s.yieldType
    GameState.addResource(type, s.yieldAmount)

    const flash = this.add.text(PANEL_X + PANEL_W / 2, 190, `+${s.yieldAmount} ${type.toUpperCase()}`, {
      fontFamily: 'monospace', fontSize: '18px', color: '#ffffff',
    }).setOrigin(0.5)
    this.tweens.add({
      targets: flash, alpha: 0, y: 170, duration: 800,
      onComplete: () => flash.destroy(),
    })

    if (s.containsSpool && !this.spoolFoundThisRun) {
      this.spoolFoundThisRun = true
      const nextSpool = SPOOL_IDS.find(id => !GameState.get().unlockedSpools.includes(id))
      if (nextSpool) GameState.unlockSpool(nextSpool)

      const totalRowW = this.cols * this.boxW + (this.cols - 1) * this.gap
      const startX = (PANEL_W - totalRowW) / 2
      const col = index % this.cols
      const cx = startX + col * (this.boxW + this.gap) + this.boxW / 2

      const spoolLabel = this.add.text(PANEL_X + cx, this.scale.height / 2 - 30, '[ DATA SPOOL ]', {
        fontFamily: 'monospace', fontSize: '13px', color: '#44ff88',
      }).setOrigin(0.5)
      this.tweens.add({
        targets: spoolLabel, alpha: 0, y: '-=20', duration: 2000, delay: 1500,
        onComplete: () => spoolLabel.destroy(),
      })
    }
  }

  private ship(): ShipDef {
    return this.selectedShip!
  }

  private advanceToNextSection() {
    const remaining = this.sections.findIndex(s => s.current > 0)
    if (remaining >= 0) {
      this.activeSection = remaining
    } else {
      this.clearWreck()
    }
  }

  private remainingSections(): number {
    return this.sections.filter(s => s.current > 0).length
  }

  private rupture() {
    this.isRuined = true
    this.cameras.main.shake(300, 0.01)
    this.cameras.main.flash(200, 255, 0, 0)
    this.updateStatus('WRECK RUPTURED — UNPROCESSED SECTIONS LOST')
    GameState.clearPartialWreck(this.ship().id)

    const flash = this.add.text(PANEL_X + PANEL_W / 2, this.scale.height / 2 - 40, 'WRECK RUPTURED', {
      fontFamily: 'monospace', fontSize: '16px', color: '#ff4444',
    }).setOrigin(0.5)
    this.tweens.add({
      targets: flash, alpha: 0, y: this.scale.height / 2 - 60, duration: 1200,
      onComplete: () => flash.destroy(),
    })

    this.time.delayedCall(1000, () => this.returnToIdle(true))
  }

  private clearWreck() {
    this.updateStatus('CLEAN SALVAGE — ALL SECTIONS PROCESSED')

    const flash = this.add.text(PANEL_X + PANEL_W / 2, this.scale.height / 2 - 40, 'CLEAN SALVAGE', {
      fontFamily: 'monospace', fontSize: '16px', color: '#ffffff',
    }).setOrigin(0.5)
    this.tweens.add({
      targets: flash, alpha: 0, y: this.scale.height / 2 - 60, duration: 1200,
      onComplete: () => flash.destroy(),
    })

    GameState.completeWreck(this.ship().id)
    GameState.clearPartialWreck(this.ship().id)
    this.time.delayedCall(1000, () => this.returnToIdle(true))
  }

  private detach() {
    if (this.detached) return
    this.detached = true
    GameState.savePartialWreck(
      this.ship().id,
      this.sections.map(s => s.current)
    )
    this.returnToIdle()
  }

  private closeProcessing() {
    if (this.detached) return
    this.detached = true
    GameState.savePartialWreck(
      this.ship().id,
      this.sections.map(s => s.current)
    )
    this.returnToIdle()
  }

  private returnToIdle(clearContacts = false) {
    if (clearContacts) {
      this.contacts.forEach(c => { if (c.zone) c.zone.destroy() })
      this.contacts = []
      this.sweepBtn.removeInteractive()
      this.sweepBtn.setAlpha(0.4)
      this.time.delayedCall(1500, () => {
        this.sweepBtn.setInteractive({ useHandCursor: true })
        this.sweepBtn.setAlpha(1)
      })
    }
    this.panelContainer.removeAll(true)
    this.selectedShip = null
    this.renderIdlePanel()
    this.updateStatus('READY')
  }

  // ═══════════════ CONTACT SELECTION ═══════════════

  private selectContact(ship: ShipDef) {
    if (this.isSweeping) return
    this.renderSelectedPanel(ship)
    this.updateStatus(`TARGET: ${ship.name.toUpperCase()}`)
  }

  // ═══════════════ HELPERS ═══════════════

  private drawStressBar() {
    const g = this.stressGfx
    g.clear()

    const x = 16
    const y = 340
    const w = PANEL_W - 150
    const h = 12
    const pct = this.stress / this.stressMax

    g.fillStyle(0x0a0500, 1)
    g.fillRect(x, y, w, h)

    const stressColor = pct > 0.7 ? 0xff4400 : pct > 0.4 ? 0xff8800 : 0x886600
    g.fillStyle(stressColor, 0.8)
    g.fillRect(x, y, w * pct, h)

    g.lineStyle(1, 0x553300, 1)
    g.strokeRect(x, y, w, h)

    this.stressLabel.setText(`${Math.ceil(pct * 100)}%`)
  }

  private updateResourceDisplay() {
    const gs = GameState.get()
    this.resourceText.setText(
      `ALLOY: ${gs.resources.alloy}   OIL: ${gs.resources.oil}   NODES: ${gs.resources.nodes}`
    )
  }

  private updateResWidget() {
    const r = GameState.get().resources
    this.resWidget.setText(
      `AL ${r.alloy}\nOI ${r.oil}\nND ${r.nodes}\nBM ${r.biomass}`
    )
  }

  private updateStatus(msg: string) {
    this.statusBar.setText(`SCN> ${msg}`)
  }
}
