import Phaser from 'phaser'
import { gameConfig } from './config'

function startGame() {
  const container = document.getElementById('game-container')
  if (!container) return
  new Phaser.Game({ ...gameConfig, parent: container })
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startGame)
} else {
  startGame()
}
