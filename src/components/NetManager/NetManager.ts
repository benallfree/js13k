import { Player } from '@/types'
import {
  createCoordinateConverter,
  createHook,
  createRoom,
  createStateChangeDetector,
  flash,
  normalizePlayerBase,
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
  remotePlayers: Map<PlayerId, State<Player>>
  remotePlayerIds: State<Set<string>>
}

export type INetManager = {
  room: Room<Player>
  isConnected: State<boolean>
  localPlayer: State<Player | null>
  remotePlayers: Map<PlayerId, State<Player>>
  remotePlayerIds: State<Set<string>>
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
      customChecker: (currentState: Player, nextState: Player) => {
        return currentState.points !== nextState.points || currentState.collision !== nextState.collision
      },
    }),
    coordinateConverter,
    normalizePlayerState: (state) => {
      return {
        ...normalizePlayerBase(state),
        points: state.points || 0,
        collision: state.collision || undefined,
      }
    },
  })

  // Connect to the room (must be called explicitly)
  room.connect()

  const isConnected = van.state(false)
  const localPlayer = van.state<Player | null>(room.getLocalPlayer())
  const remotePlayers = new Map<PlayerId, State<Player>>()
  const remotePlayerIds = van.state<Set<string>>(new Set())

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
      // console.log('Local player updated:', JSON.stringify(player))
      localPlayer.val = player
    } else {
      const remotePlayer = remotePlayers.get(player.id)
      if (remotePlayer) {
        console.log('Remote player updated:', player)
        remotePlayer.val = player
      } else {
        console.log('New remote player:', player)
        remotePlayers.set(player.id, van.state(player))
        // Trigger reactivity for player list changes
        remotePlayerIds.val = new Set(remotePlayers.keys())
      }
    }
  }

  // Handle player updates
  room.on(RoomEventType.RemotePlayerUpdated, ({ data: player }) => {
    updatePlayer(player)
  })

  // Handle player joins/leaves
  room.on(RoomEventType.RemotePlayerJoined, ({ data: player }) => {
    updatePlayer(player)
  })

  room.on(RoomEventType.RemotePlayerLeft, ({ data: player }) => {
    remotePlayers.delete(player.id)
    remotePlayerIds.val = new Set(remotePlayers.keys())
  })

  room.on(RoomEventType.LocalPlayerMutated, ({ data: player }) => {
    updatePlayer(player)
  })

  room.on(RoomEventType.AfterLocalPlayerMutated, ({ data: player }) => {
    player.collision = undefined
    updatePlayer(player)
  })

  service<INetManager>('netManager', {
    room,
    isConnected,
    localPlayer,
    remotePlayers,
    remotePlayerIds,
  })
}

export const useNetManager = createHook<INetManager>('netManager')
