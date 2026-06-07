import Phaser from 'phaser'
import { CRTManager } from '../systems/CRTManager'
import { GameState } from '../systems/GameState'

const W = '#ccccdd'
const W_DIM = '#444455'
const W_BG = '#0d0d14'
const ACCENT = '#66aaff'

export class ShipScene extends Phaser.Scene {
  private hullBar!: Phaser.GameObjects.Graphics
  private mawBar!: Phaser.GameObjects.Graphics
  private hullText!: Phaser.GameObjects.Text
  private mawText!: Phaser.GameObjects.Text
  private resourceText!: Phaser.GameObjects.Text
  private statusText!: Phaser.GameObjects.Text

  constructor() {
    super({ key: 'ShipScene' })
  }

  create() {
    CRTManager.setTint(0.8, 0.8, 0.87)
    this.cameras.main.setPostPipeline('CRTPipeline')
    this.cameras.main.setBackgroundColor('#000000')

    const gameW = this.scale.width
    const H = this.scale.height

    this.add.text(gameW / 2, 20, 'SHIP SYSTEMS', {
      fontFamily: 'monospace',
      fontSize: '13px',
      color: '#ccccdd',
    }).setOrigin(0.5)

    // Hull section
    const hullY = 60
    this.add.text(60, hullY, 'HULL INTEGRITY', {
      fontFamily: 'monospace',
      fontSize: '9px',
      color: W_DIM,
    })

    this.hullBar = this.add.graphics()
    this.drawBar(this.hullBar, 60, hullY + 16, 500, 14, GameState.get().systems.hull, 100, 0x66aaff)

    this.hullText = this.add.text(580, hullY + 14, `${GameState.get().systems.hull}%`, {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: ACCENT,
    })

    // Maw Core section
    const mawY = 110
    this.add.text(60, mawY, 'MAW CORE', {
      fontFamily: 'monospace',
      fontSize: '9px',
      color: W_DIM,
    })

    this.mawBar = this.add.graphics()
    this.drawBar(this.mawBar, 60, mawY + 16, 500, 14, GameState.get().systems.mawCore, 100, 0xcc88ff)

    this.mawText = this.add.text(580, mawY + 14, `${GameState.get().systems.mawCore}%`, {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#cc88ff',
    })

    // Resources
    this.add.text(60, 160, 'STORED RESOURCES', {
      fontFamily: 'monospace',
      fontSize: '9px',
      color: W_DIM,
    })

    this.resourceText = this.add.text(60, 180, '', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: W,
      lineSpacing: 4,
    })
    this.updateResources()

    // Allocation controls
    this.add.text(60, 260, 'ALLOCATE RESOURCES', {
      fontFamily: 'monospace',
      fontSize: '9px',
      color: W_DIM,
    })

    // Alloy → Hull
    this.createAllocRow(320, 'ALLOY', 'HULL', 'alloy', 'hull')

    // Nodes → Maw Core
    this.createAllocRow(350, 'NODES', 'MAW CORE', 'nodes', 'mawCore')

    // Status
    this.statusText = this.add.text(gameW / 2, H - 60, '', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: W_DIM,
    }).setOrigin(0.5, 0.5)

    // Return to scanner
    const returnBtn = this.add.text(gameW / 2, H - 30, '[ RETURN TO SCANNER ]', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: ACCENT,
      backgroundColor: W_BG,
      padding: { x: 10, y: 5 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.scene.start('ScannerScene'))
      .on('pointerover', () => returnBtn.setColor('#ffffff'))
      .on('pointerout', () => returnBtn.setColor(ACCENT))

    // Footer
    this.add.text(10, H - 14, 'SYS> STANDBY', {
      fontFamily: 'monospace',
      fontSize: '9px',
      color: W_DIM,
    })
  }

  private createAllocRow(y: number, resource: string, system: string, resKey: 'alloy' | 'nodes', sysKey: 'hull' | 'mawCore') {
    const x = 60
    const btn = this.add.text(x, y, `[ REPAIR ${system} ]`, {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#ccccdd',
      backgroundColor: W_BG,
      padding: { x: 8, y: 4 },
    }).setInteractive({ useHandCursor: true })

    btn.on('pointerdown', () => {
      const gs = GameState.get()
      const resAmount = gs.resources[resKey]
      if (resAmount <= 0) {
        this.setStatus(`NO ${resource} AVAILABLE`)
        return
      }

      // Spend up to 20 units
      const spend = Math.min(resAmount, 20)
      const gained = resKey === 'nodes' ? spend * 3 : spend

      GameState.spendResource(resKey, spend)
      GameState.repairSystem(sysKey, gained)

      this.updateResources()
      this.updateBars()
      this.checkUnlocks()
      this.setStatus(`${resource} → ${system}: +${gained}% (spent ${spend})`)
    })
  }

  private checkUnlocks() {
    const gs = GameState.get()
    if (!gs.hasUnlockedExtractor2 && gs.systems.mawCore >= 30 && gs.resources.nodes >= 550) {
      GameState.unlockExtractor2()
      this.setStatus('UNLOCKED: SECOND EXTRACTOR ARRAY ONLINE')
    }
    if (gs.resources.alloy >= 150) {
      this.setStatus('HULL REINFORCEMENT AVAILABLE (unlock cosmetic only in v0.1)')
    }
  }

  private drawBar(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number, current: number, max: number, color: number) {
    g.clear()
    const pct = current / max
    g.fillStyle(0x111118, 1)
    g.fillRect(x, y, w, h)
    g.fillStyle(color, 0.7)
    g.fillRect(x, y, w * pct, h)
    g.lineStyle(1, 0x333344, 1)
    g.strokeRect(x, y, w, h)
  }

  private updateBars() {
    const gs = GameState.get()
    this.drawBar(this.hullBar, 60, 76, 500, 14, gs.systems.hull, 100, 0x66aaff)
    this.drawBar(this.mawBar, 60, 126, 500, 14, gs.systems.mawCore, 100, 0xcc88ff)
    this.hullText.setText(`${gs.systems.hull}%`)
    this.mawText.setText(`${gs.systems.mawCore}%`)
  }

  private updateResources() {
    const gs = GameState.get()
    this.resourceText.setText(
      `ALLOY: ${gs.resources.alloy}\nOIL: ${gs.resources.oil}\nNODES: ${gs.resources.nodes}\nBIOMASS: ${gs.resources.biomass}`
    )
  }

  private setStatus(msg: string) {
    this.statusText.setText(msg)
  }

  update() {
    this.updateBars()
    this.updateResources()
  }
}
