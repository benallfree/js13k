import { classify, div, van } from '@van13k'
import { HUD } from '../HUD'
import { useNetManager } from '../NetManager/NetManager'
import { NetStatusHud } from '../NetManager/NetStatusHud'
import { PlayerPositionHud } from '../NetManager/PlayerPositionHud'
import { RoomIdHud } from '../NetManager/RoomIdHud'
import { Car } from './Car'
import { KeyboardController } from './KeyboardController'
import { fieldContainer, parent, playingField } from './PlayingField.module.css'
import { RemoteCars } from './RemoteCars'

export const PlayingField = () => {
  const nm = useNetManager()
  const { localPlayer, room } = nm

  // Create keyboard controller when room is available
  const controller = new KeyboardController(room)
  controller.start()

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
      RemoteCars()
    )
  )

  const updateScale = () => {
    if (!fieldContainerElem.clientWidth || !fieldContainerElem.clientHeight) return

    console.log(fieldContainerElem)
    console.log('resize', fieldContainerElem.clientWidth, fieldContainerElem.clientHeight)

    const availableWidth = fieldContainerElem.clientWidth
    const availableHeight = fieldContainerElem.clientHeight
    const fieldSize = Math.min(availableWidth, availableHeight)
    scale.val = Math.min(fieldSize / FIELD_SIZE, 1)

    console.log({
      availableWidth,
      availableHeight,
      scale: scale.val,
      fieldSize,
    })
  }

  window.addEventListener('resize', updateScale)
  setTimeout(updateScale, 0)

  return div(
    HUD({ items: [RoomIdHud(), NetStatusHud(), PlayerPositionHud()] }),
    div({ ...classify(parent) }, fieldContainerElem)
  )
}
