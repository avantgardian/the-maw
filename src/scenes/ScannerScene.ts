import Phaser from 'phaser'
import { CRTManager } from '../systems/CRTManager'
import { GameState } from '../systems/GameState'
import { getAvailableShips, getShip } from '../data/ships'
import type { ShipDef } from '../types'

const SWEEP_DURATION = 1500
const G = '#00ff66'
const G_DIM = '#004422'

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

  constructor() {
    super({ key: 'ScannerScene' })
  }

  create() {
    CRTManager.setTint(0.0, 1.0, 0.4)
    this.cameras.main.setPostPipeline('CRTPipeline')
    this.cameras.main.setBackgroundColor('#000000')

    const H = this.scale.height

    // Radar display
    const cx = 240
    const cy = 240
    const radius = 180

    this.sweepGraphics = this.add.graphics()

    // Radar border
    this.sweepGraphics.lineStyle(1, 0x00ff66, 0.6)
    this.sweepGraphics.strokeCircle(cx, cy, radius)
    this.sweepGraphics.strokeCircle(cx, cy, radius * 0.6)
    this.sweepGraphics.strokeCircle(cx, cy, radius * 0.2)

    // Crosshair
    this.sweepGraphics.lineStyle(1, 0x00ff66, 0.3)
    this.sweepGraphics.lineBetween(cx - radius, cy, cx + radius, cy)
    this.sweepGraphics.lineBetween(cx, cy - radius, cx, cy + radius)

    // Center dot
    this.sweepGraphics.fillStyle(0x00ff66, 0.8)
    this.sweepGraphics.fillCircle(cx, cy, 3)

    // Title
    this.add.text(cx, 30, 'PHASE-ARRAY SCANNER', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: G,
    }).setOrigin(0.5)

    this.add.text(cx, 46, 'v0.1 — RANGE: SHORT', {
      fontFamily: 'monospace',
      fontSize: '9px',
      color: G_DIM,
    }).setOrigin(0.5)

    // Sweep button
    this.sweepBtn = this.add.text(240, 470, '[ DISCOVERY SWEEP ]', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: G,
      backgroundColor: '#001a00',
      padding: { x: 12, y: 6 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })

    this.sweepBtn.on('pointerover', () => this.sweepBtn.setColor('#ffffff'))
    this.sweepBtn.on('pointerout', () => this.sweepBtn.setColor(G))
    this.sweepBtn.on('pointerdown', () => this.startSweep())

    // Contact list area (right side)
    const lx = 480
    this.add.text(lx, 80, 'CONTACTS', {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: G_DIM,
    })

    this.stateText = this.add.text(lx, 100, 'AWAITING SWEEP...', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: G_DIM,
      wordWrap: { width: 440 },
    })

    // Info panel (right side, below contacts)
    this.infoText = this.add.text(lx, 280, '', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: G,
      wordWrap: { width: 440 },
      lineSpacing: 4,
    })

    // Status bar
    this.statusBar = this.add.text(10, H - 16, 'SCN> READY', {
      fontFamily: 'monospace',
      fontSize: '9px',
      color: G_DIM,
    })
  }

  update(time: number) {
    const cx = 240
    const cy = 240
    const radius = 180

    this.sweepGraphics.clear()

    // Redraw static elements
    this.sweepGraphics.lineStyle(1, 0x00ff66, 0.6)
    this.sweepGraphics.strokeCircle(cx, cy, radius)
    this.sweepGraphics.strokeCircle(cx, cy, radius * 0.6)
    this.sweepGraphics.strokeCircle(cx, cy, radius * 0.2)

    this.sweepGraphics.lineStyle(1, 0x00ff66, 0.3)
    this.sweepGraphics.lineBetween(cx - radius, cy, cx + radius, cy)
    this.sweepGraphics.lineBetween(cx, cy - radius, cx, cy + radius)

    this.sweepGraphics.fillStyle(0x00ff66, 0.8)
    this.sweepGraphics.fillCircle(cx, cy, 3)

    if (this.isSweeping) {
      const elapsed = time - this.sweepStartTime
      const progress = Math.min(elapsed / SWEEP_DURATION, 1)
      this.sweepAngle = progress * Math.PI * 2

      if (progress >= 1) {
        this.isSweeping = false
        this.onSweepComplete()
      }
    }

    // Sweep line
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

    // Clear previous contacts
    this.contacts = []
    this.contactLabels.forEach(l => l.destroy())
    this.contactLabels = []
    this.selectedShipId = null
    this.infoText.setText('')
  }

  private onSweepComplete() {
    this.sweepBtn.setAlpha(1)
    this.sweepBtn.setInteractive({ useHandCursor: true })

    const completed = GameState.get().completedWrecks
    const available = getAvailableShips(completed)

    // Generate positions for each contact
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

    // Reveal them one by one with a delay
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
        fontFamily: 'monospace',
        fontSize: '11px',
        color,
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

    // Latch button
    const lx = 480
    const latchBtn = this.add.text(lx, 450, '[ LATCH & PROCESS ]', {
      fontFamily: 'monospace',
      fontSize: '13px',
      color: G,
      backgroundColor: '#001a00',
      padding: { x: 10, y: 5 },
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
