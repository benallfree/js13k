import { gameStore } from '@/store'
import { mkClass, mkOnClick } from '@/util'
import { bind, button, div } from '@/van'

export type BedrockEditorProps = {}
export const DefaultBedrockEditorProps: BedrockEditorProps = {}
export const BedrockEditor = (props?: Partial<BedrockEditorProps>) => {
  const {} = { ...DefaultBedrockEditorProps, ...props }

  const { assetEditor } = gameStore
  const { isBedrock, setIsBedrock } = assetEditor()

  return bind(isBedrock, (isBedrock) => {
    return div(
      { ...mkClass(`BedrockEditor`) },
      button(
        {
          ...mkClass(isBedrock ? `selected` : ``),
          ...mkOnClick(() => {
            setIsBedrock(!isBedrock)
          })
        },
        `Bedrock`
      )
    )
  })
}
