import { div, dragify, van, type DragState } from '@/van13k'
import type { Card, CardTransform } from './types'

// Get card suit symbol
const getSuitSymbol = (suit: string): string => {
  const symbols = {
    hearts: '♥',
    diamonds: '♦',
    clubs: '♣',
    spades: '♠',
  }
  return symbols[suit as keyof typeof symbols] || '?'
}

// Create a playing card component
export const PlayingCard = (card: Card, transform: CardTransform, index: number, bringToTop: () => number) => {
  const { x, y, rotation } = transform
  const isRed = card.color === 'red'

  // State for card position during drag
  const cardX = van.state(x)
  const cardY = van.state(y)
  const cardRotation = van.state(rotation)
  const isDragging = van.state(false)
  const zIndex = van.state(index + 1)

  // Track the offset from card position to initial touch point
  let touchOffsetX = 0
  let touchOffsetY = 0

  // Drag handlers
  const handleDragStart = (dragState: DragState) => {
    console.log(`Started dragging card: ${card.rank} of ${card.suit}`)
    isDragging.val = true
    zIndex.val = bringToTop() // Bring to top and keep it there

    // Calculate offset from card position to ORIGINAL touch point (not current position)
    touchOffsetX = dragState.startX - cardX.val
    touchOffsetY = dragState.startY - cardY.val
  }

  const handleDragMove = (dragState: DragState) => {
    // Position card so the original touch point stays under the finger
    cardX.val = dragState.currentX - touchOffsetX
    cardY.val = dragState.currentY - touchOffsetY
  }

  const handleDragEnd = () => {
    console.log(`Finished dragging card: ${card.rank} of ${card.suit} to position (${cardX.val}, ${cardY.val})`)
    isDragging.val = false
    // Don't reset z-index - card stays on top after being dragged
  }

  const dragEvents = dragify({
    onDragStart: handleDragStart,
    onDragMove: handleDragMove,
    onDragEnd: handleDragEnd,
  })

  // Special handling for jokers
  if (card.isJoker) {
    return div(
      {
        class: () => `
        absolute w-16 h-24 bg-gradient-to-br from-purple-900 to-purple-800 
        border-2 border-gray-300 rounded-lg shadow-lg cursor-pointer
        flex flex-col items-center justify-center
        ${isDragging.val ? 'shadow-2xl' : 'hover:shadow-xl hover:scale-105'}
        ${isDragging.val ? '' : 'transition-all duration-300'}
      `,
        style: () =>
          `transform: translate(${cardX.val}px, ${cardY.val}px) rotate(${cardRotation.val}deg); z-index: ${zIndex.val}; user-select: none;`,
        ...dragEvents,
      },
      div(
        {
          class: 'text-white text-xs font-bold mb-1',
        },
        '🃏'
      ),
      div(
        {
          class: 'text-white text-xs font-bold',
        },
        'JOKER'
      )
    )
  }

  return div(
    {
      class: () => `
      absolute w-16 h-24 bg-white 
      border-2 border-gray-300 rounded-lg shadow-lg cursor-pointer
      flex flex-col items-center justify-between p-1
      ${isDragging.val ? 'shadow-2xl' : 'hover:shadow-xl hover:scale-105'}
      ${isDragging.val ? '' : 'transition-all duration-300'}
    `,
      style: () =>
        `transform: translate(${cardX.val}px, ${cardY.val}px) rotate(${cardRotation.val}deg); z-index: ${zIndex.val}; user-select: none;`,
      ...dragEvents,
    },
    // Top rank and suit
    div(
      {
        class: `text-xs font-bold ${isRed ? 'text-red-600' : 'text-black'}`,
      },
      div(card.rank),
      div(getSuitSymbol(card.suit))
    ),
    // Center suit symbol
    div(
      {
        class: `text-lg ${isRed ? 'text-red-600' : 'text-black'}`,
      },
      getSuitSymbol(card.suit)
    ),
    // Bottom rank and suit (upside down)
    div(
      {
        class: `text-xs font-bold ${isRed ? 'text-red-600' : 'text-black'} transform rotate-180`,
      },
      div(card.rank),
      div(getSuitSymbol(card.suit))
    )
  )
}
