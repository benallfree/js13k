import { gameStore } from '@/store'
import { range } from '@/util'
import { bind, div } from '@/van'
import { Toolbar } from '../../../Toolbar/Toolbar'

export type CanvasAnimationControlsProps = {}
export const DefaultCanvasAnimationControlsProps: CanvasAnimationControlsProps = {}
export const CanvasAnimationControls = (props?: Partial<CanvasAnimationControlsProps>) => {
  const {} = { ...DefaultCanvasAnimationControlsProps, ...props }

  const { assetEditor } = gameStore
  const {
    selectAnimationFrame,
    xOffset,
    yOffset,
    removeFrame,
    addFrame,
    toggleReverseLoop,
    spriteData
  } = assetEditor()

  return bind(xOffset, yOffset, spriteData, (xOffset, yOffset, spriteData) => {
    if (spriteData.animations.length === 1 && spriteData.highestFrameCount === 1) return div()
    return div(
      ...spriteData.animations.map((rowData, yo) => {
        return div(
          Toolbar({
            title: `Animation ${yo}`,
            tools: [
              ...range(rowData.frameCount).map((frameInfo, xo) => {
                return {
                  title: () => xo,
                  selected: xOffset === xo && yOffset === yo,
                  onClick: () => selectAnimationFrame(xo, yo)
                }
              }),
              {
                title: () => `🔄`,
                selected: rowData.reverseLoop,
                onClick: () => {
                  toggleReverseLoop(yo)
                }
              }
            ]
          })
        )
      })
    )
  })
}
