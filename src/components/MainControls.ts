import { State } from 'vanjs-core'
import { Button, ButtonSize, ButtonVariant } from '../common/Button'
import styles from '../common/Button.module.css'
import { div } from '../common/tags'
import { sampleMetadata } from '../sounds'

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
      variant: ButtonVariant.Primary,
      children: () => (playing.val ? '⏹️' : '▶️'),
    }),
    div(
      { class: 'flex flex-wrap gap-1 mt-2' },
      ...Object.entries(sampleMetadata).map(([index, meta]) =>
        Button({
          onClick: () => onSelectInstrument(Number(index)),
          class: selectedInstrument.val === Number(index) ? styles['btn-active'] : '',
          size: ButtonSize.Small,
          children: `${meta.emoji} ${meta.shortName}`,
        })
      )
    )
  )
