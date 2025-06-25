import type { PartialDeep } from 'type-fest'
import type { Emitter } from './EventEmitter'

/**
 * Shared type definitions for client-server communication.
 * Base types are generic with empty defaults, allowing extension by clients.
 */

// Base types
export type PlayerId = string

export type Vector3 = {
  x: number
  y: number
  z: number
}

export interface BasePlayerFields {
  id: PlayerId
  position: Vector3
  rotation: Vector3
  color: string
  username: string
  isLocal: boolean
  isConnected: boolean
}

export type PlayerStateExtension = {
  [K in keyof BasePlayerFields]?: any
}

export type PlayerBase<TStateExtension extends PlayerStateExtension = PlayerStateExtension> = BasePlayerFields &
  TStateExtension

/**
 * Function type for detecting significant state changes between two player states
 */
export type StateChangeDetectorFn<TPlayerStateExtension extends PlayerStateExtension = PlayerStateExtension> = (
  currentState: PlayerBase<TPlayerStateExtension>,
  nextState: PlayerBase<TPlayerStateExtension>
) => boolean

// Message types
export enum MessageType {
  PlayerState = 'player:state',
  Error = 'error',
}

// WebSocket message types
export type PlayerStateMessageBase<TPlayerStateExtension extends PlayerStateExtension = PlayerStateExtension> = {
  type: MessageType.PlayerState
} & PlayerBase<TPlayerStateExtension>

export type ErrorMessage = {
  type: MessageType.Error
  message: string
}

export type WebSocketMessage<TPlayerStateExtension extends PlayerStateExtension = PlayerStateExtension> =
  | PlayerStateMessageBase<TPlayerStateExtension>
  | ErrorMessage

// Server-specific types (not used by client)
export type RoomName = string

export type WsMeta<TPlayerStateExtension extends PlayerStateExtension = PlayerStateExtension> = {
  player: PlayerBase<TPlayerStateExtension>
  roomName: RoomName
}

export type PlayerEventCallback = (player: PlayerBase) => void

// Enum for all possible event names
export enum RoomEventType {
  // Core events
  Connected = 'connected',
  Disconnected = 'disconnected',
  Error = 'error',

  // Player events
  PlayerJoined = 'player:joined',
  PlayerLeft = 'player:left',
  PlayerUpdated = 'player:updated',
  PlayerError = 'player:error',
  PlayerMutated = 'player:mutated',

  // WebSocket events
  WebSocketInfo = 'websocket:info',
  Rx = 'rx',
  Tx = 'tx',

  // Any event
  Any = '*',
}

export type AnyEventPayload<TPlayer extends PlayerBase> = {
  type: RoomEventType
  data: RoomEventPayloads<TPlayer>[RoomEventType]
}

// Event payloads
export interface RoomEventPayloads<TPlayer extends PlayerBase = PlayerBase> {
  [RoomEventType.Connected]: undefined
  [RoomEventType.Disconnected]: undefined
  [RoomEventType.Error]: { message: string; error: any; details?: any }

  [RoomEventType.PlayerJoined]: TPlayer
  [RoomEventType.PlayerLeft]: TPlayer
  [RoomEventType.PlayerUpdated]: TPlayer
  [RoomEventType.PlayerMutated]: TPlayer
  [RoomEventType.PlayerError]: { type: string; error: string; details?: any }

  [RoomEventType.WebSocketInfo]: Record<string, any>
  [RoomEventType.Rx]: string
  [RoomEventType.Tx]: string

  [RoomEventType.Any]: AnyEventPayload<TPlayer>
}

// Update RoomEvents to use RoomEventPayloads
export type RoomEvents<TPlayer extends PlayerBase = PlayerBase> = RoomEventPayloads<TPlayer>

export interface RoomOptions<TPlayer extends PlayerBase> {
  endpoint?: string
  stateChangeDetectorFn: StateChangeDetectorFn<TPlayer>
  normalizePlayerState?: (state: PartialDeep<TPlayer>) => TPlayer
}

export type PlayerMutator<TPlayer extends PlayerBase = PlayerBase> = (oldState: TPlayer) => TPlayer

export type Room<TPlayer extends PlayerBase = PlayerBase> = {
  getPlayer: (id: PlayerId) => TPlayer | null
  getLocalPlayer: () => TPlayer | null
  getAllPlayers: () => TPlayer[]
  mutatePlayer: (mutator: PlayerMutator<TPlayer>) => void
  getRoomId: () => string
  disconnect: () => void
  isConnected: () => boolean
  connect: () => void
} & Emitter<RoomEvents<TPlayer>>
