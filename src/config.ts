import Phaser from 'phaser'
import { BootScene } from './scenes/BootScene'
import { ScannerScene } from './scenes/ScannerScene'
import { ProcessingScene } from './scenes/ProcessingScene'
import { ShipScene } from './scenes/ShipScene'
import { SpoolScene } from './scenes/SpoolScene'

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.WEBGL,
  width: 960,
  height: 540,
  backgroundColor: '#000000',
  pixelArt: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BootScene, ScannerScene, ProcessingScene, ShipScene, SpoolScene],
}
