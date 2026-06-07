import Phaser from 'phaser'
import { CRTManager } from '../systems/CRTManager'
import { getSpool } from '../data/spools'

const G = '#00ff66'
const G_DIM = '#004422'
const CHAR_DELAY = 50

export class SpoolScene extends Phaser.Scene {
  private displayText!: Phaser.GameObjects.Text
  private statusText!: Phaser.GameObjects.Text
  private fullText: string[] = []
  private lineIndex = 0
  private charIndex = 0
  private typingTimer = 0
  private done = false

  constructor() {
    super({ key: 'SpoolScene' })
  }

  create(data: { spoolId?: string }) {
    CRTManager.setTint(0.0, 1.0, 0.4)
    this.cameras.main.setPostPipeline('CRTPipeline')
    this.cameras.main.setBackgroundColor('#000000')

    const W = this.scale.width
    const H = this.scale.height
    this.done = false
    this.lineIndex = 0
    this.charIndex = 0
    this.typingTimer = 0
    this.fullText = []

    const spool = getSpool(data.spoolId || 'last-voices-01')
    if (!spool) {
      this.scene.start('ScannerScene')
      return
    }

    const maxChars = 92

    this.add.text(W / 2, 20, `// ${spool.thread} //`, {
      fontFamily: 'monospace', fontSize: '11px', color: G_DIM,
    }).setOrigin(0.5)

    this.add.text(W / 2, 36, spool.title, {
      fontFamily: 'monospace', fontSize: '9px', color: G_DIM,
    }).setOrigin(0.5)

    this.add.text(W / 2, 48, '─'.repeat(56), {
      fontFamily: 'monospace', fontSize: '8px', color: G_DIM,
    }).setOrigin(0.5)

    this.displayText = this.add.text(60, 66, '', {
      fontFamily: 'monospace', fontSize: '10px', color: G, lineSpacing: 2,
      wordWrap: { width: W - 120 },
    })

    this.statusText = this.add.text(10, H - 16, 'SPL> DECODING...', {
      fontFamily: 'monospace', fontSize: '9px', color: G_DIM,
    })

    this.add.text(W / 2, H - 60, '[ DATA SPOOL v0.1 — RECOVERED SIGNAL ]', {
      fontFamily: 'monospace', fontSize: '8px', color: G_DIM,
    }).setOrigin(0.5)

    // Return to Scanner — always visible
    const btn = this.add.text(W / 2, H - 115, '[ RETURN TO SCANNER ]', {
      fontFamily: 'monospace', fontSize: '13px', color: '#ffffff',
      backgroundColor: '#003300', padding: { x: 14, y: 8 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })
      .on('pointerover', () => btn.setColor(G))
      .on('pointerout', () => btn.setColor('#ffffff'))
      .on('pointerdown', () => this.scene.start('ScannerScene'))

    // Pre-process lines
    for (let raw of spool.lines) {
      if (raw.length <= maxChars) {
        this.fullText.push(raw)
      } else {
        while (raw.length > maxChars) {
          this.fullText.push(raw.slice(0, maxChars))
          raw = raw.slice(maxChars)
        }
        if (raw.length > 0) this.fullText.push(raw)
      }
    }

    this.advanceLine()
  }

  update(_time: number, delta: number) {
    if (this.done) return

    this.typingTimer += delta
    while (this.typingTimer >= CHAR_DELAY) {
      this.typingTimer -= CHAR_DELAY

      const line = this.fullText[this.lineIndex]
      if (!line) {
        this.done = true
        this.finishTyping()
        return
      }

      if (this.charIndex < line.length) {
        this.charIndex++
        this.displayText.setText(
          this.fullText.slice(0, this.lineIndex).join('\n') + '\n' + line.slice(0, this.charIndex)
        )
      } else {
        this.lineIndex++
        this.charIndex = 0
        this.advanceLine()
      }
    }
  }

  private advanceLine() {
    if (this.lineIndex >= this.fullText.length) {
      this.done = true
      this.finishTyping()
      return
    }

    const line = this.fullText[this.lineIndex]
    if (line === '') {
      this.displayText.setText(this.fullText.slice(0, this.lineIndex + 1).join('\n'))
      this.lineIndex++
      this.advanceLine()
    } else {
      this.charIndex = 0
      this.typingTimer = 0
    }
  }

  private finishTyping() {
    this.displayText.setText(this.fullText.join('\n'))
    this.statusText.setText('SPL> DECODE COMPLETE')

    this.add.text(this.scale.width / 2, this.scale.height - 140, 'END TRANSMISSION', {
      fontFamily: 'monospace', fontSize: '12px', color: G,
    }).setOrigin(0.5)
  }
}
