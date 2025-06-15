import { State } from 'vanjs-core'
import { div } from '../common/tags'
import { sampleMetadata } from '../sounds'
import styles from './Grid.module.css'

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
                  classes += ` ${styles[meta.shortName.toLowerCase()]}`
                }
                if (playing.val && trailIndex >= 0) classes += ` ${styles['trail' + trailIndex]}`
                if (isPlaying) classes += ` ${styles.playing}`

                return classes
              },
              ontouchstart: (e: TouchEvent) => {
                e.preventDefault()
                onToggleCell(row, col)
              },
              onmousedown: () => onToggleCell(row, col),
            })
          )
      )
  )
