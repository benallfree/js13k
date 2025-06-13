import { TILE_SIZE } from '@/constants'
import { gameStore } from '@/store'
import { mkXOffset, mkYOffset } from '@/types'
import { CLEARFIX, NOSELECT, mkClass, px, range } from '@/util'
import { div } from '@/van'
import { ShareTool } from './ShareTool'
import { TerrainCell } from './TerrainCell'

export const TerrainMap = () => {
  const { size } = gameStore

  return div(
    { ...mkClass(`TerrainMap`, CLEARFIX) },
    div(
      { ...mkClass(`grid`, NOSELECT, CLEARFIX), style: `width: ${px(TILE_SIZE * size)}` },
      ...range(size).map((i, x) =>
        range(size).map((i, y) => TerrainCell({ x: mkXOffset(x), y: mkYOffset(y) }))
      )
    ),
    ShareTool()
  )
}
