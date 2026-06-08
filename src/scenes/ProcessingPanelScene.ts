import Phaser from 'phaser'
import { CRTManager } from '../systems/CRTManager'
import { GameState } from '../systems/GameState'
import { getShip } from '../data/ships'
import type { ShipDef, ResourceType } from '../types'

const O = '#ff8800'
const O_DIM = '#553300'
const O_BG = '#1a0e00'
const R_DIM = '#661111'
const PANEL_X = 240
const PANEL_W = 720
const CR = PANEL_W - 88
const SPOOL_IDS = ['last-voices-01', 'engine-log-07', 'cargo-manifest-3b']

interface SectionState {
  label: string
  current: number
  max: number
  yieldType: ResourceType
  yieldAmount: number
  containsSpool: boolean
}

export class ProcessingPanelScene extends Phaser.Scene {
  private container!: Phaser.GameObjects.Container
  private ship!: ShipDef
  private sections: SectionState[] = []
  private activeSection = 0
  private stress = 0
  private stressMax = 100
  private isRuined = false
  private spoolFoundThisRun = false
  private detached = false

  private sectionGfx!: Phaser.GameObjects.Graphics
  private sectionBars: Phaser.GameObjects.Text[] = []
  private stressGfx!: Phaser.GameObjects.Graphics
  private stressLabel!: Phaser.GameObjects.Text
  private resourceText!: Phaser.GameObjects.Text
  private statusText!: Phaser.GameObjects.Text
  private detachBtn!: Phaser.GameObjects.Text

  private boxW = 160
  private boxH = 100
  private gap = 20
  private cols = 3

  constructor() {
    super({ key: 'ProcessingPanelScene' })
  }

  create(data: { shipId: string }) {
    CRTManager.setTint(1.0, 0.53, 0.0)
    this.cameras.main.setPostPipeline('CRTPipeline')

    this.ship = getShip(data.shipId)!
    this.stress = 0
    this.isRuined = false
    this.spoolFoundThisRun = false
    this.detached = false
    this.sectionBars = []
    this.activeSection = 0

    this.sections = this.ship.sections.map(s => ({
      label: s.label,
      current: s.integrity,
      max: s.integrity,
      yieldType: s.yieldType,
      yieldAmount: s.yieldAmount,
      containsSpool: false,
    }))

    // Restore partial progress if this ship was partially processed before
    const partial = GameState.getPartialWreck(this.ship.id)
    if (partial) {
      for (let i = 0; i < this.sections.length; i++) {
        if (i < partial.length) {
          this.sections[i].current = partial[i]
        }
      }
      // Restore active section to first non-depleted section
      this.activeSection = this.sections.findIndex(s => s.current > 0)
      if (this.activeSection < 0) this.activeSection = 0
    }

    // Mark a random section for a spool the player hasn't unlocked yet
    const gs = GameState.get()
    const nextSpool = SPOOL_IDS.find(id => !gs.unlockedSpools.includes(id))
    if (nextSpool) {
      const idx = Phaser.Math.Between(0, this.sections.length - 1)
      this.sections[idx].containsSpool = true
    }

    // Dim overlay on the scanner area
    const dim = this.add.graphics()
    dim.fillStyle(0x000000, 0.6)
    dim.fillRect(0, 0, PANEL_X, this.scale.height)
    this.add.zone(PANEL_X / 2, this.scale.height / 2, PANEL_X, this.scale.height)
      .setInteractive()

    // Panel container — starts off-screen to the right, tweens in
    this.container = this.add.container(this.scale.width, 0)

    // Panel surface
    const surface = this.add.graphics()
    surface.fillStyle(0x0a0500, 0.95)
    surface.fillRect(0, 0, PANEL_W, this.scale.height)
    surface.lineStyle(1, 0x553300, 0.5)
    surface.lineBetween(0, 0, 0, this.scale.height)
    this.container.add(surface)

    this.cols = this.sections.length <= 3 ? this.sections.length : 3
    this.boxW = this.sections.length <= 2 ? 200 : 160

    const totalRowW = this.cols * this.boxW + (this.cols - 1) * this.gap
    const startX = (CR - totalRowW) / 2

    // Header
    const h = this.add.text(CR / 2, 18, `LATCHED: ${this.ship.name.toUpperCase()}`, {
      fontFamily: 'monospace', fontSize: '13px', color: O,
    }).setOrigin(0.5)
    this.container.add(h)

    const h2 = this.add.text(CR / 2, 34, `MASS ${this.ship.mass}  TIER ${this.ship.tier}  RISK ${this.ship.risk}`, {
      fontFamily: 'monospace', fontSize: '8px', color: O_DIM,
    }).setOrigin(0.5)
    this.container.add(h2)

    // Close button
    const closeBtn = this.add.text(CR - 14, 10, '[X]', {
      fontFamily: 'monospace', fontSize: '11px', color: R_DIM,
    }).setOrigin(1, 0).setInteractive({ useHandCursor: true })
    closeBtn.on('pointerdown', () => this.closePanel())
    closeBtn.on('pointerover', () => closeBtn.setColor('#ff4444'))
    closeBtn.on('pointerout', () => closeBtn.setColor(R_DIM))
    this.container.add(closeBtn)

    // Section graphics
    this.sectionGfx = this.add.graphics()
    this.container.add(this.sectionGfx)

    // Section zones + labels
    this.createSectionZones(startX)

    // Stress section
    const stressY = 340
    const sl = this.add.text(20, stressY - 14, 'WRECK STRESS', {
      fontFamily: 'monospace', fontSize: '9px', color: O_DIM,
    })
    this.container.add(sl)

    this.stressGfx = this.add.graphics()
    this.container.add(this.stressGfx)

    this.stressLabel = this.add.text(CR - 140, stressY - 14, '0%', {
      fontFamily: 'monospace', fontSize: '9px', color: O,
    })
    this.container.add(this.stressLabel)

    // Resource counter
    this.resourceText = this.add.text(20, 380, '', {
      fontFamily: 'monospace', fontSize: '10px', color: O, lineSpacing: 4,
    })
    this.container.add(this.resourceText)

    // Status
    this.statusText = this.add.text(20, 420, 'CLICK A SECTION TO DEPLOY EXTRACTOR', {
      fontFamily: 'monospace', fontSize: '9px', color: O_DIM,
    })
    this.container.add(this.statusText)

    // Detach button
    this.detachBtn = this.add.text(CR - 20, 420, '[ DETACH ]', {
      fontFamily: 'monospace', fontSize: '12px', color: O,
      backgroundColor: O_BG, padding: { x: 10, y: 5 },
    }).setOrigin(1, 0).setInteractive({ useHandCursor: true })
    this.detachBtn.on('pointerdown', () => this.detach())
    this.detachBtn.on('pointerover', () => this.detachBtn.setColor('#ffffff'))
    this.detachBtn.on('pointerout', () => this.detachBtn.setColor(O))
    this.container.add(this.detachBtn)

    // Footer
    const f = this.add.text(8, this.scale.height - 14, 'PRC> PROCESSING', {
      fontFamily: 'monospace', fontSize: '9px', color: O_DIM,
    })
    this.container.add(f)

    // Ensure sidebar stays on top
    this.scene.bringToTop('ShipHudScene')

    // Slide in
    this.tweens.add({
      targets: this.container,
      x: PANEL_X,
      duration: 300,
      ease: 'Cubic.easeOut',
    })

    // Initial draw
    this.drawSections(startX)
    this.drawStressBar()
    this.updateResourceDisplay()
  }

  update() {
    if (this.detached) return
    const startX = (CR - this.cols * this.boxW - (this.cols - 1) * this.gap) / 2
    this.drawSections(startX)
    this.drawStressBar()
  }

  private createSectionZones(startX: number) {
    for (let i = 0; i < this.sections.length; i++) {
      const row = Math.floor(i / this.cols)
      const col = i % this.cols
      const x = startX + col * (this.boxW + this.gap)
      const y = 70 + row * (this.boxH + this.gap + 16)

      const l = this.add.text(x + this.boxW / 2, y + this.boxH - 10, this.sections[i].label, {
        fontFamily: 'monospace', fontSize: '9px', color: O_DIM,
      }).setOrigin(0.5, 1)
      this.container.add(l)

      const barY = y + this.boxH + 4
      const bt = this.add.text(0, 0, '', {
        fontFamily: 'monospace', fontSize: '8px', color: O,
      })
      bt.setPosition(x + this.boxW / 2 - bt.width / 2, barY + 1)
      this.container.add(bt)
      this.sectionBars.push(bt)

      const zone = this.add.zone(x + this.boxW / 2, y + this.boxH / 2, this.boxW, this.boxH)
        .setInteractive({ useHandCursor: true })
      const idx = i
      zone.on('pointerdown', () => this.clickSection(idx))
      this.container.add(zone)
    }
  }

  private drawSections(startX: number) {
    const g = this.sectionGfx
    g.clear()

    for (let i = 0; i < this.sections.length; i++) {
      const s = this.sections[i]
      const row = Math.floor(i / this.cols)
      const col = i % this.cols
      const x = startX + col * (this.boxW + this.gap)
      const y = 70 + row * (this.boxH + this.gap + 16)

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

      // Integrity bar
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

    const gs = GameState.get()
    const damage = gs.extractorCount === 1 ? 15 : 10 * gs.extractorCount

    s.current = Math.max(0, s.current - damage)
    this.activeSection = index

    this.stress += this.ship.stressPerClick
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
    this.updateStatus(`EXTRACTOR IMPACT — ${this.ship.name.toUpperCase()} SECTIONS REMAINING: ${this.remainingSections()}`)
  }

  private awardSectionYield(index: number) {
    const s = this.sections[index]
    const type = s.yieldType
    GameState.addResource(type, s.yieldAmount)

    const flash = this.add.text(CR / 2, 190, `+${s.yieldAmount} ${type.toUpperCase()}`, {
      fontFamily: 'monospace', fontSize: '18px', color: '#ffffff',
    }).setOrigin(0.5)
    this.tweens.add({
      targets: flash, alpha: 0, y: 170, duration: 800,
      onComplete: () => flash.destroy(),
    })
    this.container.add(flash)

    if (s.containsSpool && !this.spoolFoundThisRun) {
      this.spoolFoundThisRun = true
      const nextSpool = SPOOL_IDS.find(id => !GameState.get().unlockedSpools.includes(id))
      if (nextSpool) {
        GameState.unlockSpool(nextSpool)
      }

      const row = Math.floor(index / this.cols)
      const col = index % this.cols
      const startX = (CR - this.cols * this.boxW - (this.cols - 1) * this.gap) / 2
      const cx = startX + col * (this.boxW + this.gap) + this.boxW / 2
      const cy = 70 + row * (this.boxH + this.gap + 16) + this.boxH / 2

      const spoolLabel = this.add.text(cx, cy, '[ DATA SPOOL ]', {
        fontFamily: 'monospace', fontSize: '13px', color: '#44ff88',
      }).setOrigin(0.5)
      this.container.add(spoolLabel)

      const msg = this.add.text(CR / 2, 230, 'LOG RECOVERED', {
        fontFamily: 'monospace', fontSize: '11px', color: '#44ff88',
      }).setOrigin(0.5)
      this.container.add(msg)
      this.tweens.add({
        targets: msg, alpha: 0, y: '-=20', duration: 2000, delay: 1500,
        onComplete: () => msg.destroy(),
      })
    }
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

    GameState.clearPartialWreck(this.ship.id)

    const flash = this.add.text(CR / 2, this.scale.height / 2 - 40, 'WRECK RUPTURED', {
      fontFamily: 'monospace', fontSize: '16px', color: '#ff4444',
    }).setOrigin(0.5)
    this.container.add(flash)

    this.time.delayedCall(1000, () => this.slideOut())
  }

  private clearWreck() {
    this.updateStatus('CLEAN SALVAGE — ALL SECTIONS PROCESSED')

    const flash = this.add.text(CR / 2, this.scale.height / 2 - 40, 'CLEAN SALVAGE', {
      fontFamily: 'monospace', fontSize: '16px', color: '#ffffff',
    }).setOrigin(0.5)
    this.container.add(flash)
    this.tweens.add({
      targets: flash, alpha: 0, y: this.scale.height / 2 - 60, duration: 1200,
      onComplete: () => flash.destroy(),
    })

    GameState.completeWreck(this.ship.id)
    GameState.clearPartialWreck(this.ship.id)
    this.time.delayedCall(1000, () => this.slideOut())
  }

  private detach() {
    if (this.detached) return
    this.detached = true
    this.savePartialState()
    this.slideOut()
  }

  private slideOut() {
    this.detached = true
    // Disable all interactions
    this.input.enabled = false
    this.tweens.add({
      targets: this.container,
      x: this.scale.width,
      duration: 200,
      ease: 'Cubic.easeIn',
      onComplete: () => this.scene.stop(),
    })
  }

  private closePanel() {
    if (this.detached) return
    this.detached = true
    this.savePartialState()
    this.input.enabled = false
    this.tweens.add({
      targets: this.container,
      x: this.scale.width,
      duration: 200,
      ease: 'Cubic.easeIn',
      onComplete: () => this.scene.stop(),
    })
  }

  private drawStressBar() {
    const g = this.stressGfx
    g.clear()

    const x = 20
    const y = 340
    const w = CR - 160
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

  private updateStatus(msg: string) {
    this.statusText.setText(msg)
  }

  private savePartialState() {
    GameState.savePartialWreck(
      this.ship.id,
      this.sections.map(s => s.current)
    )
  }
}
