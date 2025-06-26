import { flex, flexCol, gapSmall, itemsCenter } from '@/styles.module.css'
import { Button, ButtonVariant, classify, div, van, VanValue } from '@van13k'

export type HudItemConfig = {
  debug: boolean
}
export type HudItem = (config: HudItemConfig) => VanValue

export const HUD = ({ items = [] }: { items?: HudItem[] }) => {
  const isDebugActive = van.state(false)
  const isCollapsed = van.state(true)

  const toggleDebug = () => {
    isDebugActive.val = !isDebugActive.val
  }

  const toggleCollapsed = () => {
    isCollapsed.val = !isCollapsed.val
  }

  return div(
    {
      ...classify(flex, flexCol, gapSmall, itemsCenter),
    },
    () =>
      Button({
        onClick: toggleCollapsed,
        variant: ButtonVariant.Secondary,
        isActive: !isCollapsed.val,
        children: '🎮',
      }),
    () =>
      isCollapsed.val
        ? div()
        : div(
            {
              ...classify(flex, flexCol, gapSmall, itemsCenter),
            },
            Button({
              onClick: toggleDebug,
              variant: ButtonVariant.Secondary,
              isActive: isDebugActive.val,
              children: 'Debug',
            }),
            div(...items.map((item) => item({ debug: isDebugActive.val })))
          )
  )
}
