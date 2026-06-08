import Phaser from 'phaser'
import { CRTManager } from '../systems/CRTManager'
import { GameState } from '../systems/GameState'
import { getAvailableShips, getShip } from '../data/ships'
import type { ShipDef } from '../types'

const SWEEP_DURATION = 3000
const G = '#00ff66'
const G_DIM = '#004422'



export class ScannerScene extends Phaser.Scene {
  private sweepAngle = 0
  private ambientAngle = 0
  private isSweeping = false
  private ambientScan = false
  private sweepStartTime = 0
  private contacts: { shipId: string; angle: number; revealed: boolean; lastPinged: number }[] = []
  private selectedShipId: string | null = null
  private sweepGraphics!: Phaser.GameObjects.Graphics
  private contactLabels: Phaser.GameObjects.Text[] = []
  private stateText!: Phaser.GameObjects.Text
  private infoText!: Phaser.GameObjects.Text
  private sweepBtn!: Phaser.GameObjects.Text
  private statusBar!: Phaser.GameObjects.Text
  private latchBtn: Phaser.GameObjects.Text | null = null
  private wasProcessingActive = false

  constructor() {
    super({ key: 'ScannerScene' })
  }

  create() {
    CRTManager.setTint(0.0, 1.0, 0.4)
    this.cameras.main.setPostPipeline('CRTPipeline')
    this.cameras.main.setBackgroundColor('#000000')

    const H = this.scale.height

    // Radar center
    const cx = 240

    this.sweepGraphics = this.add.graphics()
    this.contactLabels = []
    this.selectedShipId = null
    this.isSweeping = false
    this.ambientScan = false
    this.contacts = []
    this.latchBtn = null

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
    this.sweepBtn = this.add.text(cx, 470, '[ DISCOVERY SWEEP ]', {
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

    // Check for contact-lost entrance removed — ShipHudScene is always visible
  }

  update(time: number, delta: number) {
    const cx = 240
    const cy = 240
    const radius = 180

    // Detect when processing panel closes and reset scanner state
    const isProcessing = this.scene.isActive('ProcessingPanelScene')
    if (this.wasProcessingActive && !isProcessing) {
      this.onReturnFromProcessing()
    }
    this.wasProcessingActive = isProcessing

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

    // Sweep line — only during active sweep
    if (this.isSweeping) {
      const elapsed = time - this.sweepStartTime
      const progress = Math.min(elapsed / SWEEP_DURATION, 1)
      this.sweepAngle = progress * Math.PI * 2

      if (progress >= 1) {
        this.isSweeping = false
        this.onSweepComplete()
      }

      const sx = cx + Math.cos(this.sweepAngle) * radius * 0.95
      const sy = cy + Math.sin(this.sweepAngle) * radius * 0.95

      // Phosphor trail
      for (let i = 0; i < 20; i++) {
        const a = this.sweepAngle - i * 0.02
        const px = cx + Math.cos(a) * radius * 0.95
        const py = cy + Math.sin(a) * radius * 0.95
        this.sweepGraphics.lineStyle(1, 0x00ff66, 0.3 - i * 0.015)
        this.sweepGraphics.lineBetween(cx, cy, px, py)
      }

      this.sweepGraphics.lineStyle(1, 0x00ff66, 0.8)
      this.sweepGraphics.lineBetween(cx, cy, sx, sy)
    } else if (this.ambientScan) {
      this.ambientAngle = (this.ambientAngle + 0.00209 * delta) % (Math.PI * 2)
      const sx = cx + Math.cos(this.ambientAngle) * radius * 0.95
      const sy = cy + Math.sin(this.ambientAngle) * radius * 0.95

      for (let i = 0; i < 10; i++) {
        const a = this.ambientAngle - i * 0.03
        const px = cx + Math.cos(a) * radius * 0.95
        const py = cy + Math.sin(a) * radius * 0.95
        this.sweepGraphics.lineStyle(1, 0x00ff66, 0.15 - i * 0.013)
        this.sweepGraphics.lineBetween(cx, cy, px, py)
      }

      this.sweepGraphics.lineStyle(1, 0x00ff66, 0.4)
      this.sweepGraphics.lineBetween(cx, cy, sx, sy)
    }

    // Contacts on radar — dim until sweep passes over them
    const lineAngle = this.isSweeping ? this.sweepAngle : this.ambientScan ? this.ambientAngle : -1
    for (const c of this.contacts) {
      if (!c.revealed) continue

      // Check if sweep line passes over this contact
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

      const px = cx + Math.cos(c.angle) * radius * 0.45
      const py = cy + Math.sin(c.angle) * radius * 0.45
      this.sweepGraphics.fillStyle(0x00ff66, alpha)
      this.sweepGraphics.fillCircle(px, py, 4)
    }

    // Pulse sweep button as call-to-action when idle
    if (this.contacts.length === 0 && !this.isSweeping && !this.isPanelOpen()) {
      this.sweepBtn.setAlpha(0.55 + 0.45 * Math.sin(time / 400))
    }
  }

  private isPanelOpen(): boolean {
    return this.scene.isActive('ProcessingPanelScene') || this.scene.isActive('SpoolPanelScene')
  }

  private onReturnFromProcessing() {
    const gs = GameState.get()
    this.isSweeping = false
    this.ambientScan = false

    // Wreck was completed — clear contacts, force re-sweep
    if (gs.lastCompletedWreck) {
      if (this.latchBtn) {
        this.latchBtn.destroy()
        this.latchBtn = null
      }
      this.selectedShipId = null
      this.infoText.setText('')
      gs.lastCompletedWreck = null
      this.contacts = []
      this.contactLabels.forEach(l => l.destroy())
      this.contactLabels = []
      this.stateText.setText('AWAITING SWEEP...')

      this.sweepBtn.disableInteractive()
      this.sweepBtn.setAlpha(0.4)
      this.updateStatus('CONTACT LOST...')

      this.time.delayedCall(1500, () => {
        this.sweepBtn.setInteractive({ useHandCursor: true })
        this.sweepBtn.setAlpha(1)
        this.updateStatus('READY FOR RESWEEP')
      })
      return
    }

    // Cancelled — just re-enable the latch button
    if (this.latchBtn) {
      this.latchBtn.setInteractive({ useHandCursor: true })
    }
    this.updateStatus('READY')
  }

  private startSweep() {
    if (this.isPanelOpen() || this.isSweeping) return
    this.isSweeping = true
    this.ambientScan = false
    this.sweepAngle = 0
    this.sweepStartTime = this.time.now
    this.sweepBtn.disableInteractive()
    this.sweepBtn.setAlpha(0.4)
    this.updateStatus('SWEEP IN PROGRESS...')

    this.contacts = []
    this.contactLabels.forEach(l => l.destroy())
    this.contactLabels = []
    this.selectedShipId = null
    this.infoText.setText('')
    if (this.latchBtn) {
      this.latchBtn.destroy()
      this.latchBtn = null
    }
  }

  private onSweepComplete() {
    this.sweepBtn.setAlpha(1)
    this.sweepBtn.setInteractive({ useHandCursor: true })
    this.ambientScan = true
    this.ambientAngle = this.sweepAngle % (Math.PI * 2)

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
        lastPinged: 0,
      })
    })

    this.contacts.forEach((c, i) => {
      this.time.delayedCall(200 + i * 300, () => {
        c.revealed = true
        c.lastPinged = this.time.now
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
    if (this.isPanelOpen()) return
    this.selectedShipId = ship.id

    // Destroy previous latch button + info if re-selecting
    if (this.latchBtn) {
      this.latchBtn.destroy()
      this.latchBtn = null
    }
    this.infoText.setText('')

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
    this.latchBtn = this.add.text(lx, 450, '[ LATCH & PROCESS ]', {
      fontFamily: 'monospace', fontSize: '13px', color: G,
      backgroundColor: '#001a00', padding: { x: 10, y: 5 },
    }).setInteractive({ useHandCursor: true })

    this.latchBtn.on('pointerover', () => this.latchBtn!.setColor('#ffffff'))
    this.latchBtn.on('pointerout', () => this.latchBtn!.setColor(G))
    this.latchBtn.on('pointerdown', () => {
      if (this.isPanelOpen()) return
      this.updateStatus('LATCHING...')
      this.latchBtn!.removeInteractive()
      this.time.delayedCall(500, () => {
        this.scene.launch('ProcessingPanelScene', { shipId: ship.id })
      })
    })
  }

  private updateStatus(msg: string) {
    this.statusBar.setText(`SCN> ${msg}`)
  }
}
