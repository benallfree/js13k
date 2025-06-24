import { div } from '@/common/tags'
import { clickify } from '@/common/util/clickify'
import { State } from 'vanjs-core'
import { InstrumentType, sampleMetadata } from '../../sounds'
import styles from './Grid.module.css'

const CELL_TYPES = {
  [InstrumentType.Kick]: styles.k,
  [InstrumentType.Snare]: styles.s,
  [InstrumentType.HiHat]: styles.h,
  [InstrumentType.Crash]: styles.c,
  [InstrumentType.Tom]: styles.t,
  [InstrumentType.Clap]: styles.p,
  [InstrumentType.Bell]: styles.b,
} as const

const TRAIL_STYLES = {
  [0]: styles.trail0,
  [1]: styles.trail1,
  [2]: styles.trail2,
  [3]: styles.trail3,
} as const

export const Grid = (
  grid: State<number[][]>,
  playing: State<boolean>,
  playingCells: State<Set<string>>,
  stepHistory: State<number[]>,
  onToggleCell: (row: number, col: number) => void
) =>
  div(
    { class: styles.grid },
    ...Array(16)
      .fill(0)
      .flatMap((_, row) =>
        Array(16)
          .fill(0)
          .map((_, col) =>
            div({
              class: () => {
                const val = grid.val[row][col]
                const cellKey = `${row}-${col}`
                const isPlaying = playingCells.val.has(cellKey)
                const trailIndex = stepHistory.val.indexOf(col)

                let classes = styles.cell
                if (val) {
                  const meta = sampleMetadata[val - 1]
                  classes += ` ${CELL_TYPES[meta.shortName]}`
                }
                if (playing.val && trailIndex >= 0)
                  classes += ` ${TRAIL_STYLES[trailIndex as keyof typeof TRAIL_STYLES]}`
                if (isPlaying) classes += ` ${styles.playing}`

                return classes
              },
              ...clickify(() => onToggleCell(row, col)),
            })
          )
      )
  )
