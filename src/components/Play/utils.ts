import qs from 'qs'
import type { Card, CardTransform, Rank, SandboxArea, ScatterPattern, Suit } from './types'

export const useSearchParams = <T extends Record<string, any>>(): T => {
  return qs.parse(window.location.search, {
    ignoreQueryPrefix: true,
    parseArrays: true,
    allowDots: true,
  }) as T
}

// Constants for pseudo-random number generation
const RANDOM_SEED_1 = 12.9898
const RANDOM_SEED_2 = 78.233
const RANDOM_MULTIPLIER = 43758.5453

// Constants for card positioning
const CARD_DIMENSIONS = {
  width: 64, // Card width in pixels (w-16)
  height: 96, // Card height in pixels (h-24)
}

// Calculate card diagonal for rotation padding
const CARD_DIAGONAL = Math.sqrt(CARD_DIMENSIONS.width ** 2 + CARD_DIMENSIONS.height ** 2) // ~115px
const ROTATION_PADDING = Math.ceil(CARD_DIAGONAL / 2) + 20 // Half diagonal + extra margin

// Enhanced pseudo-random function with seed
const seededRandom = (seed: number, index: number, variant = 0): number => {
  const rand = Math.sin((seed + index * 1000 + variant) * RANDOM_SEED_1) * RANDOM_MULTIPLIER
  return rand - Math.floor(rand)
}

// Fisher-Yates shuffle with seeded random
const shuffleDeck = (deck: Card[], seed: number): Card[] => {
  const shuffled = [...deck]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom(seed, i, 999) * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// Generate a standard 52-card deck with optional jokers
export const generateDeck = (jokerCount = 0, shuffle = true, seed = Date.now()): Card[] => {
  const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades']
  const ranks: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']

  const cards: Card[] = []

  // Generate standard deck
  for (const suit of suits) {
    for (const rank of ranks) {
      cards.push({
        id: `${suit}-${rank}`,
        suit,
        rank,
        color: suit === 'hearts' || suit === 'diamonds' ? 'red' : 'black',
      })
    }
  }

  // Add jokers if requested
  for (let i = 0; i < jokerCount; i++) {
    cards.push({
      id: `joker-${i + 1}`,
      suit: 'hearts', // Default suit for jokers
      rank: 'A', // Default rank for jokers
      isJoker: true,
      color: i % 2 === 0 ? 'red' : 'black', // Alternate colors for multiple jokers
    })
  }

  // Shuffle the deck so jokers aren't always on top
  return shuffle ? shuffleDeck(cards, seed) : cards
}

// Generate scatter pattern for cards
export const generateCardTransform = (
  index: number,
  sandbox: SandboxArea,
  pattern: ScatterPattern = 'random',
  seed = Date.now()
): CardTransform => {
  const availableWidth = sandbox.x2 - sandbox.x1 - ROTATION_PADDING * 2
  const availableHeight = sandbox.y2 - sandbox.y1 - ROTATION_PADDING * 2
  const centerX = (sandbox.x1 + sandbox.x2) / 2
  const centerY = (sandbox.y1 + sandbox.y2) / 2

  let x: number, y: number, rotation: number

  switch (pattern) {
    case 'spiral':
      const spiralRadius = Math.min(availableWidth, availableHeight) / 4
      const spiralAngle = index * 0.5
      const spiralDistance = (index / 52) * spiralRadius
      x = centerX + Math.cos(spiralAngle) * spiralDistance - CARD_DIMENSIONS.width / 2
      y = centerY + Math.sin(spiralAngle) * spiralDistance - CARD_DIMENSIONS.height / 2
      rotation = (((spiralAngle * 180) / Math.PI) % 360) - 180
      break

    case 'circular':
      const circleRadius = Math.min(availableWidth, availableHeight) / 3
      const circleAngle = (index / 52) * 2 * Math.PI
      const randomOffset = seededRandom(seed, index, 0) * 40 - 20
      x = centerX + Math.cos(circleAngle) * (circleRadius + randomOffset) - CARD_DIMENSIONS.width / 2
      y = centerY + Math.sin(circleAngle) * (circleRadius + randomOffset) - CARD_DIMENSIONS.height / 2
      rotation = (circleAngle * 180) / Math.PI - 90 + (seededRandom(seed, index, 1) - 0.5) * 60
      break

    case 'cluster':
      const clusterCount = 4
      const clusterIndex = Math.floor(index / (52 / clusterCount))
      const cardInCluster = index % (52 / clusterCount)
      const clusterAngle = (clusterIndex / clusterCount) * 2 * Math.PI
      const clusterDistance = Math.min(availableWidth, availableHeight) / 4
      const clusterCenterX = centerX + Math.cos(clusterAngle) * clusterDistance
      const clusterCenterY = centerY + Math.sin(clusterAngle) * clusterDistance
      const clusterSpread = 80
      x = clusterCenterX + (seededRandom(seed, index, 0) - 0.5) * clusterSpread - CARD_DIMENSIONS.width / 2
      y = clusterCenterY + (seededRandom(seed, index, 1) - 0.5) * clusterSpread - CARD_DIMENSIONS.height / 2
      rotation = (seededRandom(seed, index, 2) - 0.5) * 90
      break

    case 'fan':
      const fanAngle = -Math.PI / 3 + (index / 52) * ((2 * Math.PI) / 3)
      const fanRadius = Math.min(availableWidth, availableHeight) / 3
      const fanRandomness = seededRandom(seed, index, 0) * 40 - 20
      x = centerX + Math.cos(fanAngle) * (fanRadius + fanRandomness) - CARD_DIMENSIONS.width / 2
      y = centerY + Math.sin(fanAngle) * (fanRadius + fanRandomness) - CARD_DIMENSIONS.height / 2
      rotation = (fanAngle * 180) / Math.PI + (seededRandom(seed, index, 1) - 0.5) * 30
      break

    case 'random':
    default:
      // Enhanced random with better distribution
      const randomX = seededRandom(seed, index, 0)
      const randomY = seededRandom(seed, index, 1)
      const randomRotation = seededRandom(seed, index, 2)

      // Use quadratic distribution for more natural clustering
      const distributedX = randomX < 0.5 ? Math.pow(randomX * 2, 0.7) / 2 : 1 - Math.pow((1 - randomX) * 2, 0.7) / 2
      const distributedY = randomY < 0.5 ? Math.pow(randomY * 2, 0.7) / 2 : 1 - Math.pow((1 - randomY) * 2, 0.7) / 2

      x = Math.floor(distributedX * availableWidth) + sandbox.x1 + ROTATION_PADDING - CARD_DIMENSIONS.width / 2
      y = Math.floor(distributedY * availableHeight) + sandbox.y1 + ROTATION_PADDING - CARD_DIMENSIONS.height / 2
      rotation = Math.floor((randomRotation - 0.5) * 90)
      break
  }

  return { x, y, rotation }
}
