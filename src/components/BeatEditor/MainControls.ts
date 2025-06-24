import styles from '@styles'
import { Button, ButtonSize, ButtonVariant, classify, div } from '@van13k'
import { State } from 'vanjs-core'
import { sampleMetadata } from '../../sounds'

export const MainControls = (
  playing: State<boolean>,
  selectedInstrument: State<number>,
  onTogglePlay: () => void,
  onSelectInstrument: (index: number) => void
) =>
  div(
    { ...classify(styles.mb4) },
    Button({
      onClick: onTogglePlay,
      variant: ButtonVariant.Primary,
      children: () => (playing.val ? '⏹️' : '▶️'),
    }),
    div(
      { ...classify(styles.flex, styles.flexWrap, styles.gapSmall, styles.mt2) },
      ...Object.entries(sampleMetadata).map(([index, meta]) =>
        Button({
          onClick: () => onSelectInstrument(Number(index)),
          isActive: selectedInstrument.val === Number(index),
          size: ButtonSize.Small,
          children: `${meta.emoji} ${meta.shortName}`,
        })
      )
    )
  )
