import { clickify, div, Link, Modal } from '@/van13k'
import * as vanX from 'vanjs-ext'
import { RoomEventType, vibescale } from 'vibescale/ts'
import { CardPile } from './CardPile'
import { InfoOverlay } from './InfoOverlay'
import { PlayerPortal } from './PlayerPortal'
import { Share } from './Share'
import type { Player, PlayProps, SandboxArea } from './types'
import { useInfoPanel } from './useInfoPanel'
import { generatePerimeterPosition } from './utils'

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

  // Track player portal positions (host only) - using vanX.reactive for object reactivity
  const playerPortalPositions = vanX.reactive<Record<string, { x: number; y: number }>>({})

  vanX.calc(() => {
    Object.entries(playerPortalPositions).forEach(([playerId, position]) => {
      console.log('playerPortalPositions', playerId, position.x, position.y)
    })
  })

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

  room.on(RoomEventType.PlayerJoined, (e) => {
    const player = e.data
    console.log('player joined', player)
    const allPlayers = room.getAllPlayers()
    const nonHostPlayers = allPlayers.filter((p) => p.playerType !== 'host')

    // Assign initial positions to new players
    nonHostPlayers.forEach((player, index) => {
      if (!playerPortalPositions[player.id]) {
        const position = generatePerimeterPosition(index, nonHostPlayers.length)
        playerPortalPositions[player.id] = position
        console.log(`Assigned portal position to ${player.username}:`, position)
      }
    })
  })

  // Handle portal position updates
  const handlePortalPositionChange = (playerId: string, x: number, y: number) => {
    playerPortalPositions[playerId] = { x, y }
    console.log(`Updated portal position for player ${playerId}:`, { x, y })
  }

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
      CardPile({ jokerCount: 2, sandbox, scatterPattern: 'random' }),

      // Player portals (only for non-host players)
      () => {
        return div(
          ...Object.entries(playerPortalPositions)
            .map(([playerId, position]) => {
              const player = room.getPlayer(playerId)
              if (!player) return null

              return PlayerPortal({
                player,
                initialPosition: position,
                onPositionChange: handlePortalPositionChange,
              })
            })
            .filter(Boolean)
        )
      }
    ),
    adminModal()
  )
}
