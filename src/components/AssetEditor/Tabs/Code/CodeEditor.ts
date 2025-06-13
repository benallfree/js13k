import { gameStore } from '@/store'
import { checkRenderFn, mkClass } from '@/util'
import { bind, div, p, state, textarea } from '@/van'

export type CodeEditorProps = {}
export const DefaultCodeEditorProps: CodeEditorProps = {}
export const CodeEditor = (props?: Partial<CodeEditorProps>) => {
  const {} = { ...DefaultCodeEditorProps, ...props }

  const { assetEditor } = gameStore
  const { code, setCode } = assetEditor()

  return bind(code, (code) => {
    const hasSyntaxError = state(checkRenderFn(code))

    return div(
      { ...mkClass(`CodeEditor`) },
      p(`Write your custom code here.`),
      bind(hasSyntaxError, (hasSyntaxError) =>
        hasSyntaxError ? p({ class: 'danger' }, `Syntax error: ${hasSyntaxError}`) : div()
      ),
      textarea(
        {
          oninput: function (this: HTMLTextAreaElement) {
            setCode(this.value)
            hasSyntaxError.val = checkRenderFn(this.value)
          }
        },
        code
      )
    )
  })
}
