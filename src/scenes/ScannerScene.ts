import Phaser from 'phaser'
import { CRTManager } from '../systems/CRTManager'
import { GameState } from '../systems/GameState'
import { getAvailableShips, getShip } from '../data/ships'
import type { ShipDef } from '../types'

const SWEEP_DURATION = 1500
const G = '#00ff66'
const G_DIM = '#004422'

type Phase = 'idle' | 'contactLost' | 'sweeping' | 'ready'

export class ScannerScene extends Phaser.Scene {
  private sweepAngle = 0
  private isSweeping = false
  private sweepStartTime = 0
  private contacts: { shipId: string; angle: number; revealed: boolean }[] = []
  private selectedShipId: string | null = null
  private sweepGraphics!: Phaser.GameObjects.Graphics
  private contactLabels: Phaser.GameObjects.Text[] = []
  private stateText!: Phaser.GameObjects.Text
  private infoText!: Phaser.GameObjects.Text
  private sweepBtn!: Phaser.GameObjects.Text
  private statusBar!: Phaser.GameObjects.Text

  private phase: Phase = 'idle'
  private contactLostShipId: string | null = null
  private contactLostAlpha = 1
  private contactLostAngle = 0
  private contactLostLabel: Phaser.GameObjects.Text | null = null

  constructor() {
    super({ key: 'ScannerScene' })
  }

  create() {
    CRTManager.setTint(0.0, 1.0, 0.4)
    this.cameras.main.setPostPipeline('CRTPipeline')
    this.cameras.main.setBackgroundColor('#000000')

    const H = this.scale.height
    const gs = GameState.get()

    // Radar center
    const cx = 240
    const cy = 240
    const radius = 180

    this.sweepGraphics = this.add.graphics()
    this.contactLabels = []
    this.selectedShipId = null
    this.isSweeping = false
    this.contacts = []

    // Title
    this.add.text(cx, 30, 'PHASE-ARRAY SCANNER', {
      fontFamily: 'monospace', fontSize: '12px', color: G,
    }).setOrigin(0.5)

    this.add.text(cx, 46, 'v0.1 — RANGE: SHORT', {
      fontFamily: 'monospace', fontSize: '9px', color: G_DIM,
    }).setOrigin(0.5)

    // Contact list area
    const lx = 480
    this.add.text(lx, 80, 'CONTACTS', {
      fontFamily: 'monospace', fontSize: '11px', color: G_DIM,
    })

    this.stateText = this.add.text(lx, 100, 'AWAITING SWEEP...', {
      fontFamily: 'monospace', fontSize: '10px', color: G_DIM, wordWrap: { width: 440 },
    })

    this.infoText = this.add.text(lx, 280, '', {
      fontFamily: 'monospace', fontSize: '10px', color: G, wordWrap: { width: 440 }, lineSpacing: 4,
    })

    // Sweep button
    this.sweepBtn = this.add.text(240, 470, '[ DISCOVERY SWEEP ]', {
      fontFamily: 'monospace', fontSize: '14px', color: G,
      backgroundColor: '#001a00', padding: { x: 12, y: 6 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })

    this.sweepBtn.on('pointerover', () => this.sweepBtn.setColor('#ffffff'))
    this.sweepBtn.on('pointerout', () => this.sweepBtn.setColor(G))
    this.sweepBtn.on('pointerdown', () => this.startSweep())

    // Status bar
    this.statusBar = this.add.text(10, H - 16, 'SCN> READY', {
      fontFamily: 'monospace', fontSize: '9px', color: G_DIM,
    })

    // Check if we just returned from processing a completed wreck
    if (gs.lastCompletedWreck) {
      this.contactLostShipId = gs.lastCompletedWreck
      this.contactLostAlpha = 1
      this.contactLostAngle = -Math.PI / 3 + Math.PI / 4 * 0
      this.phase = 'contactLost'
      this.sweepBtn.disableInteractive()
      this.sweepBtn.setAlpha(0.4)
      this.updateStatus('CONTACT LOST...')

      const lostShip = getShip(this.contactLostShipId)
      if (lostShip) {
        const px = cx + Math.cos(this.contactLostAngle) * radius * 0.45
        const py = cy + Math.sin(this.contactLostAngle) * radius * 0.45
        this.contactLostLabel = this.add.text(px, py - 16, `LOST: ${lostShip.name.toUpperCase()}`, {
          fontFamily: 'monospace', fontSize: '7px', color: '#ff4400',
        }).setOrigin(0.5)
      }

      this.tweens.add({
        targets: this,
        contactLostAlpha: 0,
        duration: 1500,
        ease: 'Cubic.easeOut',
        onUpdate: () => {
          if (this.contactLostLabel) {
            this.contactLostLabel.setAlpha(this.contactLostAlpha)
          }
          // Scatter particles each tick
          if (Math.random() > 0.5) {
            const px = cx + Math.cos(this.contactLostAngle) * radius * 0.45 + Phaser.Math.Between(-10, 10)
            const py = cy + Math.sin(this.contactLostAngle) * radius * 0.45 + Phaser.Math.Between(-10, 10)
            const spark = this.add.text(px, py, '+', {
              fontFamily: 'monospace', fontSize: '7px', color: '#ff4400',
            }).setOrigin(0.5)
            this.tweens.add({
              targets: spark, alpha: 0, y: py - 20, duration: 600,
              onComplete: () => spark.destroy(),
            })
          }
        },
        onComplete: () => {
          gs.lastCompletedWreck = null
          this.contactLostShipId = null
          if (this.contactLostLabel) {
            this.contactLostLabel.destroy()
            this.contactLostLabel = null
          }
          this.phase = 'ready'
          this.sweepBtn.setInteractive({ useHandCursor: true })
          this.sweepBtn.setAlpha(1)
          this.updateStatus('CONTACT LOST — READY FOR RESWEEP')
          this.stateText.setText('NO ACTIVE CONTACTS')
        },
      })
    }
  }

  update(time: number) {
    const cx = 240
    const cy = 240
    const radius = 180

    this.sweepGraphics.clear()

    // Static radar rings
    this.sweepGraphics.lineStyle(1, 0x00ff66, 0.6)
    this.sweepGraphics.strokeCircle(cx, cy, radius)
    this.sweepGraphics.strokeCircle(cx, cy, radius * 0.6)
    this.sweepGraphics.strokeCircle(cx, cy, radius * 0.2)

    this.sweepGraphics.lineStyle(1, 0x00ff66, 0.3)
    this.sweepGraphics.lineBetween(cx - radius, cy, cx + radius, cy)
    this.sweepGraphics.lineBetween(cx, cy - radius, cx, cy + radius)

    this.sweepGraphics.fillStyle(0x00ff66, 0.8)
    this.sweepGraphics.fillCircle(cx, cy, 3)

    // Contact-lost animation
    if (this.phase === 'contactLost' && this.contactLostShipId) {
      const px = cx + Math.cos(this.contactLostAngle) * radius * 0.45
      const py = cy + Math.sin(this.contactLostAngle) * radius * 0.45

      // Fading blip
      const blink = Math.sin(time / 200) > 0
      this.sweepGraphics.fillStyle(0xff4400, this.contactLostAlpha * (blink ? 1 : 0.3))
      this.sweepGraphics.fillCircle(px, py, 4)

      // Cross-out
      this.sweepGraphics.lineStyle(1, 0xff4400, this.contactLostAlpha * 0.7)
      this.sweepGraphics.lineBetween(px - 6, py - 6, px + 6, py + 6)
      this.sweepGraphics.lineBetween(px + 6, py - 6, px - 6, py + 6)
    }

    // Sweep line
    if (this.isSweeping) {
      const elapsed = time - this.sweepStartTime
      const progress = Math.min(elapsed / SWEEP_DURATION, 1)
      this.sweepAngle = progress * Math.PI * 2

      if (progress >= 1) {
        this.isSweeping = false
        this.onSweepComplete()
      }
    }

    const sweepLen = this.isSweeping ? this.sweepAngle : (time / 8000) * Math.PI * 2
    const sx = cx + Math.cos(sweepLen) * radius * 0.95
    const sy = cy + Math.sin(sweepLen) * radius * 0.95

    // Phosphor trail
    for (let i = 0; i < 20; i++) {
      const a = sweepLen - i * 0.02
      const px = cx + Math.cos(a) * radius * 0.95
      const py = cy + Math.sin(a) * radius * 0.95
      this.sweepGraphics.lineStyle(1, 0x00ff66, 0.3 - i * 0.015)
      this.sweepGraphics.lineBetween(cx, cy, px, py)
    }

    this.sweepGraphics.lineStyle(1, 0x00ff66, 0.8)
    this.sweepGraphics.lineBetween(cx, cy, sx, sy)

    // Contacts on radar
    for (const c of this.contacts) {
      if (!c.revealed) continue
      const px = cx + Math.cos(c.angle) * radius * 0.45
      const py = cy + Math.sin(c.angle) * radius * 0.45
      const blink = Math.sin(time / 300 + c.angle) > 0
      this.sweepGraphics.fillStyle(0x00ff66, blink ? 0.9 : 0.4)
      this.sweepGraphics.fillCircle(px, py, 4)
    }
  }

  private startSweep() {
    if (this.isSweeping) return
    this.isSweeping = true
    this.sweepStartTime = this.time.now
    this.sweepBtn.disableInteractive()
    this.sweepBtn.setAlpha(0.4)
    this.updateStatus('SWEEP IN PROGRESS...')

    this.contacts = []
    this.contactLabels.forEach(l => l.destroy())
    this.contactLabels = []
    this.selectedShipId = null
    this.infoText.setText('')
  }

  private onSweepComplete() {
    this.sweepBtn.setAlpha(1)
    this.sweepBtn.setInteractive({ useHandCursor: true })
    this.phase = 'ready'

    const completed = GameState.get().completedWrecks
    const available = getAvailableShips(completed)

    this.contacts = []
    this.contactLabels.forEach(l => l.destroy())
    this.contactLabels = []

    const startAngle = -Math.PI / 3
    const step = Math.PI / 4

    available.forEach((ship, i) => {
      const angle = startAngle + step * i
      this.contacts.push({
        shipId: ship.id,
        angle,
        revealed: false,
      })
    })

    this.contacts.forEach((c, i) => {
      this.time.delayedCall(200 + i * 300, () => {
        c.revealed = true
        this.renderContactList()
      })
    })

    this.time.delayedCall(200 + this.contacts.length * 300, () => {
      this.updateStatus('CONTACTS DETECTED — SELECT TARGET')
    })
  }

  private renderContactList() {
    const lx = 480
    this.contactLabels.forEach(l => l.destroy())
    this.contactLabels = []

    let y = 100
    this.stateText.setText('')

    for (const c of this.contacts) {
      if (!c.revealed) continue
      const ship = getShip(c.shipId)
      if (!ship) continue

      const isSelected = this.selectedShipId === c.shipId
      const color = isSelected ? '#ffffff' : G
      const prefix = isSelected ? '▸ ' : '  '

      const text = this.add.text(lx, y, `${prefix}${ship.name.toUpperCase()}`, {
        fontFamily: 'monospace', fontSize: '11px', color,
      }).setInteractive({ useHandCursor: true })

      text.on('pointerdown', () => this.selectContact(ship))
      text.on('pointerover', () => {
        if (this.selectedShipId !== ship.id) text.setColor('#88ff88')
      })
      text.on('pointerout', () => {
        if (this.selectedShipId !== ship.id) text.setColor(G)
      })

      this.contactLabels.push(text)
      y += 18
    }
  }

  private selectContact(ship: ShipDef) {
    this.selectedShipId = ship.id
    this.renderContactList()

    this.infoText.setText(
      `ID:  ${ship.name.toUpperCase()}\n` +
      `MASS: ${ship.mass}\n` +
      `RISK: ${ship.risk}\n` +
      `TIER: ${ship.tier}\n` +
      `SECTIONS: ${ship.sections.length}\n\n` +
      `"${ship.flavor}"`
    )

    const lx = 480
    const latchBtn = this.add.text(lx, 450, '[ LATCH & PROCESS ]', {
      fontFamily: 'monospace', fontSize: '13px', color: G,
      backgroundColor: '#001a00', padding: { x: 10, y: 5 },
    }).setInteractive({ useHandCursor: true })

    latchBtn.on('pointerover', () => latchBtn.setColor('#ffffff'))
    latchBtn.on('pointerout', () => latchBtn.setColor(G))
    latchBtn.on('pointerdown', () => {
      this.updateStatus('LATCHING...')
      latchBtn.removeInteractive()
      this.time.delayedCall(500, () => {
        this.scene.start('ProcessingScene', { shipId: ship.id })
      })
    })
  }

  private updateStatus(msg: string) {
    this.statusBar.setText(`SCN> ${msg}`)
  }
}
