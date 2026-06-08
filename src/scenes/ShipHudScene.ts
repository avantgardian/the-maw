import Phaser from 'phaser'
import { CRTManager } from '../systems/CRTManager'
import { GameState } from '../systems/GameState'

const W = '#ccccdd'
const W_DIM = '#555566'
const HULL_COL = 0x66aaff
const MAW_COL = 0xcc88ff
const SX = 872
const SW = 88

export class ShipHudScene extends Phaser.Scene {
  private hullGfx!: Phaser.GameObjects.Graphics
  private mawGfx!: Phaser.GameObjects.Graphics
  private hullPct!: Phaser.GameObjects.Text
  private mawPct!: Phaser.GameObjects.Text
  private resText!: Phaser.GameObjects.Text
  private spoolBadge!: Phaser.GameObjects.Text

  constructor() {
    super({ key: 'ShipHudScene' })
  }

  create() {
    CRTManager.setTint(0.8, 0.8, 0.87)
    this.cameras.main.setPostPipeline('CRTPipeline')

    const H = this.scale.height

    const bg = this.add.graphics()
    bg.fillStyle(0x08080c, 0.92)
    bg.fillRect(SX, 0, SW, H)
    bg.lineStyle(1, 0x333344, 0.7)
    bg.lineBetween(SX, 0, SX, H)

    this.add.text(SX + SW / 2, 16, 'SYS', {
      fontFamily: 'monospace', fontSize: '9px', color: W_DIM,
    }).setOrigin(0.5)

    bg.lineStyle(1, 0x333344, 0.3)
    bg.lineBetween(SX + 6, 28, SX + SW - 6, 28)

    this.add.text(SX + 8, 36, 'HULL', {
      fontFamily: 'monospace', fontSize: '7px', color: W_DIM,
    })

    this.hullGfx = this.add.graphics()
    this.drawMiniBar(this.hullGfx, SX + 8, 48, SW - 16, 6, GameState.get().systems.hull, HULL_COL)

    this.hullPct = this.add.text(SX + SW / 2, 58, `${GameState.get().systems.hull}%`, {
      fontFamily: 'monospace', fontSize: '7px', color: '#66aaff',
    }).setOrigin(0.5)

    this.createMiniBtn(SX + SW / 2, 70, 'REP HULL', () => {
      const gs = GameState.get()
      if (gs.resources.alloy <= 0) return
      const spend = Math.min(gs.resources.alloy, 20)
      GameState.spendResource('alloy', spend)
      GameState.repairSystem('hull', spend)
    })

    this.add.text(SX + 8, 90, 'MAW', {
      fontFamily: 'monospace', fontSize: '7px', color: W_DIM,
    })

    this.mawGfx = this.add.graphics()
    this.drawMiniBar(this.mawGfx, SX + 8, 102, SW - 16, 6, GameState.get().systems.mawCore, MAW_COL)

    this.mawPct = this.add.text(SX + SW / 2, 112, `${GameState.get().systems.mawCore}%`, {
      fontFamily: 'monospace', fontSize: '7px', color: '#cc88ff',
    }).setOrigin(0.5)

    this.createMiniBtn(SX + SW / 2, 124, 'REP MAW', () => {
      const gs = GameState.get()
      if (gs.resources.nodes <= 0) return
      const spend = Math.min(gs.resources.nodes, 20)
      GameState.spendResource('nodes', spend)
      GameState.repairSystem('mawCore', spend * 3)
    })

    bg.lineStyle(1, 0x333344, 0.3)
    bg.lineBetween(SX + 6, 142, SX + SW - 6, 142)

    this.resText = this.add.text(SX + 8, 150, '', {
      fontFamily: 'monospace', fontSize: '7px', color: W, lineSpacing: 2,
    })
    this.updateResources()

    const resEndY = 150 + 4 * 11
    bg.lineStyle(1, 0x333344, 0.3)
    bg.lineBetween(SX + 6, resEndY, SX + SW - 6, resEndY)

    const splBtn = this.add.text(SX + SW / 2, resEndY + 12, '[SPL]', {
      fontFamily: 'monospace', fontSize: '9px', color: '#44ff88',
      backgroundColor: '#002211', padding: { x: 6, y: 3 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })
    splBtn.on('pointerover', () => splBtn.setColor('#ffffff'))
    splBtn.on('pointerout', () => splBtn.setColor('#44ff88'))
    splBtn.on('pointerdown', () => this.openSpoolPanel())

    this.spoolBadge = this.add.text(SX + SW / 2 + 28, resEndY + 8, '', {
      fontFamily: 'monospace', fontSize: '7px', color: '#44ff88',
    })

    this.add.text(SX + 8, H - 14, 'SYS>', {
      fontFamily: 'monospace', fontSize: '7px', color: W_DIM,
    })
  }

  update() {
    const gs = GameState.get()
    this.drawMiniBar(this.hullGfx, SX + 8, 48, SW - 16, 6, gs.systems.hull, HULL_COL)
    this.drawMiniBar(this.mawGfx, SX + 8, 102, SW - 16, 6, gs.systems.mawCore, MAW_COL)
    this.hullPct.setText(`${gs.systems.hull}%`)
    this.mawPct.setText(`${gs.systems.mawCore}%`)
    this.updateResources()
    const n = gs.unlockedSpools.length
    this.spoolBadge.setText(n > 0 ? `[${n}]` : '')
  }

  private drawMiniBar(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number, current: number, color: number) {
    g.clear()
    const pct = Math.min(current / 100, 1)
    g.fillStyle(0x111118, 1)
    g.fillRect(x, y, w, h)
    g.fillStyle(color, 0.7)
    g.fillRect(x, y, w * pct, h)
    g.lineStyle(1, 0x333344, 1)
    g.strokeRect(x, y, w, h)
  }

  private createMiniBtn(x: number, y: number, label: string, onClick: () => void) {
    const btn = this.add.text(x, y, `[${label}]`, {
      fontFamily: 'monospace', fontSize: '7px', color: W_DIM,
      padding: { x: 2, y: 1 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })
    btn.on('pointerdown', onClick)
    btn.on('pointerover', () => btn.setColor('#ffffff'))
    btn.on('pointerout', () => btn.setColor(W_DIM))
  }

  private updateResources() {
    const r = GameState.get().resources
    this.resText.setText(
      `AL ${r.alloy}\nOI ${r.oil}\nND ${r.nodes}\nBM ${r.biomass}`
    )
  }

  private openSpoolPanel() {
    if (this.scene.isActive('SpoolPanelScene') || this.scene.isActive('ProcessingPanelScene')) return
    this.scene.launch('SpoolPanelScene')
  }
}
