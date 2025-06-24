import { createRoom, flash, RoomEventType, service } from '@van13k'

export const NetManager = () => {
  // Connect to a room with optional custom endpoint
  const room = createRoom('craz2d23k', {
    stateChangeDetectorFn: (oldState, newState) => {
      return oldState !== newState
    },
  })

  // Connect to the room (must be called explicitly)
  room.connect()

  // Listen for connection events
  room.on(RoomEventType.Connected, ({ data }) => {
    flash(`🌐 Connected`)
    console.log('Connected to room')
  })

  room.on(RoomEventType.Disconnected, ({ data }) => {
    flash(`🔴 Disconnected`)
    console.log('Disconnected from room')
  })

  // Handle player updates
  room.on(RoomEventType.PlayerUpdated, ({ data: player }) => {
    console.log('Player updated:', player.id)
    console.log('Position:', player.position)
    console.log('Rotation:', player.rotation)
    console.log('Color:', player.color)
  })

  // Handle player joins/leaves
  room.on(RoomEventType.PlayerJoined, ({ data: player }) => {
    console.log('New player:', player.id)
    console.log('Color:', player.color)
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

  service('room', room)
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
