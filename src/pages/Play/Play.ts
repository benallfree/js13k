import { CardPile, SandboxArea } from '@/components/CardPile/CardPile'
import { InfoOverlay } from '@/components/InfoOverlay'
import { useInfoPanel } from '@/hooks/useInfoPanel'
import type { Player } from '@/types'
import { clickify, div, Link, Modal } from '@van13k'
import * as vanX from 'vanjs-ext'
import { RoomEventType, vibescale } from 'vibescale/ts'
import { PlayerPortal } from './PlayerPortal'
import { PlayerScreen } from './PlayerScreen'
import { Share } from './Share'
import { generatePerimeterPosition } from './utils'

export type PlayProps = {
  game: string
  joinCode: string
}

export type SearchParams = {
  game: string
  joinCode: string
}

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

  // Track visible player screens
  const visiblePlayerScreens = vanX.reactive<Record<string, boolean>>({})

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

  room.on(RoomEventType.PlayerLeft, (e) => {
    const player = e.data
    console.log('player left', player)
    delete playerPortalPositions[player.id]
  })

  // Update local player to host
  room.on(RoomEventType.PlayerJoined, (e) => {
    const player = e.data
    if (!player.isLocal) {
      return
    }
    console.log('host joined', player)
    room.mutateLocalPlayer((player) => {
      player.playerType = 'host'
      player.username = 'Host'
    })
  })

  // Update info panel
  room.on(RoomEventType.PlayerUpdated, (e) => {
    panel.set(
      `players`,
      div({ class: 'text-sm' }, ...room.getAllPlayers().map((p) => div({ class: 'text-sm' }, p.username)))
    )
  })

  // Update player portal positions
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

  // Handle portal tap to show/hide player screen
  const handlePortalTap = (playerId: string) => {
    const isVisible = visiblePlayerScreens[playerId]
    if (isVisible) {
      delete visiblePlayerScreens[playerId]
    } else {
      visiblePlayerScreens[playerId] = true
    }
    console.log(`Toggled screen visibility for player ${playerId}:`, !isVisible)
  }

  // Handle closing a player screen
  const handlePlayerScreenClose = (playerId: string) => {
    delete visiblePlayerScreens[playerId]
    console.log(`Closed screen for player ${playerId}`)
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
    // Full screen parent container
    div(
      {
        class: 'relative min-h-screen overflow-hidden',
      },

      // Table/game area
      div(
        {
          class: 'absolute inset-0 bg-green-800',
          ...clickify((e) => {
            adminModal.open()
          }),
        },
        // Info overlay
        InfoOverlay(),
        // Cards (only for host)
        CardPile({ jokerCount: 2, sandbox, scatterPattern: 'random' })
      ),

      // Player portals (positioned relative to full screen)
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
                onTap: handlePortalTap,
              })
            })
            .filter(Boolean)
        )
      },

      // Player screens (positioned relative to full screen)
      () => {
        return div(
          ...Object.entries(visiblePlayerScreens)
            .map(([playerId, isVisible]) => {
              if (!isVisible) return null

              const player = room.getPlayer(playerId)
              const position = playerPortalPositions[playerId]

              if (!player || !position) return null

              return PlayerScreen({
                player,
                position,
                onClose: () => handlePlayerScreenClose(playerId),
              })
            })
            .filter(Boolean)
        )
      }
    ),

    adminModal()
  )
}
