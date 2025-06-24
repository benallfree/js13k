import { Player } from '@/types'
import { Room } from '@van13k'

export class KeyboardController {
  private room: Room<Player>
  private isListening = false

  constructor(room: Room<Player>) {
    this.room = room
  }

  start() {
    if (this.isListening) return
    this.isListening = true
    window.addEventListener('keydown', this.handleKeyDown.bind(this))
  }

  stop() {
    if (!this.isListening) return
    this.isListening = false
    window.removeEventListener('keydown', this.handleKeyDown.bind(this))
  }

  private handleKeyDown(event: KeyboardEvent) {
    const localPlayer = this.room.getLocalPlayer()
    if (!localPlayer?.isLocal) return

    const speed = 5
    const rotationSpeed = 0.1 // rotation speed in radians

    switch (event.key.toLowerCase()) {
      case 'w':
      case 'arrowup':
        // Move forward in the direction the car is facing
        this.room.mutatePlayer((oldState) => {
          const forwardX = Math.sin(oldState.rotation.z) * speed
          const forwardY = -Math.cos(oldState.rotation.z) * speed // negative because Y increases downward
          return {
            ...oldState,
            position: {
              ...oldState.position,
              x: oldState.position.x + forwardX,
              y: oldState.position.y + forwardY,
            },
          }
        })
        break
      case 's':
      case 'arrowdown':
        // Move backward (opposite direction)
        this.room.mutatePlayer((oldState) => {
          const backwardX = -Math.sin(oldState.rotation.z) * speed
          const backwardY = Math.cos(oldState.rotation.z) * speed
          return {
            ...oldState,
            position: {
              ...oldState.position,
              x: oldState.position.x + backwardX,
              y: oldState.position.y + backwardY,
            },
          }
        })
        break
      case 'a':
      case 'arrowleft':
        // Turn left (counterclockwise, decrease rotation.z)
        this.room.mutatePlayer((oldState) => ({
          ...oldState,
          rotation: {
            ...oldState.rotation,
            z: oldState.rotation.z - rotationSpeed,
          },
        }))
        break
      case 'd':
      case 'arrowright':
        // Turn right (clockwise, increase rotation.z)
        this.room.mutatePlayer((oldState) => ({
          ...oldState,
          rotation: {
            ...oldState.rotation,
            z: oldState.rotation.z + rotationSpeed,
          },
        }))
        break
    }
  }
}
