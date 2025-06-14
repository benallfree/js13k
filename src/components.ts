import van, { State } from 'vanjs-core'
import { Beat } from './storage'

const { div, button, style, input, select, option, span, h3, a } = van.tags

// Status bar component
export const StatusBar = (statusMessage: State<string>, statusVisible: State<boolean>) =>
  div(
    {
      class: () => `status-bar ${statusVisible.val ? 'visible' : ''}`
    },
    () => statusMessage.val
  )

// X Handle Modal component
export const XHandleModal =
  (
    showXHandleModal: State<boolean>,
    tempXHandle: State<string>,
    saveXHandle: () => void,
    skipXHandle: () => void
  ) =>
  () =>
    showXHandleModal.val
      ? div(
          { class: 'modal-overlay' },
          div(
            { class: 'modal' },
            h3('Welcome to Beat Maker! 🎵'),
            div("What's your X (Twitter) handle?"),
            div(
              { style: 'color: #999; font-size: 12px; margin: 10px 0;' },
              'This will be included when you share beats (optional)'
            ),
            input({
              type: 'text',
              placeholder: 'username (without @)',
              value: () => tempXHandle.val,
              oninput: (e: Event) => {
                tempXHandle.val = (e.target as HTMLInputElement).value
              },
              onkeydown: (e: KeyboardEvent) => {
                if (e.key === 'Enter') {
                  saveXHandle()
                }
              }
            }),
            div(
              { class: 'modal-buttons' },
              button({ class: 'primary', onclick: saveXHandle }, 'Save'),
              button({ class: 'secondary', onclick: skipXHandle }, 'Skip')
            )
          )
        )
      : ''

// Beat name input component
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
      }
    }),
    () => (isModified.val ? span({ class: 'modified' }, '*') : '')
  )

// Authors display component
export const AuthorsDisplay = (authors: string[]) =>
  authors.length > 0
    ? div(
        {
          class: 'current-beat-authors',
          style: 'margin-bottom: 10px; font-size: 12px; color: #888;'
        },
        'Authors: ',
        ...authors
          .map((author, index) => [
            a(
              {
                href: `https://twitter.com/${author}`,
                target: '_blank',
                rel: 'noopener noreferrer',
                style: 'color: #4a9eff; text-decoration: none; margin-right: 8px;'
              },
              `@${author}`
            ),
            index < authors.length - 1 ? ', ' : ''
          ])
          .flat()
      )
    : ''

// Library controls component
export const LibraryControls = (
  showLibrary: State<boolean>,
  onSave: () => void,
  onNew: () => void,
  onShare: () => void
) =>
  div(
    { class: 'library-controls' },
    button({ onclick: onSave }, 'Save Beat'),
    button({ onclick: onNew }, 'New Beat'),
    button({ onclick: () => (showLibrary.val = !showLibrary.val) }, () =>
      showLibrary.val ? 'Hide Library' : 'Show Library'
    ),
    button({ onclick: onShare }, 'Share Beat')
  )

// Library panel component
export const LibraryPanel =
  (
    showLibrary: State<boolean>,
    savedBeats: State<Beat[]>,
    formatDate: (timestamp: number) => string,
    onLoad: (beat: Beat) => void,
    onDelete: (beatName: string) => void
  ) =>
  () =>
    showLibrary.val
      ? div(
          { class: 'library-panel' },
          h3(`Beat Library (${savedBeats.val.length} beats)`),
          savedBeats.val.length === 0
            ? div('No saved beats yet. Create and save your first beat!')
            : div(
                { class: 'beat-list' },
                ...savedBeats.val.map((beat) =>
                  div(
                    { class: 'beat-item' },
                    div(
                      { class: 'beat-info' },
                      div(beat.name),
                      div(
                        { style: 'font-size: 12px; color: #999;' },
                        `Modified: ${formatDate(beat.modified)}`
                      ),
                      beat.authors && beat.authors.length > 0
                        ? div(
                            { class: 'authors' },
                            'Authors: ',
                            ...beat.authors
                              .map((author, index) => [
                                a(
                                  {
                                    href: `https://twitter.com/${author}`,
                                    target: '_blank',
                                    rel: 'noopener noreferrer'
                                  },
                                  `@${author}`
                                ),
                                index < beat.authors.length - 1 ? ', ' : ''
                              ])
                              .flat()
                          )
                        : ''
                    ),
                    div(
                      { class: 'beat-actions' },
                      button({ onclick: () => onLoad(beat) }, 'Load'),
                      button(
                        {
                          onclick: () => onDelete(beat.name),
                          style: 'background: #d44; color: white;'
                        },
                        'Delete'
                      )
                    )
                  )
                )
              )
        )
      : ''

// Main controls component
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
            onclick: () => onSelectInstrument(i)
          },
          inst
        )
      )
    )
  )

// Grid component
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
                if (val) classes += ` ${['k', 's', 'h'][val - 1]}`
                if (playing.val && trailIndex >= 0) classes += ` trail-${trailIndex}`
                if (isPlaying) classes += ' playing'

                return classes
              },
              onclick: () => onToggleCell(row, col)
            })
          )
      )
  )
