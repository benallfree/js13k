import { div, RoomEventType, vibescale } from '@van13k'
import { InfoOverlay, useInfoPanel } from '../Play'
import { Player } from '../Play/types'

export type JoinParams = {
  joinCode: string
}

export const Join = (params: JoinParams) => {
  const { joinCode } = params

  const endpoint = import.meta.env.DEV ? `${window.location.protocol}//${window.location.hostname}:8787` : undefined
  const room = vibescale<Player>(`fabletop-${joinCode}`, {
    endpoint,
  })
  const panel = useInfoPanel()
  panel.set('endpoint', div({ class: 'text-sm' }, endpoint || 'default'))
  panel.set('joinCode', div({ class: 'text-sm' }, `Join Code: ${joinCode}`))

  room.connect()

  room.on(RoomEventType.Connected, () => {
    panel.set(
      'role',
      div({ class: 'text-sm' }, () => `Role: Player`)
    )
    console.log('connected')
  })

  room.on(RoomEventType.PlayerUpdated, (e) => {
    const player = e.data
    console.log('player joined', player)
    room.mutateLocalPlayer((player) => {
      player.playerType = 'player'
    })
    panel.set(
      `connection-status`,
      div({ class: 'text-sm' }, () => `Connected to room`)
    )
    panel.set(
      `players`,
      div({ class: 'text-sm' }, ...room.getAllPlayers().map((p) => div({ class: 'text-sm' }, p.username)))
    )
  })

  return div(InfoOverlay(), div({ class: 'flex flex-col items-center justify-center h-screen' }, 'Join'))
}
