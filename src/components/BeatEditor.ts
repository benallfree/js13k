import van from 'vanjs-core'
import {
  currentBeatId,
  currentBeatName,
  currentStep,
  grid,
  isModified,
  loadBeat,
  newBeat,
  playing,
  playingCells,
  saveBeat,
  savedBeats,
  selectedInstrument,
  sharedBeatAuthors,
  stepHistory,
} from '../beatState'
import { a, div, span } from '../common/tags'
import { sounds } from '../sounds'
import { Beat, generateGuid, loadBeatsFromStorage, loadXHandleFromStorage, saveXHandleToStorage } from '../storage'
import { shareBeat as createShareUrl } from '../url'
import {
  AuthorsDisplay,
  BeatNameInput,
  Button,
  ClearBeatModal,
  Grid,
  MainControls,
  SplashPage,
  StatusBar,
  XHandleModal,
} from './index'

// Status bar state
const statusMessage = van.state('')
const statusVisible = van.state(false)
let statusTimeoutId: ReturnType<typeof setTimeout>

// X Handle state and modal
const xHandle = van.state('')
const showXHandleModal = van.state(false)
const tempXHandle = van.state('')

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

  // If we're updating an existing beat with a different name, let the user rename it
  if (currentBeatId.val) {
    const beats = loadBeatsFromStorage()
    const storedBeat = beats.find((b) => b.id === currentBeatId.val)
    if (storedBeat && currentBeatName.val !== storedBeat.name) {
      // This case is now handled by the EditableInput component
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

const handleBeatNameSave = (newName: string) => {
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

  if (saveBeat(newName, authors)) {
    showStatus(`💾 Beat renamed to "${newName}"`)
  }
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

// Cell interaction handling
const toggleCell = (row: number, col: number) => {
  if (playing.val) return

  const newGrid = [...grid.val]
  if (!newGrid[row]) newGrid[row] = new Array(16).fill(0)

  const currentValue = newGrid[row][col] || 0
  newGrid[row][col] = currentValue === selectedInstrument.val + 1 ? 0 : selectedInstrument.val + 1

  grid.val = newGrid
  isModified.val = true

  // Play sample immediately when placed
  if (newGrid[row][col]) {
    const soundIndex = newGrid[row][col] - 1
    if (sounds[soundIndex as keyof typeof sounds]) {
      sounds[soundIndex as keyof typeof sounds]()
    }
  }
}

// Music playback logic
const playStep = () => {
  if (!playing.val) return

  // Clear previous playing cells
  playingCells.val = new Set()

  const newPlayingCells = new Set<string>()

  // Play sounds for current step
  grid.val.forEach((row, rowIndex) => {
    if (row && row[currentStep.val]) {
      const soundIndex = row[currentStep.val] - 1
      newPlayingCells.add(`${rowIndex}-${currentStep.val}`)
      if (sounds[soundIndex as keyof typeof sounds]) {
        sounds[soundIndex as keyof typeof sounds]()
      }
    }
  })

  playingCells.val = newPlayingCells

  // Update step history for visual trail
  const newHistory = [currentStep.val, ...stepHistory.val.slice(0, 3)]
  stepHistory.val = newHistory

  // Move to next step
  currentStep.val = (currentStep.val + 1) % 16
}

// Save X handle
const saveXHandle = () => {
  xHandle.val = tempXHandle.val
  saveXHandleToStorage(tempXHandle.val)
  showXHandleModal.val = false
  if (tempXHandle.val) {
    showStatus(`👋 Welcome, @${tempXHandle.val}!`)
  }
}

const skipXHandle = () => {
  showXHandleModal.val = false
  showStatus('👋 Welcome to Beat Threads!')
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

// Format date helper
const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

interface BeatEditorProps {
  beatId: string
}

export const BeatEditor = ({ beatId }: BeatEditorProps) => {
  // Initialize app and load beat if beatId is provided
  const initializeEditor = () => {
    // Load X handle from storage
    xHandle.val = loadXHandleFromStorage()

    // Load beats library
    savedBeats.val = loadBeatsFromStorage()

    // Load specific beat
    const beats = loadBeatsFromStorage()
    const beat = beats.find((b) => b.id === beatId)
    if (beat) {
      loadBeat(beat)
      showStatus(`📂 Loaded "${beat.name}"`)
    } else {
      showStatus('❌ Beat not found', 3000)
      // Redirect to home if beat not found
      window.history.pushState({}, '', '/')
      window.dispatchEvent(new PopStateEvent('popstate'))
      return
    }

    // Show X handle modal if not set
    if (!xHandle.val) {
      showXHandleModal.val = true
    }
  }

  // Initialize on component creation
  initializeEditor()

  return div(
    { class: 'app' },
    SplashPage(),
    div(
      { class: 'main-content' },
      // Breadcrumb navigation
      div(
        { class: 'breadcrumb', style: 'margin-bottom: 15px; padding: 10px 0; border-bottom: 1px solid #333;' },
        a(
          {
            href: '/',
            onclick: (e: Event) => {
              e.preventDefault()
              window.history.pushState({}, '', '/')
              window.dispatchEvent(new PopStateEvent('popstate'))
            },
          },
          '🏠'
        ),
        span(' > '),
        span(() => currentBeatName.val || 'New Beat')
      ),
      StatusBar(statusMessage, statusVisible),
      XHandleModal(showXHandleModal, tempXHandle, saveXHandle, skipXHandle),
      ClearBeatModal(showClearModal, confirmClearBeat, cancelClearBeat),
      BeatNameInput(currentBeatName, isModified, handleBeatNameSave),
      // Updated LibraryControls without the library button
      div(
        { class: 'flex flex-wrap gap-2 mb-4' },
        Button({
          onClick: handleSaveBeat,
          variant: 'primary',
          children: '💾 Save',
        }),
        Button({
          onClick: handleClearBeat,
          variant: 'danger',
          children: '🗑️ Clear',
        }),
        Button({
          onClick: shareBeat,
          variant: 'secondary',
          children: '🔗 Share',
        })
      ),
      MainControls(playing, selectedInstrument, togglePlay, (index) => {
        selectedInstrument.val = index
      }),
      Grid(grid, playing, playingCells, stepHistory, toggleCell),
      AuthorsDisplay(sharedBeatAuthors),
      () => {
        console.log('ID display check - currentBeatId.val:', currentBeatId.val, 'type:', typeof currentBeatId.val)
        return currentBeatId.val
          ? div(
              { style: 'color: #666; font-size: 11px; margin-top: 10px; font-family: monospace;' },
              `ID: ${currentBeatId.val}`
            )
          : ''
      }
    )
  )
}
