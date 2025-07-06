import { clickify, div } from '@van13k'
import type { Player } from '../../types'

export type PlayerScreenProps = {
  player: Player
  position: { x: number; y: number }
  onClose: () => void
}

export const PlayerScreen = ({ player, position, onClose }: PlayerScreenProps) => {
  // Default device dimensions if not provided
  const deviceWidth = player.deviceDimensions?.width || 375
  const deviceHeight = player.deviceDimensions?.height || 667

  // Scale factor to make the screen representation reasonable on table
  const scaleFactor = 0.5
  const screenWidth = deviceWidth * scaleFactor
  const screenHeight = deviceHeight * scaleFactor

  // Positioning logic - center on portal with padding for screen margins
  const padding = 20 // Padding from screen edges
  const portalRadius = 32 // Half the portal size (64px / 2)

  // Calculate ideal position centered on portal
  let centerX = position.x
  let centerY = position.y

  // Account for screen boundaries with padding
  const minX = padding + screenWidth / 2
  const maxX = window.innerWidth - padding - screenWidth / 2
  const minY = padding + screenHeight / 2
  const maxY = window.innerHeight - padding - screenHeight / 2

  // Clamp to screen boundaries
  centerX = Math.max(minX, Math.min(maxX, centerX))
  centerY = Math.max(minY, Math.min(maxY, centerY))

  // Final position (top-left corner of the device screen)
  const finalX = centerX - screenWidth / 2
  const finalY = centerY - screenHeight / 2

  return div(
    {
      class: 'absolute bg-black/80 border-2 border-white rounded-lg shadow-2xl z-[1002]',
      style: `
        width: ${screenWidth}px;
        height: ${screenHeight}px;
        transform: translate(${finalX}px, ${finalY}px);
      `,
    },
    // Screen content area
    div(
      {
        class: 'w-full h-full bg-gray-900 rounded-lg p-4 flex flex-col items-center justify-center relative',
      },
      // Player info
      div(
        {
          class: 'text-white text-center mb-2',
        },
        div({ class: 'text-lg font-bold' }, player.username || 'Player'),
        div({ class: 'text-sm text-gray-300' }, `${deviceWidth} × ${deviceHeight}`)
      ),
      // Device representation
      div(
        {
          class: 'text-gray-500 text-xs text-center',
        },
        'Device Screen View'
      ),
      // Close button
      div(
        {
          class:
            'absolute -top-2 -right-2 w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center cursor-pointer border-2 border-white shadow-lg transition-colors',
          ...clickify((e) => {
            e.stopPropagation()
            onClose()
          }),
        },
        div({ class: 'text-white font-bold text-lg' }, '×')
      )
    )
  )
}
