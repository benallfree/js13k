import { Player } from '@/types'
import {
  createCoordinateConverter,
  createRoom,
  createStateChangeDetector,
  flash,
  PlayerId,
  Room,
  RoomEventType,
  service,
  State,
  van,
  Vector3,
} from '@van13k'

export type NetManagerService = {
  room: Room<Player>
  isConnected: State<boolean>
  localPlayer: State<Player | null>
  otherPlayers: Map<PlayerId, State<Player>>
  otherPlayerIds: State<Set<string>>
}

export const NetManager = () => {
  const baseCoordinateConverter = createCoordinateConverter(320)
  const coordinateConverter = {
    serverToWorld: (serverPos: Vector3) => {
      const worldPos = baseCoordinateConverter.serverToWorld(serverPos)
      worldPos.y = worldPos.z
      return worldPos
    },
    worldToServer: (worldPos: Vector3) => {
      const serverPos = baseCoordinateConverter.worldToServer(worldPos)
      serverPos.z = serverPos.y
      return serverPos
    },
  }
  // Connect to a room with optional custom endpoint
  const room = createRoom<Player>('craz2d23k', {
    stateChangeDetectorFn: createStateChangeDetector({
      positionDistance: 3,
      rotationAngle: 0.05,
    }),
    coordinateConverter,
  })

  // Connect to the room (must be called explicitly)
  room.connect()

  const isConnected = van.state(false)
  const localPlayer = van.state<Player | null>(room.getLocalPlayer())
  const otherPlayers = new Map<PlayerId, State<Player>>()
  const otherPlayerIds = van.state<Set<string>>(new Set())

  // Listen for connection events
  room.on(RoomEventType.Connected, ({ data }) => {
    flash(`🌐 Connected`)
    isConnected.val = true
    console.log('Connected to room')
  })

  room.on(RoomEventType.Disconnected, ({ data }) => {
    flash(`🔴 Disconnected`)
    isConnected.val = false
    console.log('Disconnected from room')
  })

  const updatePlayer = (player: Player) => {
    if (player.isLocal) {
      // console.log('Local player updated:', player)
      localPlayer.val = player
    } else {
      const otherPlayer = otherPlayers.get(player.id)
      if (otherPlayer) {
        console.log('Other player updated:', player)
        otherPlayer.val = player
      } else {
        console.log('New other player:', player)
        otherPlayers.set(player.id, van.state(player))
        // Trigger reactivity for player list changes
        otherPlayerIds.val = new Set(otherPlayers.keys())
      }
    }
  }

  // Handle player updates
  room.on(RoomEventType.PlayerUpdated, ({ data: player }) => {
    updatePlayer(player)
  })

  // Handle player joins/leaves
  room.on(RoomEventType.PlayerJoined, ({ data: player }) => {
    updatePlayer(player)
  })

  room.on(RoomEventType.PlayerLeft, ({ data: player }) => {
    otherPlayers.delete(player.id)
    otherPlayerIds.val = new Set(otherPlayers.keys())
  })

  room.on(RoomEventType.PlayerMutated, ({ data: player }) => {
    updatePlayer(player)
  })

  room.on(RoomEventType.AfterPlayerMutated, ({ data: player }) => {
    player.collision = undefined
    updatePlayer(player)
  })

  service<NetManagerService>('net', { room, isConnected, localPlayer, otherPlayers, otherPlayerIds })
}

export const useNetManager = () => {
  const netManager = service<NetManagerService>('net')
  return netManager
}
