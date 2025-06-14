import van, { State } from 'vanjs-core'

const { div, input, span } = van.tags

export const BeatNameInput = (
  currentBeatName: State<string>,
  isModified: State<boolean>,
  onInput: (value: string) => void
) =>
  div(
    { class: 'beat-name' },
    span('Beat Name:'),
    input({
      type: 'text',
      value: () => currentBeatName.val,
      oninput: (e: Event) => {
        const value = (e.target as HTMLInputElement).value
        currentBeatName.val = value
        onInput(value)
      },
    }),
    () => (isModified.val ? span({ class: 'modified' }, '*') : '')
  )
