import { InputState } from './MovementController'

export const KeyboardInput = (getCurrentRotation: () => number = () => 0) => {
  let pressedKeys = new Set<string>()
  let currentInput: InputState = { force: 0, radians: 0 }

  const isValidKey = (key: string): boolean => {
    return ['w', 's', 'a', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)
  }

  const updateInput = () => {
    let force = 0
    let relativeRadians = 0

    // Check for key combinations to determine direction
    const up = pressedKeys.has('w') || pressedKeys.has('arrowup')
    const down = pressedKeys.has('s') || pressedKeys.has('arrowdown')
    const left = pressedKeys.has('a') || pressedKeys.has('arrowleft')
    const right = pressedKeys.has('d') || pressedKeys.has('arrowright')

    // Calculate input relative to car's forward direction
    // Force is only applied for forward/backward movement
    if (up && right) {
      // Forward-right: 45 degrees relative to car
      force = 1
      relativeRadians = Math.PI / 4
    } else if (up && left) {
      // Forward-left: -45 degrees relative to car
      force = 1
      relativeRadians = -Math.PI / 4
    } else if (down && right) {
      // Backward-right: 135 degrees relative to car
      force = 1
      relativeRadians = (3 * Math.PI) / 4
    } else if (down && left) {
      // Backward-left: -135 degrees relative to car
      force = 1
      relativeRadians = -(3 * Math.PI) / 4
    } else if (up) {
      // Forward: 0 degrees relative to car
      force = 1
      relativeRadians = 0
    } else if (down) {
      // Backward: 180 degrees relative to car
      force = 1
      relativeRadians = Math.PI
    } else if (left) {
      // Left steering only: no force, just rotation
      force = 0
      relativeRadians = -Math.PI / 2
    } else if (right) {
      // Right steering only: no force, just rotation
      force = 0
      relativeRadians = Math.PI / 2
    }

    // Convert relative radians to world radians by adding current car rotation
    const currentCarRotation = getCurrentRotation()
    const worldRadians = currentCarRotation + relativeRadians

    currentInput = { force, radians: worldRadians }
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    const key = event.key.toLowerCase()
    if (isValidKey(key)) {
      pressedKeys.add(key)
      updateInput()
    }
  }

  const handleKeyUp = (event: KeyboardEvent) => {
    const key = event.key.toLowerCase()
    pressedKeys.delete(key)
    updateInput()
  }

  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('keyup', handleKeyUp)

  return {
    getInput: () => currentInput,
  }
}
