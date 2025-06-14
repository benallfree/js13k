import van from 'vanjs-core'
import { instruments, sounds } from './sounds'
import {
  Beat,
  loadBeatsFromStorage,
  loadXHandleFromStorage,
  saveBeatsToStorage,
  saveXHandleToStorage
} from './storage'
import { shareBeat as createShareUrl, loadFromUrl, updateUrl } from './url'

const { div, button, style, input, select, option, span, h3, a } = van.tags

// Beat maker state - using van.state for reactivity
const playing = van.state(false)
const currentStep = van.state(0)
const selectedInstrument = van.state(0)
const grid = van.state(
  Array(16)
    .fill(0)
    .map(() => Array(16).fill(0))
) // 16x16 grid
const playingCells = van.state(new Set<string>()) // Track cells currently playing animation
const stepHistory = van.state<number[]>([]) // Track recent steps for fade trail

// Beat library state
const currentBeatName = van.state('Untitled Beat')
const savedBeats = van.state<Beat[]>([])
const showLibrary = van.state(false)
const isModified = van.state(false)

// Status bar state
const statusMessage = van.state('')
const statusVisible = van.state(false)
let statusTimeoutId: ReturnType<typeof setTimeout>

// X Handle state and modal
const xHandle = van.state('')
const showXHandleModal = van.state(false)
const tempXHandle = van.state('')

// Shared beat authors state
const sharedBeatAuthors = van.state<string[]>([])

// Status bar functions
const showStatus = (message: string, duration = 2000) => {
  // Clear any existing timeout
  if (statusTimeoutId) {
    clearTimeout(statusTimeoutId)
  }

  statusMessage.val = message
  statusVisible.val = true

  // Auto-hide after duration
  statusTimeoutId = setTimeout(() => {
    statusVisible.val = false
  }, duration)
}

let intervalId: ReturnType<typeof setInterval>

// Beat library functions
const BEATS_STORAGE_KEY = 'js13k-beats-library'
const X_HANDLE_STORAGE_KEY = 'js13k-x-handle'

const saveBeat = (name?: string) => {
  const beatName = name || currentBeatName.val
  if (!beatName.trim()) {
    showStatus('⚠️ Please enter a beat name', 3000)
    return
  }

  const beats = loadBeatsFromStorage()
  const existingIndex = beats.findIndex((b: Beat) => b.name === beatName)
  const now = Date.now()
  const isUpdate = existingIndex >= 0

  // Handle authors array
  let authors: string[] = []
  if (existingIndex >= 0) {
    // Beat exists, get current authors
    authors = beats[existingIndex].authors || []
  } else {
    // New beat, start with any shared beat authors
    authors = [...sharedBeatAuthors.val]
  }

  // Add current user to authors if they have an X handle and aren't already in the list
  if (xHandle.val && !authors.includes(xHandle.val)) {
    authors.push(xHandle.val)
  }

  const beat: Beat = {
    name: beatName,
    grid: grid.val.map((row) => [...row]), // Deep copy
    created: existingIndex >= 0 ? beats[existingIndex].created : now,
    modified: now,
    authors: authors
  }

  if (existingIndex >= 0) {
    beats[existingIndex] = beat
  } else {
    beats.push(beat)
  }

  saveBeatsToStorage(beats)
  savedBeats.val = [...beats]
  currentBeatName.val = beatName
  isModified.val = false
  sharedBeatAuthors.val = [] // Clear shared beat authors after saving

  showStatus(isUpdate ? `💾 Beat "${beatName}" updated` : `✅ Beat "${beatName}" saved`)
}

const loadBeat = (beat: Beat) => {
  grid.val = beat.grid.map((row) => [...row]) // Deep copy
  currentBeatName.val = beat.name
  isModified.val = false
  sharedBeatAuthors.val = [] // Clear shared beat authors
  showLibrary.val = false
  updateUrl(grid.val)
  showStatus(`📂 Loaded "${beat.name}"`)
}

const deleteBeat = (beatName: string) => {
  if (confirm(`Delete beat "${beatName}"?`)) {
    const beats = loadBeatsFromStorage().filter((b: Beat) => b.name !== beatName)
    saveBeatsToStorage(beats)
    savedBeats.val = [...beats]

    if (currentBeatName.val === beatName) {
      newBeat()
    }

    showStatus(`🗑️ Deleted "${beatName}"`)
  }
}

const newBeat = () => {
  grid.val = Array(16)
    .fill(0)
    .map(() => Array(16).fill(0))
  currentBeatName.val = 'Untitled Beat'
  isModified.val = false
  sharedBeatAuthors.val = [] // Clear shared beat authors
  updateUrl(grid.val)
  showStatus('📝 New beat created')
}

// Initialize beats library
savedBeats.val = loadBeatsFromStorage()

const shareBeat = () => {
  const beatData: Beat = {
    name: currentBeatName.val,
    grid: grid.val,
    authors: [...(savedBeats.val.find((b) => b.name === currentBeatName.val)?.authors || [])],
    created: Date.now(),
    modified: Date.now()
  }

  const url = createShareUrl(beatData, xHandle.val)

  navigator.clipboard
    .writeText(url)
    .then(() => {
      const authorsText =
        beatData.authors.length > 0 ? ` by ${beatData.authors.map((a) => `@${a}`).join(', ')}` : ''
      showStatus(`📋 Beat URL copied to clipboard!${authorsText}`)
    })
    .catch(() => {
      prompt('Copy this URL to share your beat:', url)
      showStatus('🔗 Share URL generated')
    })
}

// Play step
const playStep = () => {
  const currentGrid = grid.val
  const step = currentStep.val
  const newPlayingCells = new Set<string>()

  for (let i = 0; i < 16; i++) {
    if (currentGrid[i][step]) {
      sounds[(currentGrid[i][step] - 1) as keyof typeof sounds]()
      const cellKey = `${i}-${step}`
      newPlayingCells.add(cellKey)
    }
  }

  // Update playing cells
  playingCells.val = newPlayingCells

  // Update step history for trail effect
  const newHistory = [step, ...stepHistory.val.slice(0, 3)]
  stepHistory.val = newHistory

  // Clear playing animation after a short delay
  setTimeout(() => {
    playingCells.val = new Set()
  }, 200)

  currentStep.val = (currentStep.val + 1) % 16
}

// Toggle play/stop
const togglePlay = () => {
  if (playing.val) {
    clearInterval(intervalId)
    playing.val = false
    playingCells.val = new Set() // Clear any playing animations
    stepHistory.val = [] // Clear trail history
    showStatus('⏸️ Stopped')
  } else {
    playing.val = true
    intervalId = setInterval(playStep, 120) // ~125 BPM
    showStatus('▶️ Playing')
  }
}

// Toggle cell
const toggleCell = (row: number, col: number) => {
  const newGrid = grid.val.map((r) => [...r]) // Create deep copy
  newGrid[row][col] =
    newGrid[row][col] === selectedInstrument.val + 1 ? 0 : selectedInstrument.val + 1
  grid.val = newGrid
  isModified.val = true
  updateUrl(grid.val)
}

// Format date for display
const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString()
}

// X Handle functions
const saveXHandle = () => {
  const handle = tempXHandle.val.trim()
  if (handle) {
    xHandle.val = handle
    saveXHandleToStorage(handle)
    showXHandleModal.val = false
    showStatus(`✅ X handle "@${handle}" saved`)
  }
}

const skipXHandle = () => {
  showXHandleModal.val = false
  showStatus('⏭️ X handle skipped')
}

// Initialize app
const initializeApp = () => {
  // Load X handle from storage
  xHandle.val = loadXHandleFromStorage()

  // Load beats library
  savedBeats.val = loadBeatsFromStorage()

  // Load from URL
  loadFromUrl((gridData, name, authors) => {
    grid.val = gridData
    currentBeatName.val = name
    isModified.val = true
    sharedBeatAuthors.val = authors
  }, showStatus)

  // Show X handle modal if not set
  if (!xHandle.val) {
    showXHandleModal.val = true
  }
}

// App component
van.add(
  document.getElementById('app')!,
  style(`
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
  `),

  // Status bar
  div(
    {
      class: () => `status-bar ${statusVisible.val ? 'visible' : ''}`
    },
    () => statusMessage.val
  ),

  // X Handle Modal
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
      : '',

  // Beat name and save controls
  div(
    { class: 'beat-name' },
    span('Beat Name:'),
    input({
      type: 'text',
      value: () => currentBeatName.val,
      oninput: (e: Event) => {
        currentBeatName.val = (e.target as HTMLInputElement).value
      }
    }),
    () => (isModified.val ? span({ class: 'modified' }, '*') : '')
  ),

  // Current beat authors display
  () => {
    const currentBeat = savedBeats.val.find((b) => b.name === currentBeatName.val)
    const authors = currentBeat?.authors || sharedBeatAuthors.val || []

    // Debug: Log authors info
    if (currentBeat) {
      console.log('Current beat:', currentBeat.name, 'Authors:', currentBeat.authors)
    }

    return authors.length > 0
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
  },

  // Library controls
  div(
    { class: 'library-controls' },
    button({ onclick: () => saveBeat() }, 'Save Beat'),
    button({ onclick: newBeat }, 'New Beat'),
    button({ onclick: () => (showLibrary.val = !showLibrary.val) }, () =>
      showLibrary.val ? 'Hide Library' : 'Show Library'
    ),
    button({ onclick: shareBeat }, 'Share Beat')
  ),

  // Library panel
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
                      // Show authors if they exist
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
                      button({ onclick: () => loadBeat(beat) }, 'Load'),
                      button(
                        {
                          onclick: () => deleteBeat(beat.name),
                          style: 'background: #d44; color: white;'
                        },
                        'Delete'
                      )
                    )
                  )
                )
              )
        )
      : '',

  // Main controls
  div(
    { class: 'controls' },
    button({ onclick: togglePlay }, () => (playing.val ? 'Stop' : 'Play'))
  ),

  div(
    { class: 'instruments' },
    ...instruments.map((inst, i) =>
      button(
        {
          class: () => (selectedInstrument.val === i ? 'active' : ''),
          onclick: () => (selectedInstrument.val = i)
        },
        inst
      )
    )
  ),

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
              onclick: () => toggleCell(row, col)
            })
          )
      )
  )
)

// Initialize app instead of individual components
initializeApp()

// Listen for hash changes and URL parameter changes
window.addEventListener('hashchange', () => {
  loadFromUrl((gridData, name, authors) => {
    grid.val = gridData
    currentBeatName.val = name
    isModified.val = true
    sharedBeatAuthors.val = authors
  }, showStatus)
})
window.addEventListener('popstate', () => {
  loadFromUrl((gridData, name, authors) => {
    grid.val = gridData
    currentBeatName.val = name
    isModified.val = true
    sharedBeatAuthors.val = authors
  }, showStatus)
})
