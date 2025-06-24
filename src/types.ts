import { PlayerBase, Room as RoomBase, VanValue } from '@van13k'

export type Player = PlayerBase

export type Room = RoomBase<Player>

export type HudItem = (debugActive: boolean) => VanValue
