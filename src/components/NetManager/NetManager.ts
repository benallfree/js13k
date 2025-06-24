import { Player } from '@/types'
import { createRoom, flash, PlayerId, Room, RoomEventType, service, State, van } from '@van13k'

export type NetManagerService = {
  room: Room
  isConnected: State<boolean>
  localPlayer: State<Player | null>
  otherPlayers: Map<PlayerId, State<Player>>
}

export const NetManager = () => {
  // Connect to a room with optional custom endpoint
  const room = createRoom('craz2d23k', {
    stateChangeDetectorFn: (oldState, newState) => {
      // Position threshold: 3 pixels
      const positionThreshold = 3
      const positionChanged =
        Math.abs(oldState.position.x - newState.position.x) >= positionThreshold ||
        Math.abs(oldState.position.y - newState.position.y) >= positionThreshold

      // Rotation threshold: 0.05 radians (~3 degrees)
      const rotationThreshold = 0.05
      const rotationChanged = Math.abs(oldState.rotation.z - newState.rotation.z) >= rotationThreshold

      // Other properties that should always trigger updates
      const otherPropsChanged =
        oldState.color !== newState.color ||
        oldState.username !== newState.username ||
        oldState.isConnected !== newState.isConnected

      return positionChanged || rotationChanged || otherPropsChanged
    },
  })

  // Connect to the room (must be called explicitly)
  room.connect()

  const isConnected = van.state(false)

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
      console.log('Local player updated:', player)
      localPlayer.val = player
    } else {
      const otherPlayer = otherPlayers.get(player.id)
      if (otherPlayer) {
        console.log('Other player updated:', player)
        otherPlayer.val = player
      } else {
        console.log('New other player:', player)
        otherPlayers.set(player.id, van.state(player))
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
    console.log('Player left:', player.id)
  })

  // Handle WebSocket events
  room.on(RoomEventType.Rx, ({ data: jsonMessage }) => {
    console.log('Raw WebSocket message received:', jsonMessage)
  })

  room.on(RoomEventType.Tx, ({ data: jsonMessage }) => {
    console.log('Message sent:', jsonMessage)
  })

  room.on(RoomEventType.PlayerMutated, ({ data: player }) => {
    console.log('Player mutated:', player)
    updatePlayer(player)
  })

  const localPlayer = van.state<Player | null>(room.getLocalPlayer())
  const otherPlayers = new Map<PlayerId, State<Player>>()

  service<NetManagerService>('net', { room, isConnected, localPlayer, otherPlayers })
}

export const useNetManager = () => {
  const netManager = service<NetManagerService>('net')
  return netManager
}

/*
// Access player data
  const localPlayer = room.getLocalPlayer()
  const otherPlayer = room.getPlayer('some-player-id')

  // Update local player state
  room.mutatePlayer((oldState) => {
    return {
      ...oldState,
      position: { x: 10, y: 5, z: 0 },
      rotation: { x: 0, y: Math.PI / 2, z: 0 },
    }
  })

  // Get the room identifier
  const roomId = room.getRoomId() // Returns 'my-game'

  // Check connection status
  const isConnected = room.isConnected() // Returns true if connected to server
}
  */
