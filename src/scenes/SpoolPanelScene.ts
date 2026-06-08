import Phaser from 'phaser'
import { CRTManager } from '../systems/CRTManager'
import { GameState } from '../systems/GameState'
import { getSpool } from '../data/spools'
const G = '#00ff66'
const G_DIM = '#004422'
const R_DIM = '#661111'
const PANEL_X = 240
const PANEL_W = 720
const CR = PANEL_W - 88
const CHAR_DELAY = 50

export class SpoolPanelScene extends Phaser.Scene {
  private container!: Phaser.GameObjects.Container
  private subContainer!: Phaser.GameObjects.Container
  private state: 'grid' | 'detail' = 'grid'
  private closed = false

  // Detail state
  private displayText!: Phaser.GameObjects.Text
  private statusText!: Phaser.GameObjects.Text
  private fullText: string[] = []
  private lineIndex = 0
  private charIndex = 0
  private typingTimer = 0
  private done = false

  constructor() {
    super({ key: 'SpoolPanelScene' })
  }

  create() {
    CRTManager.setTint(0.0, 1.0, 0.4)
    this.cameras.main.setPostPipeline('CRTPipeline')
    this.state = 'grid'
    this.closed = false

    // Dim overlay
    const dim = this.add.graphics()
    dim.fillStyle(0x000000, 0.6)
    dim.fillRect(0, 0, PANEL_X, this.scale.height)
    this.add.zone(PANEL_X / 2, this.scale.height / 2, PANEL_X, this.scale.height)
      .setInteractive()

    // Main container
    this.container = this.add.container(this.scale.width, 0)
    this.buildGrid()

    // Sub container (hidden initially)
    this.subContainer = this.add.container(this.scale.width, 0)
    this.subContainer.setVisible(false)

    // Ensure sidebar stays on top
    this.scene.bringToTop('ShipHudScene')

    // Slide in (grid panel)
    this.tweens.add({
      targets: this.container,
      x: PANEL_X,
      duration: 300,
      ease: 'Cubic.easeOut',
    })
  }

  update(_time: number, delta: number) {
    if (this.state === 'detail' && !this.done) {
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
  }

  // ── Grid ──

  private buildGrid() {
    this.container.removeAll(true)

    const surface = this.add.graphics()
    surface.fillStyle(0x000a00, 0.95)
    surface.fillRect(0, 0, PANEL_W, this.scale.height)
    surface.lineStyle(1, 0x004422, 0.5)
    surface.lineBetween(0, 0, 0, this.scale.height)
    this.container.add(surface)

    const title = this.add.text(CR / 2, 18, 'DATA SPOOL ARCHIVE', {
      fontFamily: 'monospace', fontSize: '13px', color: G,
    }).setOrigin(0.5)
    this.container.add(title)

    // Close
    const closeBtn = this.add.text(CR - 14, 10, '[X]', {
      fontFamily: 'monospace', fontSize: '11px', color: R_DIM,
    }).setOrigin(1, 0).setInteractive({ useHandCursor: true })
    closeBtn.on('pointerdown', () => this.closePanel())
    closeBtn.on('pointerover', () => closeBtn.setColor('#ff4444'))
    closeBtn.on('pointerout', () => closeBtn.setColor(R_DIM))
    this.container.add(closeBtn)

    const unlocked = GameState.get().unlockedSpools

    if (unlocked.length === 0) {
      const empty = this.add.text(CR / 2, this.scale.height / 2, 'NO SPOOLS RECOVERED YET\n\nDiscover them by processing wrecks.', {
        fontFamily: 'monospace', fontSize: '10px', color: G_DIM, align: 'center',
      }).setOrigin(0.5)
      this.container.add(empty)

      const f = this.add.text(8, this.scale.height - 14, 'SPL> ARCHIVE', {
        fontFamily: 'monospace', fontSize: '9px', color: G_DIM,
      })
      this.container.add(f)
      return
    }

    const cardW = CR - 40
    const cardH = 80
    const gap = 12
    const startY = 44

    unlocked.forEach((id, i) => {
      const spool = getSpool(id)
      if (!spool) return

      const y = startY + i * (cardH + gap)
      const read = GameState.hasReadSpool(id)

      const card = this.add.graphics()
      card.fillStyle(0x001a00, 0.8)
      card.fillRect(20, y, cardW, cardH)
      card.lineStyle(1, read ? 0x004422 : 0x00ff66, 0.4)
      card.strokeRect(20, y, cardW, cardH)
      this.container.add(card)

      const threadT = this.add.text(30, y + 6, spool.thread, {
        fontFamily: 'monospace', fontSize: '9px', color: G_DIM,
      })
      this.container.add(threadT)

      const titleT = this.add.text(30, y + 18, spool.title, {
        fontFamily: 'monospace', fontSize: '8px', color: G,
      })
      this.container.add(titleT)

      const preview = spool.lines.find(l => l.length > 0) || ''
      const previewT = this.add.text(30, y + 44, preview.slice(0, 72) + (preview.length > 72 ? '...' : ''), {
        fontFamily: 'monospace', fontSize: '8px', color: G_DIM,
      })
      this.container.add(previewT)

      const statusText = read ? '[READ]' : '[NEW]'
      const statusColor = read ? G_DIM : '#44ff88'
      const statusL = this.add.text(CR - 30, y + cardH - 10, statusText, {
        fontFamily: 'monospace', fontSize: '7px', color: statusColor,
      }).setOrigin(1, 1)
      this.container.add(statusL)

      const zone = this.add.zone(CR / 2, y + cardH / 2, cardW, cardH)
        .setInteractive({ useHandCursor: true })
      const spoolId = id
      zone.on('pointerdown', () => this.openDetail(spoolId))
      this.container.add(zone)
    })

    const f = this.add.text(8, this.scale.height - 14, `SPL> ${unlocked.length} SPOOL${unlocked.length !== 1 ? 'S' : ''}`, {
      fontFamily: 'monospace', fontSize: '9px', color: G_DIM,
    })
    this.container.add(f)
  }

  // ── Detail ──

  private openDetail(spoolId: string) {
    GameState.markSpoolRead(spoolId)
    this.state = 'detail'
    this.done = false
    this.lineIndex = 0
    this.charIndex = 0
    this.typingTimer = 0
    this.fullText = []

    const spool = getSpool(spoolId)
    if (!spool) {
      this.state = 'grid'
      return
    }

    // Slide main grid out
    this.tweens.add({
      targets: this.container,
      x: this.scale.width,
      duration: 150,
      ease: 'Cubic.easeIn',
    })

    // Build detail view
    this.subContainer.removeAll(true)
    this.subContainer.setVisible(true)
    this.subContainer.x = this.scale.width

    const surface = this.add.graphics()
    surface.fillStyle(0x000a00, 0.97)
    surface.fillRect(0, 0, PANEL_W, this.scale.height)
    surface.lineStyle(1, 0x004422, 0.5)
    surface.lineBetween(0, 0, 0, this.scale.height)
    this.subContainer.add(surface)

    // Back button
    const backBtn = this.add.text(18, 10, '[<- BACK]', {
      fontFamily: 'monospace', fontSize: '11px', color: G,
    }).setInteractive({ useHandCursor: true })
    backBtn.on('pointerdown', () => this.backToGrid())
    backBtn.on('pointerover', () => backBtn.setColor('#ffffff'))
    backBtn.on('pointerout', () => backBtn.setColor(G))
    this.subContainer.add(backBtn)

    // Close
    const closeBtn = this.add.text(CR - 14, 10, '[X]', {
      fontFamily: 'monospace', fontSize: '11px', color: R_DIM,
    }).setOrigin(1, 0).setInteractive({ useHandCursor: true })
    closeBtn.on('pointerdown', () => this.closePanel())
    closeBtn.on('pointerover', () => closeBtn.setColor('#ff4444'))
    closeBtn.on('pointerout', () => closeBtn.setColor(R_DIM))
    this.subContainer.add(closeBtn)

    const threadL = this.add.text(CR / 2, 34, `// ${spool.thread} //`, {
      fontFamily: 'monospace', fontSize: '11px', color: G_DIM,
    }).setOrigin(0.5)
    this.subContainer.add(threadL)

    const titleL = this.add.text(CR / 2, 48, spool.title, {
      fontFamily: 'monospace', fontSize: '9px', color: G_DIM,
    }).setOrigin(0.5)
    this.subContainer.add(titleL)

    const sep = this.add.text(CR / 2, 58, '\u2500'.repeat(48), {
      fontFamily: 'monospace', fontSize: '8px', color: G_DIM,
    }).setOrigin(0.5)
    this.subContainer.add(sep)

    this.displayText = this.add.text(30, 68, '', {
      fontFamily: 'monospace', fontSize: '10px', color: G, lineSpacing: 2,
      wordWrap: { width: CR - 60 },
    })
    this.subContainer.add(this.displayText)

    this.statusText = this.add.text(8, this.scale.height - 14, 'SPL> DECODING...', {
      fontFamily: 'monospace', fontSize: '9px', color: G_DIM,
    })
    this.subContainer.add(this.statusText)

    // Pre-process lines
    const maxChars = 74
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

    this.scene.bringToTop('ShipHudScene')

    // Slide in
    this.tweens.add({
      targets: this.subContainer,
      x: PANEL_X,
      duration: 250,
      ease: 'Cubic.easeOut',
    })
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

    const endMsg = this.add.text(CR / 2, this.scale.height - 50, 'END TRANSMISSION', {
      fontFamily: 'monospace', fontSize: '12px', color: G,
    }).setOrigin(0.5)
    this.subContainer.add(endMsg)
  }

  private backToGrid() {
    this.state = 'grid'

    this.tweens.add({
      targets: this.subContainer,
      x: this.scale.width,
      duration: 150,
      ease: 'Cubic.easeIn',
      onComplete: () => {
        this.subContainer.setVisible(false)
      },
    })

    this.buildGrid()
    this.scene.bringToTop('ShipHudScene')
    this.tweens.add({
      targets: this.container,
      x: PANEL_X,
      duration: 250,
      ease: 'Cubic.easeOut',
    })
  }

  private closePanel() {
    if (this.closed) return
    this.closed = true
    this.input.enabled = false
    this.tweens.add({
      targets: [this.container, this.subContainer],
      x: this.scale.width,
      duration: 200,
      ease: 'Cubic.easeIn',
      onComplete: () => this.scene.stop(),
    })
  }
}
