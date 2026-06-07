import Phaser from 'phaser'
import { CRTManager } from '../systems/CRTManager'
import { GameState } from '../systems/GameState'
import { getShip } from '../data/ships'
import type { ShipDef, ResourceType } from '../types'

const O = '#ff8800'
const O_DIM = '#553300'
const O_BG = '#1a0e00'

interface SectionState {
  label: string
  current: number
  max: number
  yieldType: ResourceType
  yieldAmount: number
  containsSpool: boolean
}

export class ProcessingScene extends Phaser.Scene {
  private ship!: ShipDef
  private sections: SectionState[] = []
  private activeSection = 0
  private stress = 0
  private stressMax = 100
  private collectedThisRun = { alloy: 0, oil: 0, nodes: 0, biomass: 0 }
  private isRuined = false
  private spoolFoundThisRun = false

  private sectionGfx!: Phaser.GameObjects.Graphics
  private sectionBars: Phaser.GameObjects.Text[] = []
  private stressBar!: Phaser.GameObjects.Graphics
  private stressLabel!: Phaser.GameObjects.Text
  private resourceText!: Phaser.GameObjects.Text
  private statusText!: Phaser.GameObjects.Text

  private boxW = 120
  private boxH = 120
  private gap = 20
  private sectionStartX = 0
  private sectionY = 80

  constructor() {
    super({ key: 'ProcessingScene' })
  }

  create(data: { shipId: string }) {
    CRTManager.setTint(1.0, 0.53, 0.0)
    this.cameras.main.setPostPipeline('CRTPipeline')
    this.cameras.main.setBackgroundColor('#000000')

    this.ship = getShip(data.shipId)!
    this.sections = this.ship.sections.map(s => ({
      label: s.label,
      current: s.integrity,
      max: s.integrity,
      yieldType: s.yieldType,
      yieldAmount: s.yieldAmount,
      containsSpool: false,
    }))
    this.stress = 0
    this.isRuined = false
    this.collectedThisRun = { alloy: 0, oil: 0, nodes: 0, biomass: 0 }
    this.sectionBars = []

    // Mark a random section as containing a Data Spool (only on the 4th wreck)
    this.spoolFoundThisRun = false
    const gs = GameState.get()
    if (!gs.hasReadSpool && gs.completedWrecks.length >= 3) {
      const idx = Phaser.Math.Between(0, this.sections.length - 1)
      this.sections[idx].containsSpool = true
    }

    const W = this.scale.width
    const H = this.scale.height

    // Layout
    const totalW = this.sections.length * this.boxW + (this.sections.length - 1) * this.gap
    this.sectionStartX = (W - totalW) / 2

    // Header
    this.add.text(W / 2, 24, `LATCHED: ${this.ship.name.toUpperCase()}`, {
      fontFamily: 'monospace', fontSize: '13px', color: O,
    }).setOrigin(0.5)
    this.add.text(W / 2, 40, `MASS ${this.ship.mass}  TIER ${this.ship.tier}  RISK ${this.ship.risk}`, {
      fontFamily: 'monospace', fontSize: '8px', color: O_DIM,
    }).setOrigin(0.5)

    // Section graphics
    this.sectionGfx = this.add.graphics()

    // Create interactive zones and labels once (not in draw loop)
    this.createSectionZones()

    // Stress section
    const stressY = 340
    this.add.text(60, stressY - 14, 'WRECK STRESS', {
      fontFamily: 'monospace', fontSize: '9px', color: O_DIM,
    })
    this.stressBar = this.add.graphics()
    this.stressLabel = this.add.text(580, stressY - 14, '0%', {
      fontFamily: 'monospace', fontSize: '9px', color: O,
    })

    // Resource counter
    this.resourceText = this.add.text(60, 380, '', {
      fontFamily: 'monospace', fontSize: '10px', color: O, lineSpacing: 4,
    })

    // Status text
    this.statusText = this.add.text(60, 430, 'CLICK A SECTION TO DEPLOY EXTRACTOR', {
      fontFamily: 'monospace', fontSize: '9px', color: O_DIM,
    })

    // Detach button
    const detachBtn = this.add.text(W - 60, 430, '[ DETACH ]', {
      fontFamily: 'monospace', fontSize: '12px', color: O,
      backgroundColor: O_BG, padding: { x: 10, y: 5 },
    }).setOrigin(0.5, 0).setInteractive({ useHandCursor: true })
    detachBtn.on('pointerdown', () => this.detach())
    detachBtn.on('pointerover', () => detachBtn.setColor('#ffffff'))
    detachBtn.on('pointerout', () => detachBtn.setColor(O))

    // Footer
    this.add.text(10, H - 14, 'PRC> PROCESSING', {
      fontFamily: 'monospace', fontSize: '9px', color: O_DIM,
    })

    // Initial draw
    this.drawSections()
    this.drawStressBar()
    this.updateResourceDisplay()
  }

  update() {
    this.drawSections()
    this.drawStressBar()
  }

  private createSectionZones() {
    for (let i = 0; i < this.sections.length; i++) {
      const x = this.sectionStartX + i * (this.boxW + this.gap)
      const y = this.sectionY

      // Section label (created once)
      this.add.text(x + this.boxW / 2, y + this.boxH - 14, this.sections[i].label, {
        fontFamily: 'monospace', fontSize: '9px', color: O_DIM,
      }).setOrigin(0.5, 1).setName(`prc-label-${i}`)

      // Percentage label
      const barY = y + this.boxH + 6
      const barText = this.add.text(0, 0, '', {
        fontFamily: 'monospace', fontSize: '8px', color: O,
      })
      barText.setPosition(x + this.boxW / 2 - barText.width / 2, barY + 1)
      this.sectionBars.push(barText)

      // Interactive zone — zone center must be at box center
      const zone = this.add.zone(x + this.boxW / 2, y + this.boxH / 2, this.boxW, this.boxH)
        .setInteractive({ useHandCursor: true })
      zone.on('pointerdown', () => this.clickSection(i))
    }
  }

  private drawSections() {
    const g = this.sectionGfx
    g.clear()

    for (let i = 0; i < this.sections.length; i++) {
      const s = this.sections[i]
      const x = this.sectionStartX + i * (this.boxW + this.gap)
      const y = this.sectionY

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

    if (s.containsSpool && s.current > 0) {
      // Reserved — icon appears on depletion
    }

      // Integrity bar
      const barX = x
      const barY = y + this.boxH + 6
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

      // Update pct text
      const barText = this.sectionBars[i]
      if (barText) {
        barText.setText(`${Math.ceil(pct * 100)}%`)
        barText.setPosition(barX + this.boxW / 2 - barText.width / 2, barY + 1)
      }
    }
  }

  private clickSection(index: number) {
    if (this.isRuined) return
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
    this.collectedThisRun[type] += s.yieldAmount

    switch (type) {
      case 'alloy': GameState.addResource('alloy', s.yieldAmount); break
      case 'oil': GameState.addResource('oil', s.yieldAmount); break
      case 'nodes': GameState.addResource('nodes', s.yieldAmount); break
      case 'biomass': GameState.addResource('biomass', s.yieldAmount); break
    }

    const flash = this.add.text(this.scale.width / 2, 200, `+${s.yieldAmount} ${type.toUpperCase()}`, {
      fontFamily: 'monospace', fontSize: '18px', color: '#ffffff',
    }).setOrigin(0.5)
    this.tweens.add({
      targets: flash, alpha: 0, y: 180, duration: 800,
      onComplete: () => flash.destroy(),
    })

    // Data Spool found — show permanent icon in section center
    if (s.containsSpool && !this.spoolFoundThisRun) {
      this.spoolFoundThisRun = true
      const W = this.scale.width
      const cx = this.sectionStartX + index * (this.boxW + this.gap) + this.boxW / 2
      const cy = this.sectionY + this.boxH / 2

      this.add.text(cx, cy, '[ DATA SPOOL ]', {
        fontFamily: 'monospace', fontSize: '13px', color: '#44ff88',
      }).setOrigin(0.5)

      const msg = this.add.text(W / 2, 240, 'LOG RECOVERED — 1 OF 1', {
        fontFamily: 'monospace', fontSize: '11px', color: '#44ff88',
      }).setOrigin(0.5)

      this.tweens.add({
        targets: msg,
        alpha: 0, y: '-=20',
        duration: 2000,
        delay: 1500,
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
    this.time.delayedCall(1000, () => this.detach())
  }

  private clearWreck() {
    this.updateStatus('CLEAN SALVAGE — ALL SECTIONS PROCESSED')

    const flash = this.add.text(this.scale.width / 2, this.scale.height / 2, 'CLEAN SALVAGE', {
      fontFamily: 'monospace', fontSize: '16px', color: '#ffffff',
    }).setOrigin(0.5)
    this.tweens.add({
      targets: flash, alpha: 0, y: this.scale.height / 2 - 20, duration: 1200,
      onComplete: () => flash.destroy(),
    })

    GameState.completeWreck(this.ship.id)
    this.time.delayedCall(1200, () => this.detach())
  }

  private detach() {
    this.scene.start('ShipScene')
  }

  private drawStressBar() {
    const g = this.stressBar
    g.clear()

    const x = 60
    const y = 340
    const w = 500
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
}
