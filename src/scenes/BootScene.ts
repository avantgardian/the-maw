import Phaser from 'phaser'
import { CRTPipeline } from '../shaders/crt.pipeline'

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' })
  }

  create() {
    const renderer = this.game.renderer as Phaser.Renderer.WebGL.WebGLRenderer
    if (renderer.pipelines) {
      renderer.pipelines.addPostPipeline('CRTPipeline', CRTPipeline)
      this.cameras.main.setPostPipeline('CRTPipeline')
    }

    this.cameras.main.setBackgroundColor('#000000')

    const cx = this.scale.width / 2
    const cy = this.scale.height / 2

    const text = this.add.text(cx, cy, 'INITIALIZING...', {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#ffb000',
    }).setOrigin(0.5)

    let dots = 0
    const blinkTimer = this.time.addEvent({
      delay: 400,
      callback: () => {
        dots = (dots + 1) % 4
        text.setText('INITIALIZING' + '.'.repeat(dots))
      },
      loop: true,
    })

    this.time.delayedCall(2000, () => {
      blinkTimer.destroy()
      this.scene.start('ScannerScene')
    })
  }
}
