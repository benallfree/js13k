import { PlayerBase, Room } from 'vibescale'
import { service } from './service'

export const useRoom = <TPlayer extends PlayerBase = PlayerBase>() => service<Room<TPlayer>>('room')
