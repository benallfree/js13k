import { gameStore } from '@/store'
import { AssetState } from '@/types'
import { CONTAINER, LAYER, PULSING, PointerEventHandler, mkClass, mkOnClick } from '@/util'
import { button, div } from '@/van'
import { SpriteRenderer } from '../SpriteRenderer'

type ToolbarSpriteProps = {
  asset: AssetState
  active: boolean
  onClick: PointerEventHandler
}
export const AssetBarItem = (props: ToolbarSpriteProps) => {
  const { asset, active, onClick } = props
  const { openAssetEditor } = gameStore

  const { name } = asset

  return div(
    { ...mkClass(`AssetBarItem`, CONTAINER) },
    active ? div({ ...mkClass(`active`, LAYER, PULSING) }) : div(),
    div(
      { ...mkClass(CONTAINER) },
      div({ ...mkClass(`title`) }, name),
      div({ ...mkOnClick(onClick) }, SpriteRenderer({ asset })),
      div(
        { ...mkClass(`controls`) },
        button(
          {
            ...mkOnClick(() => {
              openAssetEditor(asset).catch(console.error)
            })
          },
          `edit`
        )
      )
    )
  )
}
