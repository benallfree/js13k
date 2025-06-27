import { Player } from '@/types'
import { Room } from '@van13k'

export interface MovementConfig {
  maxSpeed: number // 600 px/s (unified)
  acceleration: number // 1200 px/s²
  deceleration: number // 600 px/s²
  maxRotationSpeed: number // 6 rad/s
}

export interface MovementState {
  currentSpeed: number
  // collision debounce state if needed per input
}

export interface MovementDelta {
  deltaX: number
  deltaY: number
  deltaRotation: number
  newSpeed: number
}

export interface IInputDevice {
  getDelta(currentPlayer: Player, state: MovementState, config: MovementConfig, deltaTime: number): MovementDelta
}

export interface MovementControllerOptions {
  inputs: IInputDevice[]
  room: Room<Player>
  config?: Partial<MovementConfig>
}

export const MovementController = ({ inputs, room, config: configOverride }: MovementControllerOptions) => {
  let rafId: number | null = null
  let lastFrameTime = 0
  let movementState: MovementState = {
    currentSpeed: 0,
  }

  // Default config with overrides
  const config: MovementConfig = {
    maxSpeed: 400,
    acceleration: 1200,
    deceleration: 600,
    maxRotationSpeed: 6,
    ...configOverride,
  }

  console.log('MovementController initialized')
  // Collision debouncing per remote player
  const isCollisionAllowed = new Map<string, boolean>()
  const collisionSeparationDistance = 60 // One car length (30px) separation required

  const checkCollision = (player1: Player, player2: Player): boolean => {
    // Car dimensions
    const carHalfWidth = 7.5
    const carHalfHeight = 15

    // AABB collision detection
    const p1Left = player1.position.x - carHalfWidth
    const p1Right = player1.position.x + carHalfWidth
    const p1Top = player1.position.y - carHalfHeight
    const p1Bottom = player1.position.y + carHalfHeight

    const p2Left = player2.position.x - carHalfWidth
    const p2Right = player2.position.x + carHalfWidth
    const p2Top = player2.position.y - carHalfHeight
    const p2Bottom = player2.position.y + carHalfHeight

    return !(p1Right < p2Left || p1Left > p2Right || p1Bottom < p2Top || p1Top > p2Bottom)
  }

  const isMovingAwayFrom = (
    currentPos: { x: number; y: number },
    newPos: { x: number; y: number },
    otherPos: { x: number; y: number }
  ): boolean => {
    // Calculate distances to determine if moving away
    const currentDistance = Math.sqrt(Math.pow(currentPos.x - otherPos.x, 2) + Math.pow(currentPos.y - otherPos.y, 2))
    const newDistance = Math.sqrt(Math.pow(newPos.x - otherPos.x, 2) + Math.pow(newPos.y - otherPos.y, 2))
    return newDistance > currentDistance
  }

  const getCombinedDelta = (currentPlayer: Player, deltaTime: number): MovementDelta => {
    // Combine deltas from all input devices, prioritizing the one with highest activity
    let bestDelta: MovementDelta = { deltaX: 0, deltaY: 0, deltaRotation: 0, newSpeed: movementState.currentSpeed }
    let maxActivity = 0

    for (const input of inputs) {
      const delta = input.getDelta(currentPlayer, movementState, config, deltaTime)

      // Calculate activity from both movement and rotation
      const movementActivity = Math.sqrt(delta.deltaX * delta.deltaX + delta.deltaY * delta.deltaY)
      const rotationActivity = Math.abs(delta.deltaRotation) * 50 // Scale rotation to compete with movement
      const totalActivity = movementActivity + rotationActivity

      if (totalActivity > maxActivity) {
        maxActivity = totalActivity
        bestDelta = delta
      }
    }

    return bestDelta
  }

  const applyMovement = (currentTime: number) => {
    const localPlayer = room.getLocalPlayer()
    if (!localPlayer?.isLocal) return

    // Calculate delta time in seconds
    const deltaTime = lastFrameTime === 0 ? 0 : (currentTime - lastFrameTime) / 1000
    lastFrameTime = currentTime

    // Skip if delta time is too large (e.g., tab was inactive)
    if (deltaTime > 0.1) return

    const delta = getCombinedDelta(localPlayer, deltaTime)

    // Apply changes if any movement occurred
    if (delta.deltaX !== 0 || delta.deltaY !== 0 || delta.deltaRotation !== 0) {
      // Calculate new position
      const newX = localPlayer.position.x + delta.deltaX
      const newY = localPlayer.position.y + delta.deltaY

      // Constrain position to playing field bounds
      const fieldHalfWidth = 320
      const fieldHalfHeight = 320
      const carHalfWidth = 7.5
      const carHalfHeight = 15

      let constrainedX = Math.max(-fieldHalfWidth + carHalfWidth, Math.min(fieldHalfWidth - carHalfWidth, newX))
      let constrainedY = Math.max(-fieldHalfHeight + carHalfHeight, Math.min(fieldHalfHeight - carHalfHeight, newY))

      // Check for collisions with other players
      if (delta.deltaX !== 0 || delta.deltaY !== 0) {
        const testPlayer: Player = {
          ...localPlayer,
          position: { ...localPlayer.position, x: constrainedX, y: constrainedY },
        }

        const allPlayers = room.getAllPlayers()
        for (const otherPlayer of allPlayers) {
          if (otherPlayer.id !== localPlayer.id && otherPlayer.isConnected) {
            // Check if players are far enough to reset collision flag
            const distance = Math.sqrt(
              Math.pow(localPlayer.position.x - otherPlayer.position.x, 2) +
                Math.pow(localPlayer.position.y - otherPlayer.position.y, 2)
            )
            if (distance >= collisionSeparationDistance && !isCollisionAllowed.get(otherPlayer.id)) {
              isCollisionAllowed.set(otherPlayer.id, true)
              // console.log(`Reset: ${otherPlayer.id} @ ${distance}`)
            }

            if (checkCollision(testPlayer, otherPlayer)) {
              const currentPos = { x: localPlayer.position.x, y: localPlayer.position.y }
              const newPos = { x: constrainedX, y: constrainedY }
              const otherPos = { x: otherPlayer.position.x, y: otherPlayer.position.y }

              if (isMovingAwayFrom(currentPos, newPos, otherPos)) {
                // Moving away from collision - allow the movement
                break
              } else {
                // Check if collision is allowed for this player
                const collisionAllowed = isCollisionAllowed.get(otherPlayer.id) ?? true

                if (collisionAllowed) {
                  // Send collision mutation immediately - one per collision
                  room.mutateLocalPlayer((draft) => {
                    draft.collision = otherPlayer.id
                  })
                  // console.log(`Hit: ${otherPlayer.id} @ ${distance}`)
                  isCollisionAllowed.set(otherPlayer.id, false)
                }

                // Allow sliding - try movement in individual axes
                const testPlayerX: Player = {
                  ...localPlayer,
                  position: { ...localPlayer.position, x: constrainedX },
                }
                const testPlayerY: Player = {
                  ...localPlayer,
                  position: { ...localPlayer.position, y: constrainedY },
                }

                if (!checkCollision(testPlayerX, otherPlayer)) {
                  constrainedY = localPlayer.position.y
                } else if (!checkCollision(testPlayerY, otherPlayer)) {
                  constrainedX = localPlayer.position.x
                } else {
                  constrainedX = localPlayer.position.x
                  constrainedY = localPlayer.position.y
                }
                break
              }
            }
          }
        }
      }
      // console.log({ newX, newY, deltaX: delta.deltaX, deltaY: delta.deltaY, constrainedX, constrainedY })

      // Update movement state
      movementState.currentSpeed = delta.newSpeed

      room.mutateLocalPlayer((draft) => {
        draft.position.x = constrainedX
        draft.position.y = constrainedY
        draft.rotation.z = draft.rotation.z + delta.deltaRotation
      })
    }
  }

  const startRafLoop = () => {
    const loop = (currentTime: number) => {
      applyMovement(currentTime)
      rafId = requestAnimationFrame(loop)
    }
    rafId = requestAnimationFrame(loop)
  }

  const stop = () => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
    isCollisionAllowed.clear()
  }

  startRafLoop()

  return {
    stop,
  }
}
