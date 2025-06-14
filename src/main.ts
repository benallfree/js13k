import van from 'vanjs-core'

const { div, button, style, input, select, option, span, h3 } = van.tags

// Audio context
const ctx = new AudioContext()

// Beat library interface
interface Beat {
  name: string
  grid: number[][]
  created: number
  modified: number
}

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

const loadBeatsFromStorage = () => {
  try {
    const stored = localStorage.getItem(BEATS_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

const saveBeatsToStorage = (beats: Beat[]) => {
  try {
    localStorage.setItem(BEATS_STORAGE_KEY, JSON.stringify(beats))
  } catch (e) {
    console.error('Failed to save beats:', e)
    showStatus('❌ Failed to save beat', 3000)
  }
}

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

  const beat: Beat = {
    name: beatName,
    grid: grid.val.map((row) => [...row]), // Deep copy
    created: existingIndex >= 0 ? beats[existingIndex].created : now,
    modified: now
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

  showStatus(isUpdate ? `💾 Beat "${beatName}" updated` : `✅ Beat "${beatName}" saved`)
}

const loadBeat = (beat: Beat) => {
  grid.val = beat.grid.map((row) => [...row]) // Deep copy
  currentBeatName.val = beat.name
  isModified.val = false
  showLibrary.val = false
  updateUrl()
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
  updateUrl()
  showStatus('📝 New beat created')
}

// Initialize beats library
savedBeats.val = loadBeatsFromStorage()

// URL state management
const encodeGrid = (gridData: number[][]) => {
  return gridData
    .flat()
    .map((v) => v.toString(4))
    .join('')
}

const decodeGrid = (encoded: string) => {
  if (!encoded || encoded.length !== 256) return null
  const flat = encoded.split('').map((c) => parseInt(c, 4) || 0)
  const result = []
  for (let i = 0; i < 16; i++) {
    result.push(flat.slice(i * 16, (i + 1) * 16))
  }
  return result
}

const updateUrl = () => {
  const encoded = encodeGrid(grid.val)
  if (encoded !== '0'.repeat(256)) {
    window.location.hash = encoded
  } else {
    window.location.hash = ''
  }
}

const loadFromUrl = () => {
  const hash = window.location.hash.slice(1)
  if (hash) {
    const decoded = decodeGrid(hash)
    if (decoded) {
      grid.val = decoded
      currentBeatName.val = 'Shared Beat'
      isModified.val = true
      showStatus('🔗 Shared beat loaded')
    }
  }
}

const shareBeat = () => {
  const url = `${window.location.origin}${window.location.pathname}#${encodeGrid(grid.val)}`
  navigator.clipboard
    .writeText(url)
    .then(() => {
      showStatus('📋 Beat URL copied to clipboard!')
    })
    .catch(() => {
      prompt('Copy this URL to share your beat:', url)
      showStatus('🔗 Share URL generated')
    })
}

const instruments = ['K', 'S', 'H'] // Kick, Snare, Hi-hat

// Sound generators
const sounds = {
  0: () => {
    // Kick
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain).connect(ctx.destination)
    osc.frequency.setValueAtTime(60, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
    osc.start()
    osc.stop(ctx.currentTime + 0.3)
  },
  1: () => {
    // Snare
    const noise = ctx.createBufferSource()
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.2, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
    const filter = ctx.createBiquadFilter()
    const gain = ctx.createGain()
    noise.buffer = buffer
    noise.connect(filter).connect(gain).connect(ctx.destination)
    filter.frequency.value = 1000
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2)
    noise.start()
  },
  2: () => {
    // Hi-hat
    const noise = ctx.createBufferSource()
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
    const filter = ctx.createBiquadFilter()
    const gain = ctx.createGain()
    noise.buffer = buffer
    noise.connect(filter).connect(gain).connect(ctx.destination)
    filter.type = 'highpass'
    filter.frequency.value = 7000
    gain.gain.setValueAtTime(0.1, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1)
    noise.start()
  }
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
  updateUrl()
}

// Format date for display
const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString()
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
                      )
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

// Initialize from URL on page load
loadFromUrl()

// Listen for hash changes
window.addEventListener('hashchange', loadFromUrl)
