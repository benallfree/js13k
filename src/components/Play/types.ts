import { PlayerBase } from 'vibescale/ts'

export type PlayProps = {
  game: string
  joinCode: string
}

export type Player = PlayerBase & {
  playerType: 'host' | 'player'
  deviceDimensions?: {
    width: number
    height: number
  }
}

export type SearchParams = {
  game: string
  joinCode: string
}

export type SandboxArea = {
  x1: number
  y1: number
  x2: number
  y2: number
}

export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades'
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K'

export type Card = {
  id: string
  suit: Suit
  rank: Rank
  isJoker?: boolean
  color: 'red' | 'black'
}

export type ScatterPattern = 'random' | 'spiral' | 'circular' | 'cluster' | 'fan'

export type CardPileProps = {
  jokerCount?: number
  sandbox: SandboxArea
  scatterPattern?: ScatterPattern
  scatterSeed?: number
}

export type CardTransform = {
  x: number
  y: number
  rotation: number
}
