import { Player } from '@/types'
import { Room } from '@van13k'

export class KeyboardController {
  private room: Room<Player>
  private isListening = false
  private rafId: number | null = null
  private pressedKeys = new Set<string>()

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
    const loop = () => {
      if (!this.isListening) return

      this.applyMovement()
      this.rafId = requestAnimationFrame(loop)
    }

    this.rafId = requestAnimationFrame(loop)
  }

  private applyMovement() {
    const localPlayer = this.room.getLocalPlayer()
    if (!localPlayer?.isLocal || this.pressedKeys.size === 0) return

    const speed = 5
    const rotationSpeed = 0.1 // rotation speed in radians

    let deltaX = 0
    let deltaY = 0
    let deltaRotation = 0

    // Handle movement keys
    if (this.pressedKeys.has('w') || this.pressedKeys.has('arrowup')) {
      deltaX += Math.sin(localPlayer.rotation.z) * speed
      deltaY += -Math.cos(localPlayer.rotation.z) * speed
    }

    if (this.pressedKeys.has('s') || this.pressedKeys.has('arrowdown')) {
      deltaX += -Math.sin(localPlayer.rotation.z) * speed
      deltaY += Math.cos(localPlayer.rotation.z) * speed
    }

    // Handle rotation keys
    if (this.pressedKeys.has('a') || this.pressedKeys.has('arrowleft')) {
      deltaRotation -= rotationSpeed
    }

    if (this.pressedKeys.has('d') || this.pressedKeys.has('arrowright')) {
      deltaRotation += rotationSpeed
    }

    // Apply changes if any movement occurred
    if (deltaX !== 0 || deltaY !== 0 || deltaRotation !== 0) {
      this.room.mutatePlayer((oldState) => ({
        ...oldState,
        position: {
          ...oldState.position,
          x: oldState.position.x + deltaX,
          y: oldState.position.y + deltaY,
        },
        rotation: {
          ...oldState.rotation,
          z: oldState.rotation.z + deltaRotation,
        },
      }))
    }
  }
}
