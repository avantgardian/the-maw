import Phaser from 'phaser'
import { CRTManager } from '../systems/CRTManager'

export class ProcessingScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ProcessingScene' })
  }

  create(data: { shipId: string }) {
    CRTManager.setTint(1.0, 0.53, 0.0)
    this.cameras.main.setPostPipeline('CRTPipeline')
    this.cameras.main.setBackgroundColor('#000000')

    const cx = this.scale.width / 2
    const cy = this.scale.height / 2

    this.add.text(cx, cy - 30, `LATCHED: ${data.shipId.toUpperCase()}`, {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#ff8800',
    }).setOrigin(0.5)

    this.add.text(cx, cy, 'PROCESSING v0.1 — COMING SOON', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#ff8800',
    }).setOrigin(0.5)

    this.add.text(cx, cy + 40, '[ RETURN TO SCANNER ]', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#885500',
      padding: { x: 8, y: 4 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.scene.start('ScannerScene'))
  }
}
