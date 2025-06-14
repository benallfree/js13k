import van from 'vanjs-core'
import {
  AuthorsDisplay,
  BeatNameInput,
  Grid,
  LibraryControls,
  LibraryPanel,
  MainControls,
  StatusBar,
  styles,
  XHandleModal
} from './components'
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

// Add styles
style(styles)

// Main app
const App = () => {
  return div(
    StatusBar(statusMessage, statusVisible),
    XHandleModal(showXHandleModal, tempXHandle, saveXHandle, skipXHandle),
    BeatNameInput(currentBeatName, isModified, (value) => {
      currentBeatName.val = value
      isModified.val = true
    }),
    AuthorsDisplay(sharedBeatAuthors.val),
    LibraryControls(showLibrary, saveBeat, newBeat, shareBeat),
    LibraryPanel(showLibrary, savedBeats, formatDate, loadBeat, deleteBeat),
    MainControls(playing, instruments, selectedInstrument, togglePlay, (index) => {
      selectedInstrument.val = index
    }),
    Grid(grid, playing, playingCells, stepHistory, toggleCell)
  )
}

// Initialize app
van.add(document.getElementById('app')!, App())

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
