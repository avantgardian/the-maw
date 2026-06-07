import type { SpoolDef } from '../types'

export const SPOOLS: SpoolDef[] = [
  {
    id: 'last-voices-01',
    title: 'TRANSCRIPT // CAPTAIN MAREN // REGISTRY UNKNOWN',
    thread: 'THE LAST VOICES',
    lines: [
      '',
      'The drives gave out six hours ago.',
      '',
      'I\'ve locked myself in the comms bay. The crew is gone — either evacuated or...',
      'I don\'t want to think about the alternative.',
      '',
      'The signal is everywhere now. It\'s not a transmission.',
      'It\'s a sound the ship itself is making.',
      'Metal singing. Pipes humming in frequencies that shouldn\'t exist.',
      '',
      'I\'ve been listening to it for three hours.',
      'I think I understand now.',
      '',
      'It\'s not calling out.',
      'It\'s calling back.',
      '',
      'If you find this ship, don\'t salvage the comms array.',
      'Leave it in the black. Let it drift.',
      '',
      'Some things should never be replayed.',
      '',
      '[ TRANSMISSION ENDS — CARRIER LOST ]',
      '',
    ],
  },
]

export function getSpool(id: string): SpoolDef | undefined {
  return SPOOLS.find(s => s.id === id)
}
