import { gameStore } from '@/store'
import { mkClass } from '@/util'
import { bind, div, input } from '@/van'

export type TitleEditorProps = {}
export const DefaultTitleEditorProps: TitleEditorProps = {}
export const TitleEditor = (props?: Partial<TitleEditorProps>, ...rest: ChildNode[]) => {
  const {} = { ...DefaultTitleEditorProps, ...props }

  const { assetEditor } = gameStore
  const { name, setName } = assetEditor()

  return bind(name, (name) => {
    return div(
      { ...mkClass(`TitleEditor`) },
      input({
        type: 'text',
        value: name,
        onchange: function (this: HTMLInputElement) {
          setName(this.value)
        }
      })
    )
  })
}
