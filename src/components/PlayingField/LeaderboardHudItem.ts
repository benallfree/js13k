import {
  bgGray,
  bgGray300,
  flex,
  fontBold,
  gapSmall,
  h15,
  itemsCenter,
  mb1,
  minW20,
  p2,
  px2,
  py1,
  rounded,
  roundedSm,
  textSm,
  textWhite,
  w30,
} from '@/styles.module.css'
import { Player } from '@/types'
import { classify, div, RoomEventType, van } from '@/van13k'
import { HudItem } from '../HUD/HUD'
import { useNetManager } from '../NetManager/NetManager'

export const LeaderboardHudItem =
  (): HudItem =>
  ({ debug }) => {
    const nm = useNetManager()
    const players = van.state<Player[]>([])

    const updatePlayers = () => {
      players.val = nm.room
        .getAllPlayers()
        .filter((f): f is Player => !!f)
        .sort((a, b) => b.points - a.points)
    }
    updatePlayers()

    nm.room.on(RoomEventType.RemotePlayerJoined, updatePlayers)
    nm.room.on(RoomEventType.RemotePlayerLeft, updatePlayers)
    nm.room.on(RoomEventType.RemotePlayerUpdated, updatePlayers)
    nm.room.on(RoomEventType.LocalPlayerMutated, updatePlayers)

    return div(
      {
        ...classify(bgGray300, rounded, p2, gapSmall),
      },
      () =>
        div(
          {},
          ...players.val.map((player) =>
            div(
              {
                ...classify(flex, itemsCenter, gapSmall, py1, px2, mb1, bgGray, rounded),
              },
              div({
                ...classify(w30, h15, roundedSm),
                style: `background-color: ${player.color};`,
              }),
              div(
                {
                  ...classify(textSm, fontBold, textWhite, minW20),
                },
                player.points || 0
              )
            )
          )
        )
    )
  }
