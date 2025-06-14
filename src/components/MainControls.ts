import van, { State } from 'vanjs-core'
import { sampleMetadata } from '../sounds'

const { div, button } = van.tags

export const MainControls = (
  playing: State<boolean>,
  selectedInstrument: State<number>,
  onTogglePlay: () => void,
  onSelectInstrument: (index: number) => void
) =>
  div(
    { class: 'controls' },
    button({ onclick: onTogglePlay }, () => (playing.val ? 'Stop' : 'Play')),
    div(
      { class: 'instruments' },
      ...Object.entries(sampleMetadata).map(([index, meta]) =>
        button(
          {
            class: () => (selectedInstrument.val === Number(index) ? 'active' : ''),
            onclick: () => onSelectInstrument(Number(index)),
            title: `${meta.longName} - ${meta.description}`,
          },
          `${meta.emoji} ${meta.shortName}`
        )
      )
    )
  )
