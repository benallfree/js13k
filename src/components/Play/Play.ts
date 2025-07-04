import { clickify, div, Link, Modal } from '@/van13k'
import { RoomEventType, vibescale } from 'vibescale/ts'
import { CardPile } from './CardPile'
import { InfoOverlay } from './InfoOverlay'
import { Share } from './Share'
import type { Player, PlayProps, SandboxArea } from './types'
import { useInfoPanel } from './useInfoPanel'

export const Play = ({ game, joinCode }: PlayProps) => {
  const adminModal = Modal({
    title: 'Host Admin',
    content: () => {
      return div(Link({ href: '/' }, `Home`), Share(joinCode))
    },
  })

  const endpoint = import.meta.env.DEV ? `${window.location.protocol}//${window.location.hostname}:8787` : undefined
  const room = vibescale<Player>(`fabletop-${joinCode}`, {
    endpoint,
  })
  const panel = useInfoPanel()
  panel.set('game', div({ class: 'text-lg font-bold' }, game))
  panel.set('endpoint', div({ class: 'text-sm' }, endpoint || 'default'))
  panel.set('joinCode', div({ class: 'text-sm' }, `Join Code: ${joinCode}`))
  panel.set(
    'role',
    div({ class: 'text-sm' }, () => `Role: Host`)
  )

  room.connect()

  room.on(RoomEventType.Rx, (e) => {
    console.log('rx', e.data)
  })

  room.on(RoomEventType.Tx, (e) => {
    console.log('tx', e.data)
  })

  room.on(RoomEventType.Connected, () => {
    console.log('connected')
  })

  room.on(RoomEventType.LocalPlayerJoined, (e) => {
    const player = e.data
    console.log('host joined', player)
    room.mutateLocalPlayer((player) => {
      player.playerType = 'host'
      player.username = 'Host'
    })
  })

  room.on(RoomEventType.PlayerUpdated, (e) => {
    panel.set(
      `players`,
      div({ class: 'text-sm' }, ...room.getAllPlayers().map((p) => div({ class: 'text-sm' }, p.username)))
    )
  })

  // Set up info panel items

  // Define sandbox area for cards (center area of screen)
  const centerX = window.innerWidth / 2
  const centerY = window.innerHeight / 2
  const padding = 100
  const squareSize = Math.min(window.innerWidth, window.innerHeight) - padding * 2
  const halfSize = squareSize / 2

  const sandbox: SandboxArea = {
    x1: centerX - halfSize,
    y1: centerY - halfSize,
    x2: centerX + halfSize,
    y2: centerY + halfSize,
  }

  return div(
    div(
      {
        class: 'relative min-h-screen bg-green-800 overflow-hidden',
        ...clickify((e) => {
          adminModal.open()
        }),
      },

      // Info overlay
      InfoOverlay(),

      // Cards (only for host)
      CardPile({ jokerCount: 2, sandbox, scatterPattern: 'random' })
    ),
    adminModal()
  )
}
