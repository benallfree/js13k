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

// Styles
export const styles = `
  body { font-family: monospace; background: #111; color: #fff; margin: 0; padding: 20px; }
  .status-bar {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.9);
    color: #fff;
    padding: 10px 20px;
    border-radius: 20px;
    border: 1px solid #555;
    font-family: monospace;
    font-size: 14px;
    z-index: 1000;
    backdrop-filter: blur(10px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    transition: all 0.3s ease;
    opacity: 0;
    pointer-events: none;
  }
  .status-bar.visible {
    opacity: 1;
    animation: statusFlash 0.3s ease-out;
  }
  @keyframes statusFlash {
    0% { transform: translateX(-50%) scale(0.8); opacity: 0; }
    50% { transform: translateX(-50%) scale(1.05); }
    100% { transform: translateX(-50%) scale(1); opacity: 1; }
  }
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    backdrop-filter: blur(5px);
  }
  .modal {
    background: #222;
    border: 2px solid #555;
    border-radius: 8px;
    padding: 30px;
    max-width: 400px;
    text-align: center;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
  }
  .modal h3 {
    margin: 0 0 15px 0;
    color: #fff;
  }
  .modal p {
    margin: 0 0 20px 0;
    color: #ccc;
    line-height: 1.4;
  }
  .modal input {
    width: 100%;
    padding: 10px;
    background: #333;
    color: #fff;
    border: 1px solid #555;
    border-radius: 4px;
    font-family: monospace;
    font-size: 14px;
    margin-bottom: 20px;
    box-sizing: border-box;
  }
  .modal input:focus {
    outline: none;
    border-color: #777;
  }
  .modal-buttons {
    display: flex;
    gap: 10px;
    justify-content: center;
  }
  .modal button {
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    font-family: monospace;
    cursor: pointer;
    transition: background 0.2s;
  }
  .modal .primary {
    background: #4a9eff;
    color: white;
  }
  .modal .primary:hover {
    background: #3a8eef;
  }
  .modal .secondary {
    background: #666;
    color: white;
  }
  .modal .secondary:hover {
    background: #777;
  }
  .beat-name { 
    display: flex; 
    align-items: center; 
    gap: 10px; 
    margin-bottom: 10px; 
  }
  .beat-name input { 
    background: #222; 
    color: #fff; 
    border: 1px solid #555; 
    padding: 5px; 
    font-family: monospace; 
  }
  .beat-name .modified { color: #ff6; }
  .library-controls { 
    display: flex; 
    gap: 10px; 
    margin-bottom: 10px; 
    flex-wrap: wrap; 
  }
  .library-panel { 
    background: #222; 
    border: 1px solid #555; 
    padding: 15px; 
    margin: 10px 0; 
    border-radius: 4px; 
  }
  .library-panel h3 { margin: 0 0 10px 0; }
  .beat-list { 
    max-height: 300px; 
    overflow-y: auto; 
  }
  .beat-item { 
    display: flex; 
    justify-content: space-between; 
    align-items: center; 
    padding: 8px; 
    margin: 4px 0; 
    background: #333; 
    border-radius: 3px; 
  }
  .beat-item:hover { background: #444; }
  .beat-info { flex: 1; }
  .beat-actions { 
    display: flex; 
    gap: 5px; 
  }
  .beat-actions button { 
    padding: 3px 8px; 
    font-size: 12px; 
  }
  .authors { 
    font-size: 11px; 
    color: #888; 
    margin-top: 2px; 
  }
  .authors a { 
    color: #4a9eff; 
    text-decoration: none; 
    margin-right: 8px; 
  }
  .authors a:hover { 
    color: #6bb1ff; 
    text-decoration: underline; 
  }
  .grid { display: grid; grid-template-columns: repeat(16, 20px); gap: 2px; margin: 20px 0; }
  .cell { width: 20px; height: 20px; border: 1px solid #333; cursor: pointer; transition: all 0.3s ease; position: relative; }
  .cell.k { background: #f44; }
  .cell.s { background: #4f4; }
  .cell.h { background: #44f; }
  .cell.trail-0 { box-shadow: inset 0 0 0 3px rgba(255, 100, 100, 0.9), 0 0 8px rgba(255, 100, 100, 0.6); }
  .cell.trail-1 { box-shadow: inset 0 0 0 2px rgba(255, 100, 100, 0.7), 0 0 6px rgba(255, 100, 100, 0.4); }
  .cell.trail-2 { box-shadow: inset 0 0 0 2px rgba(255, 100, 100, 0.5), 0 0 4px rgba(255, 100, 100, 0.3); }
  .cell.trail-3 { box-shadow: inset 0 0 0 1px rgba(255, 100, 100, 0.3); }
  .cell.playing { background: #fff !important; }
  .controls { margin: 10px 0; }
  .controls button { margin: 5px; padding: 10px; }
  .instruments button { margin: 2px; padding: 5px 10px; }
  .instruments button.active { background: #555; }
`
