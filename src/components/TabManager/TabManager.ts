import { assert, mkClass, objectEntries } from '@/util'
import { ChildDom, bind, div, state } from '@/van'
import { Toolbar } from '../Toolbar/Toolbar'

export type TabManagerProps = { tabs: { [_: string]: () => ChildDom } }

export const DefaultTabManagerProps: TabManagerProps = { tabs: {} }
export const TabManager = (props?: Partial<TabManagerProps>) => {
  const { tabs } = { ...DefaultTabManagerProps, ...props }

  const entries = objectEntries(tabs)
  assert(entries.length > 0)
  const activeTabIdx = state(0)

  return bind(activeTabIdx, (_activeTablIdx) => {
    return div(
      { ...mkClass(`TabManager`) },
      Toolbar({
        tools: entries.map(([title], i) => ({
          title: () => title,
          selected: _activeTablIdx === i
        })),
        onToolItemClicked: (idx) => {
          activeTabIdx.val = idx
        }
      }),
      entries[_activeTablIdx][1]()
    )
  })
}
