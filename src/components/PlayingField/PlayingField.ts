import {
  bottom8,
  fixed,
  left0,
  opacity80,
  p4,
  pointerAuto,
  relative,
  right0,
  right14,
  right8,
  top0,
  top55,
  zIndexHigh,
} from '@/styles.module.css'
import { classify, div, van } from '@van13k'
import { HUD } from '../HUD'
import { useNetManager } from '../NetManager/NetManager'
import { NetStatusHud } from '../NetManager/NetStatusHud'
import { PlayerPositionHud } from '../NetManager/PlayerPositionHud'
import { useSoundManager } from '../SoundManager/SoundManager'
import { Car } from './Car'
import { useJoystickInput } from './JoystickInput'
import { useKeyboardInput } from './KeyboardInput'
import { LeaderboardHudItem } from './LeaderboardHudItem'
import { MovementController } from './MovementController'
import { fieldContainer, parent, playingField } from './PlayingField.module.css'
import { usePointIndicators } from './PointIndicator'
import { RemoteCars } from './RemoteCars'
import { ScoreDisplay } from './ScoreDisplay'

export const PlayingField = () => {
  const nm = useNetManager()
  const { localPlayer, room } = nm

  // Create point indicators
  const pointIndicators = usePointIndicators()

  // Create input devices
  const keyboardInput = useKeyboardInput()
  const joystickInput = useJoystickInput()

  // Create movement controller with both input devices
  const controller = MovementController({
    inputs: [keyboardInput, joystickInput],
    room,
    onCollision: (result, x: number, y: number) => {
      // Convert from field coordinates to screen coordinates
      // Field coordinates are centered at (0,0), but DOM is top-left origin
      const screenX = x + 320 // 320 is half field width
      const screenY = y + 320 // 320 is half field height
      pointIndicators.addIndicator(result, screenX, screenY)
    },
  })

  const FIELD_SIZE = 640
  const scale = van.state(1)

  const fieldContainerElem = div(
    { ...classify(fieldContainer) },
    div(
      {
        ...classify(playingField),
        style: () => `transform: scale(${scale.val});`,
      },
      Car({ player: localPlayer }),
      RemoteCars(),
      pointIndicators.component()
    )
  )

  const updateScale = () => {
    if (!fieldContainerElem.clientWidth || !fieldContainerElem.clientHeight) return

    // console.log(fieldContainerElem)
    // console.log('resize', fieldContainerElem.clientWidth, fieldContainerElem.clientHeight)

    const availableWidth = fieldContainerElem.clientWidth
    const availableHeight = fieldContainerElem.clientHeight
    const fieldSize = Math.min(availableWidth, availableHeight)
    scale.val = Math.min(fieldSize / FIELD_SIZE, 1)

    // console.log({
    //   availableWidth,
    //   availableHeight,
    //   scale: scale.val,
    //   fieldSize,
    // })
  }

  window.addEventListener('resize', updateScale)
  setTimeout(updateScale, 0)

  const SoundManager = useSoundManager()

  return div(
    { ...classify(relative) },
    div(
      { ...classify(fixed, top0, left0, p4, zIndexHigh, pointerAuto, opacity80) },
      HUD({
        items: [LeaderboardHudItem(), NetStatusHud(), PlayerPositionHud()],
      })
    ),
    div({ ...classify(fixed, top0, right0, p4, zIndexHigh, pointerAuto) }, SoundManager.getComponent()),
    div({ ...classify(fixed, top55, right14, zIndexHigh, pointerAuto) }, ScoreDisplay()),

    div({ ...classify(parent) }, fieldContainerElem),
    div({ ...classify(fixed, bottom8, right8) }, joystickInput.getComponent())
  )
}
