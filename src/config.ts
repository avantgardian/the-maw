import Phaser from 'phaser'
import { BootScene } from './scenes/BootScene'
import { ScannerScene } from './scenes/ScannerScene'
import { ShipHudScene } from './scenes/ShipHudScene'
import { ProcessingPanelScene } from './scenes/ProcessingPanelScene'
import { SpoolPanelScene } from './scenes/SpoolPanelScene'

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
  scene: [BootScene, ScannerScene, ShipHudScene, ProcessingPanelScene, SpoolPanelScene],
}
