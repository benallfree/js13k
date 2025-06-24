import { bgGray200, border, borderGray400, px3, py2, roundedLg, textSm, textWhite } from '@/styles.module.css'
import { classify, div, Room, service } from '@van13k'
import { HudItem } from './HUD'

export const RoomId =
  (): HudItem =>
  ({ debug }) => {
    if (!debug) return div()
    return div(
      {
        ...classify(bgGray200, textWhite, px3, py2, roundedLg, textSm, border, borderGray400),
      },
      `Room: ${service<Room>('room').getRoomId()}`
    )
  }
