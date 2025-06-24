import { bgGray200, border, borderGray400, px3, py2, roundedLg, textSm, textWhite } from '@/styles.module.css'
import { classify, div, service } from '@van13k'
import { HudItem } from '../HUD/HUD'
import { NetManagerService } from './NetManager'

export const PlayerPositionHud =
  (): HudItem =>
  ({ debug }) => {
    if (!debug) return div()
    return div(
      {
        ...classify(bgGray200, textWhite, px3, py2, roundedLg, textSm, border, borderGray400),
      },
      () => {
        const player = service<NetManagerService>('net').localPlayer.val
        if (!player) return 'Position: No player'
        const x = Math.round(player.position.x)
        const y = Math.round(player.position.y)
        const z = Math.round((player.rotation.z * 180) / Math.PI) // Convert radians to degrees
        return `Position: ${x},${y},${z}`
      }
    )
  }
