import van from 'vanjs-core'
import {
  currentBeatId,
  currentBeatName,
  currentStep,
  deleteBeat,
  grid,
  isModified,
  loadBeat,
  newBeat,
  originalBeatName,
  playing,
  playingCells,
  saveBeat,
  savedBeats,
  selectedInstrument,
  showLibrary,
  stepHistory,
} from '../beatState'
import { sounds } from '../sounds'
import { Beat, generateGuid, loadBeatsFromStorage, loadXHandleFromStorage, saveXHandleToStorage } from '../storage'
import { shareBeat as createShareUrl, loadFromUrl } from '../url'
import {
  AuthorsDisplay,
  BeatNameInput,
  ClearBeatModal,
  Grid,
  LibraryControls,
  LibraryPanel,
  MainControls,
  RenameBeatModal,
  StatusBar,
  XHandleModal,
} from './index'

const { div } = van.tags

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

// Add rename modal state
const showRenameModal = van.state(false)
const tempBeatName = van.state('')

// Add clear modal state
const showClearModal = van.state(false)

// Status bar functions
const showStatus = (message: string, duration = 2000) => {
  if (statusTimeoutId) {
    clearTimeout(statusTimeoutId)
  }

  statusMessage.val = message
  statusVisible.val = true

  statusTimeoutId = setTimeout(() => {
    statusVisible.val = false
  }, duration)
}

let intervalId: ReturnType<typeof setInterval>

const handleSaveBeat = () => {
  if (!currentBeatName.val.trim()) {
    showStatus('⚠️ Please enter a beat name', 3000)
    return
  }

  // If we're updating an existing beat with a different name
  if (currentBeatId.val) {
    const beats = loadBeatsFromStorage()
    const storedBeat = beats.find((b) => b.id === currentBeatId.val)
    if (storedBeat && currentBeatName.val !== storedBeat.name) {
      tempBeatName.val = currentBeatName.val
      showRenameModal.val = true
      return
    }
  }

  // Handle authors array
  let authors: string[] = []
  if (currentBeatId.val) {
    const beats = loadBeatsFromStorage()
    const existingBeat = beats.find((b) => b.id === currentBeatId.val)
    authors = existingBeat?.authors || []
  }

  // Merge with shared beat authors from URL
  authors = [...new Set([...authors, ...sharedBeatAuthors.val])]

  // Add current user to authors if they have an X handle and aren't already in the list
  if (xHandle.val && !authors.includes(xHandle.val)) {
    authors.push(xHandle.val)
  }

  if (saveBeat(currentBeatName.val, authors)) {
    showStatus(
      currentBeatId.val ? `💾 Beat "${currentBeatName.val}" updated` : `✅ Beat "${currentBeatName.val}" saved`
    )
  }
}

const confirmRename = () => {
  if (tempBeatName.val.trim()) {
    // Handle authors array
    let authors: string[] = []
    if (currentBeatId.val) {
      const beats = loadBeatsFromStorage()
      const existingBeat = beats.find((b) => b.id === currentBeatId.val)
      authors = existingBeat?.authors || []
    }

    // Add current user to authors if they have an X handle and aren't already in the list
    if (xHandle.val && !authors.includes(xHandle.val)) {
      authors.push(xHandle.val)
    }

    if (saveBeat(tempBeatName.val, authors)) {
      showRenameModal.val = false
      showStatus(`💾 Beat renamed to "${tempBeatName.val}"`)
    }
  }
}

const cancelRename = () => {
  currentBeatName.val = originalBeatName.val
  showRenameModal.val = false
}

const handleClearBeat = () => {
  if (isModified.val) {
    showClearModal.val = true
  } else {
    confirmClearBeat()
  }
}

const confirmClearBeat = () => {
  newBeat()
  showClearModal.val = false
  showStatus('🧹 Beat cleared')
}

const cancelClearBeat = () => {
  showClearModal.val = false
}

const shareBeat = () => {
  const beatData: Beat = {
    id: currentBeatId.val || generateGuid(),
    name: currentBeatName.val,
    grid: grid.val,
    authors: [
      ...new Set([
        ...(savedBeats.val.find((b) => b.id === currentBeatId.val)?.authors || []),
        ...sharedBeatAuthors.val,
      ]),
    ],
    created: Date.now(),
    modified: Date.now(),
  }

  const url = createShareUrl(beatData, xHandle.val)

  navigator.clipboard
    .writeText(url)
    .then(() => {
      showStatus(`📋 Beat URL copied to clipboard!`)
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
  newGrid[row][col] = newGrid[row][col] === selectedInstrument.val + 1 ? 0 : selectedInstrument.val + 1
  grid.val = newGrid
  isModified.val = true
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
  loadFromUrl((gridData, name, authors, id) => {
    grid.val = gridData
    currentBeatName.val = name
    originalBeatName.val = name
    currentBeatId.val = id || generateGuid() // Use ID from URL if available
    isModified.val = true
    sharedBeatAuthors.val = authors
  }, showStatus)

  // Show X handle modal if not set
  if (!xHandle.val) {
    showXHandleModal.val = true
  }
}

// Add styles
import '../styles.css'

// Initialize app
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

export const Home = () => {
  return div(
    StatusBar(statusMessage, statusVisible),
    XHandleModal(showXHandleModal, tempXHandle, saveXHandle, skipXHandle),
    RenameBeatModal(showRenameModal, currentBeatId, tempBeatName, confirmRename, cancelRename),
    ClearBeatModal(showClearModal, confirmClearBeat, cancelClearBeat),
    BeatNameInput(currentBeatName, isModified, (value) => {
      currentBeatName.val = value
      isModified.val = true
    }),
    AuthorsDisplay(sharedBeatAuthors),
    LibraryControls(showLibrary, handleSaveBeat, handleClearBeat, shareBeat),
    LibraryPanel(showLibrary, savedBeats, formatDate, loadBeat, deleteBeat),
    MainControls(playing, selectedInstrument, togglePlay, (index) => {
      selectedInstrument.val = index
    }),
    Grid(grid, playing, playingCells, stepHistory, toggleCell),
    () =>
      currentBeatId.val
        ? div(
            { style: 'color: #666; font-size: 11px; margin-top: 10px; font-family: monospace;' },
            `ID: ${currentBeatId.val}`
          )
        : ''
  )
}
