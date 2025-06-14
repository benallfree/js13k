import van, { State } from 'vanjs-core'

const { div, button } = van.tags

export const MainControls = (
  playing: State<boolean>,
  instruments: string[],
  selectedInstrument: State<number>,
  onTogglePlay: () => void,
  onSelectInstrument: (index: number) => void
) =>
  div(
    { class: 'controls' },
    button({ onclick: onTogglePlay }, () => (playing.val ? 'Stop' : 'Play')),
    div(
      { class: 'instruments' },
      ...instruments.map((inst, i) =>
        button(
          {
            class: () => (selectedInstrument.val === i ? 'active' : ''),
            onclick: () => onSelectInstrument(i),
          },
          inst
        )
      )
    )
  )
