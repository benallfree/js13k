import { van } from '@van13k'
import { useNetManager } from '../NetManager/NetManager'
import { Car } from './Car'

export const RemoteCars = () => {
  const nm = useNetManager()
  const { otherPlayers, otherPlayerIds } = nm

  const container = van.tags.div()

  // Keep track of rendered cars to avoid duplicates
  const renderedCars = new Map<string, HTMLElement>()

  // Watch for changes in otherPlayerIds and update the container
  van.derive(() => {
    const currentPlayerIds = new Set(otherPlayerIds.val)
    const renderedIds = new Set(renderedCars.keys())

    // Remove cars for players who left
    for (const playerId of renderedIds) {
      if (!currentPlayerIds.has(playerId)) {
        const carElement = renderedCars.get(playerId)
        if (carElement && container.contains(carElement)) {
          container.removeChild(carElement)
        }
        renderedCars.delete(playerId)
      }
    }

    // Add cars for new players
    for (const playerId of currentPlayerIds) {
      if (!renderedIds.has(playerId)) {
        const playerState = otherPlayers.get(playerId)
        if (playerState) {
          const carElement = Car({ player: playerState })
          container.appendChild(carElement)
          renderedCars.set(playerId, carElement)
        }
      }
    }
  })

  return container
}
