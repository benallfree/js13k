import { mkClass } from '@/util'
import { bind, div, state } from '@/van'
import { ToolButton, ToolButtonProps_In } from './ToolButton'

type ToolProps_In = Partial<ToolsProps>
type ToolsProps = {
  activeItemIdx: number
  floating: boolean
  tools: ToolButtonProps_In[]
  title: string
  onToolItemClicked: (idx: number) => void
}
export const Toolbar = (props: ToolProps_In) => {
  const { floating, tools, onToolItemClicked, activeItemIdx, title }: ToolsProps = {
    activeItemIdx: 0,
    floating: false,
    tools: [],
    title: '',
    onToolItemClicked: (i) => {
      activeTabIdx.val = i
    },
    ...props
  }

  const activeTabIdx = state(activeItemIdx)

  return div(
    { ...mkClass(`Toolbar`, floating ? `floating` : '', title ? 'with-title' : '') },
    div({ ...mkClass(`toolbar-title`) }, title),
    bind(activeTabIdx, (_activeTabIndex) => {
      return div(
        { ...mkClass() },
        ...tools.map((itemProps, i) =>
          ToolButton({
            selected: _activeTabIndex === i,
            onClick: () => onToolItemClicked(i),
            ...itemProps
          })
        )
      )
    })
  )
}
