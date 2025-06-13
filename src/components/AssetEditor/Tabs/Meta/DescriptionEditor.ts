import { gameStore } from '@/store'
import { mkClass } from '@/util'
import { bind, div, textarea } from '@/van'

export type DescriptionEditorProps = {}
export const DefaultDescriptionEditorProps: DescriptionEditorProps = {}
export const DescriptionEditor = (props?: Partial<DescriptionEditorProps>) => {
  const {} = { ...DefaultDescriptionEditorProps, ...props }

  const { assetEditor } = gameStore
  const { description, setDescription } = assetEditor()

  return div(
    { ...mkClass(`DescriptionEditor`) },
    bind(description, (description) => {
      return textarea(
        {
          onchange: function (this: HTMLTextAreaElement) {
            setDescription(this.value)
          }
        },
        description
      )
    })
  )
}
