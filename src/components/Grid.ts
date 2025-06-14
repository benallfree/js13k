import van, { State } from 'vanjs-core'

const { div } = van.tags

export const Grid = (
  grid: State<number[][]>,
  playing: State<boolean>,
  playingCells: State<Set<string>>,
  stepHistory: State<number[]>,
  onToggleCell: (row: number, col: number) => void
) =>
  div(
    { class: 'grid' },
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

                let classes = 'cell'
                if (val) classes += ` ${['k', 's', 'h', 'c', 't', 'p', 'b'][val - 1]}`
                if (playing.val && trailIndex >= 0) classes += ` trail-${trailIndex}`
                if (isPlaying) classes += ' playing'

                return classes
              },
              onclick: () => onToggleCell(row, col),
            })
          )
      )
  )
