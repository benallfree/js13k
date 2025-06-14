import van, { State } from 'vanjs-core'

const { div, span } = van.tags

export const BeatNameInput = (
  currentBeatName: State<string>,
  isModified: State<boolean>,
  onInput: (value: string) => void
) =>
  div(
    { class: 'beat-name' },
    span(
      {
        class: 'beat-name-text',
        onclick: () => onInput(currentBeatName.val),
      },
      () => currentBeatName.val,
      () => (isModified.val ? span({ class: 'modified' }, ' *') : '')
    )
  )
