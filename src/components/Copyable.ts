import { SUCCESS, mkClass, mkOnClick } from '@/util'
import { bind, button, div, p, state, textarea } from '@/van'
import { SetRequired } from 'type-fest'

export type CopyableProps_In = SetRequired<Partial<CopyableProps>, 'content'>
export type CopyableProps = {
  content: string
  success: string
  instructions: string
}

export const Copyable = (props: CopyableProps_In) => {
  const { content, success, instructions }: CopyableProps = {
    success: `Copied to clipboard!`,
    instructions: `Copy (CTRL+C / CMD+C) or use the copy button below.`,
    ...props
  }

  const isCopied = state(false)

  const shareTextArea = textarea({ readonly: true }, content)

  const onClipboardCopy = () => {
    shareTextArea.select()
    document.execCommand('copy')
    isCopied.val = true
  }

  return div(
    p(instructions),
    shareTextArea,
    div(
      button({ ...mkOnClick(onClipboardCopy) }, `📋`),
      bind(isCopied, (isCopied) => {
        if (!isCopied) return div()
        return div({ ...mkClass(SUCCESS) }, success)
      })
    )
  )
}
