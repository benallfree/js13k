import { TabManager } from '@/components/TabManager/TabManager'
import { TILE_SIZE } from '@/constants'
import { gameStore } from '@/store'
import { bind, div, img } from '@/van'
import { Preview } from './Preview'

export type CanvasPreviewAreaProps = {}
export const DefaultCanvasPreviewAreaProps: CanvasPreviewAreaProps = {}
export const CanvasPreviewArea = (props?: Partial<CanvasPreviewAreaProps>) => {
  const {} = { ...DefaultCanvasPreviewAreaProps, ...props }

  const { assetEditor } = gameStore
  const { spriteData, sprite, canvas } = assetEditor()

  return div(
    TabManager({
      tabs: {
        Tile: () => div(Preview({ background: 'black' }), Preview({ background: 'white' })),
        Sprite: () =>
          div(
            bind(sprite, spriteData, (sprite, spriteData) =>
              img({
                src: sprite,
                style: `width: 100%; max-width: ${TILE_SIZE * spriteData.highestFrameCount}px`
              })
            )
          )
      }
    })
  )
}
