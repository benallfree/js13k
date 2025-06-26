import { Player } from '@/types'
import { Room } from '@van13k'

export class KeyboardController {
  private room: Room<Player>
  private isListening = false
  private rafId: number | null = null
  private pressedKeys = new Set<string>()
  private lastFrameTime = 0
  private currentSpeed = 0 // Current forward/backward speed
  private readonly maxSpeed = 600 // Maximum speed in pixels per second
  private readonly acceleration = 1200 // Speed buildup rate in pixels per second squared
  private readonly deceleration = 600 // Speed decay rate in pixels per second squared
  private readonly rotationSpeed = 6 // radians per second

  constructor(room: Room<Player>) {
    this.room = room
  }

  start() {
    if (this.isListening) return
    this.isListening = true

    window.addEventListener('keydown', this.handleKeyDown.bind(this))
    window.addEventListener('keyup', this.handleKeyUp.bind(this))

    this.startRafLoop()
  }

  stop() {
    if (!this.isListening) return
    this.isListening = false

    window.removeEventListener('keydown', this.handleKeyDown.bind(this))
    window.removeEventListener('keyup', this.handleKeyUp.bind(this))

    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }

    this.pressedKeys.clear()
    this.currentSpeed = 0 // Reset speed when stopping
  }

  private handleKeyDown(event: KeyboardEvent) {
    const key = event.key.toLowerCase()
    if (this.isValidKey(key)) {
      this.pressedKeys.add(key)
    }
  }

  private handleKeyUp(event: KeyboardEvent) {
    const key = event.key.toLowerCase()
    this.pressedKeys.delete(key)
  }

  private isValidKey(key: string): boolean {
    return ['w', 's', 'a', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)
  }

  private startRafLoop() {
    const loop = (currentTime: number) => {
      if (!this.isListening) return

      this.applyMovement(currentTime)
      this.rafId = requestAnimationFrame(loop)
    }

    this.rafId = requestAnimationFrame(loop)
  }

  private checkCollision(player1: Player, player2: Player): boolean {
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

  private isMovingAwayFrom(
    currentPos: { x: number; y: number },
    newPos: { x: number; y: number },
    otherPos: { x: number; y: number }
  ): boolean {
    // Calculate distances to determine if moving away
    const currentDistance = Math.sqrt(Math.pow(currentPos.x - otherPos.x, 2) + Math.pow(currentPos.y - otherPos.y, 2))
    const newDistance = Math.sqrt(Math.pow(newPos.x - otherPos.x, 2) + Math.pow(newPos.y - otherPos.y, 2))
    return newDistance > currentDistance
  }

  private applyMovement(currentTime: number) {
    const localPlayer = this.room.getLocalPlayer()
    if (!localPlayer?.isLocal) return

    // Calculate delta time in seconds
    const deltaTime = this.lastFrameTime === 0 ? 0 : (currentTime - this.lastFrameTime) / 1000
    this.lastFrameTime = currentTime
    // console.log('deltaTime', deltaTime)

    // Skip if delta time is too large (e.g., tab was inactive)
    if (deltaTime > 0.1) return

    let deltaX = 0
    let deltaY = 0
    let deltaRotation = 0

    // Handle speed buildup/decay
    const isAccelerating = this.pressedKeys.has('w') || this.pressedKeys.has('arrowup')
    const isReversing = this.pressedKeys.has('s') || this.pressedKeys.has('arrowdown')

    if (isAccelerating) {
      // Build up forward speed
      this.currentSpeed = Math.min(this.maxSpeed, this.currentSpeed + this.acceleration * deltaTime)
    } else if (isReversing) {
      // Build up reverse speed (negative)
      this.currentSpeed = Math.max(-this.maxSpeed, this.currentSpeed - this.acceleration * deltaTime)
    } else {
      // Decay speed toward zero
      if (this.currentSpeed > 0) {
        this.currentSpeed = Math.max(0, this.currentSpeed - this.deceleration * deltaTime)
      } else if (this.currentSpeed < 0) {
        this.currentSpeed = Math.min(0, this.currentSpeed + this.deceleration * deltaTime)
      }
    }

    // Apply movement based on current speed
    if (this.currentSpeed !== 0) {
      deltaX += Math.sin(localPlayer.rotation.z) * this.currentSpeed * deltaTime
      deltaY += -Math.cos(localPlayer.rotation.z) * this.currentSpeed * deltaTime
    }

    // Only turn when speed is significant
    if (this.pressedKeys.has('a') || this.pressedKeys.has('arrowleft')) {
      deltaRotation -= this.rotationSpeed * deltaTime
    }

    if (this.pressedKeys.has('d') || this.pressedKeys.has('arrowright')) {
      deltaRotation += this.rotationSpeed * deltaTime
    }

    // console.log('applyMovement', JSON.stringify({ deltaX, deltaY, deltaRotation, currentSpeed: this.currentSpeed }))
    // Apply changes if any movement occurred
    if (deltaX !== 0 || deltaY !== 0 || deltaRotation !== 0) {
      // Calculate new position
      const newX = localPlayer.position.x + deltaX
      const newY = localPlayer.position.y + deltaY

      // Constrain position to playing field bounds
      // Playing field is 640x640, so coordinates range from -320 to +320
      // Car is 15px wide and 30px tall, so we need half-width/height margins
      const fieldHalfWidth = 320
      const fieldHalfHeight = 320
      const carHalfWidth = 7.5
      const carHalfHeight = 15

      let constrainedX = Math.max(-fieldHalfWidth + carHalfWidth, Math.min(fieldHalfWidth - carHalfWidth, newX))
      let constrainedY = Math.max(-fieldHalfHeight + carHalfHeight, Math.min(fieldHalfHeight - carHalfHeight, newY))

      // Check for collisions with other players (only for position changes, not rotation)
      let collisionPlayerId: string | undefined = undefined

      if (deltaX !== 0 || deltaY !== 0) {
        // Only check collision if there's position movement
        const testPlayer: Player = {
          ...localPlayer,
          position: { ...localPlayer.position, x: constrainedX, y: constrainedY },
        }

        // Get all other players and check for collisions
        const allPlayers = this.room.getAllPlayers()
        for (const otherPlayer of allPlayers) {
          if (otherPlayer.id !== localPlayer.id && otherPlayer.isConnected) {
            if (this.checkCollision(testPlayer, otherPlayer)) {
              // Check if we're moving away from the collision
              const currentPos = { x: localPlayer.position.x, y: localPlayer.position.y }
              const newPos = { x: constrainedX, y: constrainedY }
              const otherPos = { x: otherPlayer.position.x, y: otherPlayer.position.y }

              if (this.isMovingAwayFrom(currentPos, newPos, otherPos)) {
                // Moving away from collision - allow the movement
                break // Don't set collision, allow movement
              } else {
                // Moving towards or maintaining collision - handle it
                collisionPlayerId = otherPlayer.id
                console.log(`Player ${localPlayer.id} hit player ${otherPlayer.id}`)

                // Allow sliding - try movement in individual axes
                const testPlayerX: Player = {
                  ...localPlayer,
                  position: { ...localPlayer.position, x: constrainedX },
                }
                const testPlayerY: Player = {
                  ...localPlayer,
                  position: { ...localPlayer.position, y: constrainedY },
                }

                // If X movement alone doesn't cause collision, allow it
                if (!this.checkCollision(testPlayerX, otherPlayer)) {
                  constrainedY = localPlayer.position.y // Reset Y to original
                }
                // If Y movement alone doesn't cause collision, allow it
                else if (!this.checkCollision(testPlayerY, otherPlayer)) {
                  constrainedX = localPlayer.position.x // Reset X to original
                }
                // If both cause collision, don't move at all
                else {
                  constrainedX = localPlayer.position.x
                  constrainedY = localPlayer.position.y
                }
                break // Only handle first collision
              }
            }
          }
        }
      }

      this.room.mutatePlayer((draft) => {
        draft.position.x = constrainedX
        draft.position.y = constrainedY
        draft.rotation.z = draft.rotation.z + deltaRotation
        draft.collision = collisionPlayerId
      })
    }
  }
}
