import van, { State } from 'vanjs-core'
import { sampleMetadata } from '../sounds'
import { Button } from './Button'

const { div } = van.tags

export const MainControls = (
  playing: State<boolean>,
  selectedInstrument: State<number>,
  onTogglePlay: () => void,
  onSelectInstrument: (index: number) => void
) =>
  div(
    { class: 'mb-4' },
    Button({
      onClick: onTogglePlay,
      variant: 'primary',
      children: () => (playing.val ? '⏹️' : '▶️'),
    }),
    div(
      { class: 'flex flex-wrap gap-1 mt-2' },
      ...Object.entries(sampleMetadata).map(([index, meta]) =>
        Button({
          onClick: () => onSelectInstrument(Number(index)),
          class: selectedInstrument.val === Number(index) ? 'btn-active' : '',
          size: 'sm',
          children: `${meta.emoji} ${meta.shortName}`,
        })
      )
    )
  )
