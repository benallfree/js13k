import { PlayerBase, Room as RoomBase } from '@van13k'

export type Player = PlayerBase & {
  collision?: string // ID of the player we collided with
}

export type Room = RoomBase<Player>
