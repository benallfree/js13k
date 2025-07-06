import { PlayingCard } from '@/components/PlayingCard/PlayingCard'
import { generateCardTransform, generateDeck } from '@/pages/Play/utils'
import { div, van } from '@van13k'

export type SandboxArea = {
  x1: number
  y1: number
  x2: number
  y2: number
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

// CardPile component for rendering scattered cards
export const CardPile = ({ jokerCount = 0, sandbox, scatterPattern = 'random', scatterSeed }: CardPileProps) => {
  // Use current timestamp as seed if none provided (ensures different scatter each time)
  const seed = scatterSeed || Date.now()

  // Generate a unique deck of cards (shuffled by default)
  const deck = generateDeck(jokerCount, true, seed)

  // Track the highest z-index used
  const maxZIndex = van.state(deck.length + 1)

  // Function to bring a card to the top permanently (after dragging)
  const bringToTop = () => {
    const newZIndex = maxZIndex.val + 1
    maxZIndex.val = newZIndex
    return newZIndex
  }

  return div(
    { class: 'absolute inset-0' },
    // Sandbox boundary visualization (optional - remove in production)
    div({
      class: 'absolute border-2 border-dashed border-yellow-400 opacity-30 pointer-events-none',
      style: `left: ${sandbox.x1}px; top: ${sandbox.y1}px; width: ${sandbox.x2 - sandbox.x1}px; height: ${sandbox.y2 - sandbox.y1}px;`,
    }),
    // Cards with unique values
    ...deck.map((card, index) => {
      const transform = generateCardTransform(index, sandbox, scatterPattern, seed)
      return PlayingCard(card, transform, index, bringToTop)
    })
  )
}
