import { Player } from '@/types'
import { Room } from '@van13k'

export interface MovementControllerOptions {
  inputs: IInputDevice[]
  room: Room<Player>
}

export interface InputState {
  force: number // 0-1, where 0 is no input and 1 is maximum
  radians: number // direction in radians, 0 = North, π/2 = East, π = South, 3π/2 = West
}

export interface IInputDevice {
  getInput: () => InputState
}

export const MovementController = ({ inputs, room }: MovementControllerOptions) => {
  let rafId: number | null = null
  let lastFrameTime = 0
  let currentSpeed = 0
  const maxSpeed = 300
  const acceleration = 600
  const deceleration = 300

  const getCombinedInput = () => {
    // Combine inputs from all controllers, prioritizing the one with highest force
    let maxForce = 0
    let bestInput = { force: 0, radians: 0 }

    for (const input of inputs) {
      const inputState = input.getInput()
      if (inputState.force > maxForce) {
        maxForce = inputState.force
        bestInput = inputState
      }
    }

    return bestInput
  }

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

  const applyMovement = (currentTime: number) => {
    const localPlayer = room.getLocalPlayer()
    if (!localPlayer?.isLocal) return

    // Calculate delta time in seconds
    const deltaTime = lastFrameTime === 0 ? 0 : (currentTime - lastFrameTime) / 1000
    lastFrameTime = currentTime

    // Skip if delta time is too large (e.g., tab was inactive)
    if (deltaTime > 0.1) return

    const combinedInput = getCombinedInput()

    let deltaX = 0
    let deltaY = 0
    let deltaRotation = 0

    // Handle speed buildup/decay based on input force
    if (combinedInput.force > 0) {
      // Build up speed based on input force
      const targetSpeed = maxSpeed * combinedInput.force
      if (currentSpeed < targetSpeed) {
        currentSpeed = Math.min(targetSpeed, currentSpeed + acceleration * deltaTime)
      } else if (currentSpeed > targetSpeed) {
        currentSpeed = Math.max(targetSpeed, currentSpeed - deceleration * deltaTime)
      }
    } else {
      // Decay speed toward zero
      if (currentSpeed > 0) {
        currentSpeed = Math.max(0, currentSpeed - deceleration * deltaTime)
      } else if (currentSpeed < 0) {
        currentSpeed = Math.min(0, currentSpeed + deceleration * deltaTime)
      }
    }

    // Apply movement based on current speed and input direction
    if (currentSpeed !== 0 && combinedInput.force > 0) {
      deltaX += Math.sin(combinedInput.radians) * currentSpeed * deltaTime
      deltaY += -Math.cos(combinedInput.radians) * currentSpeed * deltaTime

      // Apply rotation to face the movement direction
      const targetRotation = combinedInput.radians
      const currentRotation = localPlayer.rotation.z

      // Calculate shortest rotation path (handle wrapping around 2π)
      let rotationDiff = targetRotation - currentRotation
      while (rotationDiff > Math.PI) rotationDiff -= 2 * Math.PI
      while (rotationDiff < -Math.PI) rotationDiff += 2 * Math.PI

      // Apply rotation smoothly
      const rotationSpeed = 6 // radians per second
      if (Math.abs(rotationDiff) > 0.1) {
        const maxRotation = rotationSpeed * deltaTime
        deltaRotation = Math.sign(rotationDiff) * Math.min(Math.abs(rotationDiff), maxRotation)
      }
    }

    // Apply changes if any movement occurred
    if (deltaX !== 0 || deltaY !== 0 || deltaRotation !== 0) {
      // Calculate new position
      const newX = localPlayer.position.x + deltaX
      const newY = localPlayer.position.y + deltaY

      // Constrain position to playing field bounds
      const fieldHalfWidth = 320
      const fieldHalfHeight = 320
      const carHalfWidth = 7.5
      const carHalfHeight = 15

      let constrainedX = Math.max(-fieldHalfWidth + carHalfWidth, Math.min(fieldHalfWidth - carHalfWidth, newX))
      let constrainedY = Math.max(-fieldHalfHeight + carHalfHeight, Math.min(fieldHalfHeight - carHalfHeight, newY))

      // Check for collisions with other players
      let collisionPlayerId: string | undefined = undefined

      if (deltaX !== 0 || deltaY !== 0) {
        const testPlayer: Player = {
          ...localPlayer,
          position: { ...localPlayer.position, x: constrainedX, y: constrainedY },
        }

        const allPlayers = room.getAllPlayers()
        for (const otherPlayer of allPlayers) {
          if (otherPlayer.id !== localPlayer.id && otherPlayer.isConnected) {
            if (checkCollision(testPlayer, otherPlayer)) {
              const currentPos = { x: localPlayer.position.x, y: localPlayer.position.y }
              const newPos = { x: constrainedX, y: constrainedY }
              const otherPos = { x: otherPlayer.position.x, y: otherPlayer.position.y }

              if (isMovingAwayFrom(currentPos, newPos, otherPos)) {
                break // Allow movement
              } else {
                collisionPlayerId = otherPlayer.id

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

      room.mutatePlayer((draft) => {
        draft.position.x = constrainedX
        draft.position.y = constrainedY
        draft.rotation.z = draft.rotation.z + deltaRotation
        draft.collision = collisionPlayerId
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

  startRafLoop()
}
