import { PlayerBase, PlayerId } from 'vibescale/ts'

export type Player = PlayerBase & {
  playerType: 'host' | 'player'
  deviceDimensions?: {
    width: number
    height: number
  }
  playerPositions?: Record<PlayerId, { x: number; y: number }>
}
