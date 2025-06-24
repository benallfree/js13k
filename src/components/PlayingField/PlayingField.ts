import { flex, itemsCenter, justifyCenter, minH20, overflowHidden, p5, relative } from '@/styles.module.css'
import { div, van } from '@van13k'
import { HUD } from '../HUD'
import { useNetManager } from '../NetManager/NetManager'
import { NetStatusHud } from '../NetManager/NetStatusHud'
import { RoomIdHud } from '../NetManager/RoomIdHud'
import { Car } from './Car'
import { KeyboardController } from './KeyboardController'
import { playingField } from './PlayingField.module.css'

export const PlayingField = () => {
  const nm = useNetManager()
  const { localPlayer, room } = nm

  // Initialize keyboard controller for local player
  const keyboardController = van.state<KeyboardController | null>(null)

  // Create keyboard controller when room is available
  if (room && !keyboardController.val) {
    const controller = new KeyboardController(room)
    controller.start()
    keyboardController.val = controller
  }

  return div(
    HUD({ items: [RoomIdHud(), NetStatusHud()] }),
    div(
      { class: `${flex} ${justifyCenter} ${itemsCenter} ${minH20} ${p5}` },
      div({ class: `${playingField} ${relative} ${overflowHidden}` }, Car({ player: localPlayer }))
    )
  )
}
