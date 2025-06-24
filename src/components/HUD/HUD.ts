import {
  fixed,
  flex,
  flexCol,
  gapSmall,
  itemsCenter,
  p4,
  pointerAuto,
  right0,
  top0,
  zIndexHigh,
} from '@/styles.module.css'
import { Button, ButtonVariant, classify, div, van, VanValue } from '@van13k'

export type HudItemConfig = {
  debug: boolean
}
export type HudItem = (config: HudItemConfig) => VanValue

export const HUD = ({ items = [] }: { items?: HudItem[] }) => {
  const isDebugActive = van.state(false)

  const toggleDebug = () => {
    isDebugActive.val = !isDebugActive.val
  }

  return div(
    {
      ...classify(fixed, top0, right0, p4, zIndexHigh, pointerAuto),
    },
    div(
      {
        ...classify(flex, flexCol, gapSmall, itemsCenter),
      },
      () =>
        Button({
          onClick: toggleDebug,
          variant: ButtonVariant.Secondary,
          isActive: isDebugActive.val,
          children: 'Debug',
        }),

      () => div(...items.map((item) => item({ debug: isDebugActive.val })))
    )
  )
}
