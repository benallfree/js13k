import { bgGray200, border, borderGray400, px3, py2, roundedLg, textSm, textWhite } from '@/styles.module.css'
import { classify, div, service } from '@van13k'
import { HudItem } from '../HUD/HUD'
import { NetManagerService } from './NetManager'

export const NetStatusHud =
  (): HudItem =>
  ({ debug }) => {
    if (!debug) return div()
    return div(
      {
        ...classify(bgGray200, textWhite, px3, py2, roundedLg, textSm, border, borderGray400),
      },
      () =>
        `${service<NetManagerService>('net').isConnected.val ? '🟢 ' : '🔴 '} ${service<NetManagerService>('net').room.getRoomId()}`
    )
  }
