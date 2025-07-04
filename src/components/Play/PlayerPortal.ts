import { div, van } from '@/van13k'
import { gesture, type DragState } from '@/van13k/util/gesture'
import type { Player } from './types'

export type PlayerPortalProps = {
  player: Player
  initialPosition: { x: number; y: number }
  onPositionChange: (playerId: string, x: number, y: number) => void
  onTap?: (playerId: string) => void
}

export const PlayerPortal = ({ player, initialPosition, onPositionChange, onTap }: PlayerPortalProps) => {
  // State for portal position
  const portalX = van.state(initialPosition.x)
  const portalY = van.state(initialPosition.y)
  const isDragging = van.state(false)
  const zIndex = van.state(1000) // Higher than cards

  // Store original z-index for restoration
  let originalZIndex = 1000

  // Track the offset from card position to initial touch point
  let touchOffsetX = 0
  let touchOffsetY = 0

  // Gesture handlers
  const handleTap = () => {
    if (onTap) {
      console.log(`Tapped portal for player: ${player.username}`)
      onTap(player.id)
    }
  }

  const handleLongPress = () => {
    console.log(`Long pressed portal for player: ${player.username}`)
    // Boost z-index immediately on long press for visual feedback
    originalZIndex = zIndex.val
    zIndex.val = 10000
  }

  const handleDragStart = (dragState: DragState) => {
    console.log(`Started dragging portal for player: ${player.username}`)
    isDragging.val = true

    // If we haven't already boosted z-index via long press, do it now
    if (zIndex.val < 10000) {
      originalZIndex = zIndex.val
      zIndex.val = 10000
    }

    // Calculate offset from portal's RENDERED position to touch point
    // The portal is rendered at (portalX.val - 32, portalY.val - 32) due to the transform
    touchOffsetX = dragState.startX - (portalX.val - 32)
    touchOffsetY = dragState.startY - (portalY.val - 32)
  }

  const handleDragMove = (dragState: DragState) => {
    // Position portal so the original touch point stays under the finger
    // We add 32 back because portalX/Y represent the center coordinates
    portalX.val = dragState.currentX - touchOffsetX + 32
    portalY.val = dragState.currentY - touchOffsetY + 32
  }

  const handleDragEnd = () => {
    console.log(`Finished dragging portal for player: ${player.username} to position (${portalX.val}, ${portalY.val})`)
    isDragging.val = false

    // Restore original z-index (from before long press/drag)
    zIndex.val = originalZIndex

    // Notify parent of position change
    onPositionChange(player.id, portalX.val, portalY.val)
  }

  const gestureEvents = gesture({
    onTap: handleTap,
    onLongPress: handleLongPress,
    onDragStart: handleDragStart,
    onDragMove: handleDragMove,
    onDragEnd: handleDragEnd,
  })

  return div(
    {
      class: () => `
        absolute w-16 h-16 rounded-full cursor-pointer
        flex items-center justify-center
        bg-gradient-to-br from-blue-400 to-blue-600
        border-4 border-white
        shadow-lg hover:shadow-xl
        ${isDragging.val ? 'shadow-2xl' : 'hover:scale-105'}
        ${isDragging.val ? '' : 'transition-all duration-300'}
        ${isDragging.val ? '' : 'animate-pulse'}
      `,
      style: () => `
        transform: translate(${portalX.val - 32}px, ${portalY.val - 32}px); 
        z-index: ${zIndex.val}; 
        user-select: none;
      `,
      ...gestureEvents,
    },
    // Player name display
    div(
      {
        class: 'text-white text-xs font-bold text-center px-1 truncate max-w-full',
      },
      player.username || 'Player'
    ),
    // Portal indicator dot
    div({
      class: 'absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-ping',
    })
  )
}
