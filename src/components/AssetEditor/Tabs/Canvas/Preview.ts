import { SpriteRenderer } from '@/components/SpriteRenderer'
import { gameStore } from '@/store'
import { CLEARFIX, LAYER, TILE, mkClass, range } from '@/util'
import { bind, div } from '@/van'

type PreviewProps = { background: 'black' | 'white' }
export const Preview = (props: PreviewProps) => {
  const { background } = props
  const { assetEditor } = gameStore
  const { xOffset, yOffset, isPlaying, asset, spriteData, sprite } = assetEditor()
  return div(
    { ...mkClass(`Preview`, CLEARFIX), style: `background-color: ${background}` },
    ...range(9).map(() =>
      div(
        { ...mkClass('preview-cell', TILE) },
        div({ ...mkClass(`border-overlay`, TILE, LAYER) }),
        div(
          { ...mkClass(TILE, LAYER) },
          bind(xOffset, yOffset, isPlaying, spriteData, sprite, (frame, row, isPlaying) =>
            SpriteRenderer({
              asset: asset(),
              row,
              frame,
              isAnimating: isPlaying,
              gc: true
            })
          )
        )
      )
    )
  )
}
