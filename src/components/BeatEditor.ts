import {
  currentBeatId,
  currentBeatName,
  currentStep,
  deleteBeat,
  getAuthorsForCurrentBeat,
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
} from '@/beatState'
import { BottomTray } from '@/common/BottomTray'
import { Modal } from '@/common/Modal'
import { Link } from '@/common/router'
import { _routerPathname } from '@/common/router/_state'
import { flash } from '@/common/statusManager'
import { div, input, span } from '@/common/tags'
import { xHandle } from '@/common/xHandleManager'
import { sampleMetadata, sounds } from '@/sounds'
import { Beat, generateGuid, loadBeatsFromStorage } from '@/storage'
import { shareBeat as createShareUrl } from '@/url'
import van from 'vanjs-core'
import { AuthorsDisplay, ClearBeatModal, Grid, PatchModal, ShareModal, SplashPage } from './index'
import sharedStyles from './Shared.module.css'

// Add clear modal state
const showClearModal = van.state(false)

// Add delete modal state
const showDeleteModal = van.state(false)

// Beat name editing state
const showBeatNameModal = van.state(false)
const tempBeatName = van.state('')

// Modal states for bottom tray
const showPatchModal = van.state(false)
const showShareModal = van.state(false)
const shareUrl = van.state('')

let intervalId: ReturnType<typeof setInterval>

// Add cleanup function to stop playback when navigating away
const stopPlayback = () => {
  if (intervalId) {
    clearInterval(intervalId)
  }
  playing.val = false
  playingCells.val = new Set()
  stepHistory.val = []
}

// Auto-save function that saves silently without status messages
const autoSave = () => {
  if (!currentBeatName.val.trim()) {
    return // Don't auto-save if no name is set
  }

  const authors = getAuthorsForCurrentBeat()
  saveBeat(currentBeatName.val, authors)
}

const handleSaveBeat = () => {
  if (!currentBeatName.val.trim()) {
    flash('⚠️ Please enter a beat name', 3000)
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

  const authors = getAuthorsForCurrentBeat()

  if (saveBeat(currentBeatName.val, authors)) {
    flash(currentBeatId.val ? `💾 Beat "${currentBeatName.val}" updated` : `✅ Beat "${currentBeatName.val}" saved`)
  }
}

const handleBeatNameSave = (newName: string) => {
  const authors = getAuthorsForCurrentBeat()

  if (saveBeat(newName, authors)) {
    flash(`💾 Beat renamed to "${newName}"`)
  }
}

const openBeatNameModal = () => {
  tempBeatName.val = currentBeatName.val
  showBeatNameModal.val = true
}

const saveBeatNameFromModal = () => {
  if (tempBeatName.val.trim()) {
    handleBeatNameSave(tempBeatName.val.trim())
  }
  showBeatNameModal.val = false
}

const cancelBeatNameModal = () => {
  showBeatNameModal.val = false
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
  flash('🧹 Beat cleared')
}

const cancelClearBeat = () => {
  showClearModal.val = false
}

// Cell interaction handling
const toggleCell = (row: number, col: number) => {
  const newGrid = [...grid.val]
  if (!newGrid[row]) newGrid[row] = new Array(16).fill(0)

  const currentValue = newGrid[row][col] || 0
  newGrid[row][col] = currentValue === selectedInstrument.val + 1 ? 0 : selectedInstrument.val + 1

  grid.val = newGrid
  isModified.val = true

  // Auto-save after each edit
  autoSave()

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

// Toggle play/stop
const togglePlay = () => {
  if (playing.val) {
    clearInterval(intervalId)
    playing.val = false
    playingCells.val = new Set() // Clear any playing animations
    stepHistory.val = [] // Clear trail history
    flash('⏸️ Stopped')
  } else {
    playing.val = true
    intervalId = setInterval(playStep, 120) // ~125 BPM
    flash('▶️ Playing')
  }
}

// Bottom tray handlers
const handleShowPatchModal = () => {
  showPatchModal.val = true
}

const handleClosePatchModal = () => {
  showPatchModal.val = false
}

const handleSelectPatch = (index: number) => {
  // Wrap state access in a nested function to limit reactivity scope
  ;(() => {
    selectedInstrument.val = index
  })()
}

const handleShowShareModal = () => {
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

  shareUrl.val = createShareUrl(beatData, xHandle.val)
  showShareModal.val = true
}

const handleCloseShareModal = () => {
  showShareModal.val = false
}

const handleCopyUrl = () => {
  navigator.clipboard
    .writeText(shareUrl.val)
    .then(() => {
      flash(`📋 Beat URL copied to clipboard!`)
    })
    .catch(() => {
      prompt('Copy this URL to share your beat:', shareUrl.val)
      flash('🔗 Share URL generated')
    })
}

const handleDeleteBeat = () => {
  showDeleteModal.val = true
}

const confirmDeleteBeat = () => {
  if (currentBeatId.val && currentBeatName.val) {
    deleteBeat(currentBeatId.val)
    flash(`🗑️ Beat "${currentBeatName.val}" deleted`)
    showDeleteModal.val = false
    // Navigate back to home
    window.history.pushState({}, '', '/')
    window.dispatchEvent(new PopStateEvent('popstate'))
  }
}

const cancelDeleteBeat = () => {
  showDeleteModal.val = false
}

interface BeatEditorProps {
  beatId: string
}

export const BeatEditor = ({ beatId }: BeatEditorProps) => {
  // Initialize app and load beat if beatId is provided
  const initializeEditor = () => {
    // Load beats library
    savedBeats.val = loadBeatsFromStorage()

    // Load specific beat
    const beats = loadBeatsFromStorage()
    const beat = beats.find((b) => b.id === beatId)
    if (beat) {
      loadBeat(beat)
      flash(`📂 Loaded "${beat.name}"`)
    } else {
      // If beat not found, create a new beat with the provided beatId
      newBeat()
      currentBeatId.val = beatId
      flash(`✨ Created new beat`)
    }
  }

  // Watch for navigation changes using VanJS reactive system
  const currentBeatEditorPath = `/beats/${beatId}`
  van.derive(() => {
    // If we're navigating away from this beat editor, stop playback
    if (_routerPathname.val !== currentBeatEditorPath && playing.val) {
      stopPlayback()
    }
  })

  // Initialize on component creation
  initializeEditor()

  return div(
    SplashPage(),
    div(
      { class: 'main-content' },
      // Breadcrumb navigation
      div(
        { class: sharedStyles.breadcrumb },
        Link(
          {
            href: '/',
          },
          '🏠'
        ),
        span(' > '),
        span(
          {
            class: sharedStyles.breadcrumbTitle,
            onclick: openBeatNameModal,
          },
          () => currentBeatName.val || 'New Beat',
          () => (isModified.val ? span({ class: sharedStyles.breadcrumbModified }, ' *') : '')
        )
      ),
      ClearBeatModal(showClearModal, confirmClearBeat, cancelClearBeat),
      Modal({
        isOpen: showDeleteModal,
        title: 'Delete Beat',
        content: () => div(`Are you sure you want to delete "${currentBeatName.val}"? This action cannot be undone.`),
        primaryButton: {
          text: 'Delete',
          onClick: confirmDeleteBeat,
        },
        secondaryButton: {
          text: 'Cancel',
          onClick: cancelDeleteBeat,
        },
      }),
      Modal({
        isOpen: showBeatNameModal,
        title: 'Rename Beat',
        content: () =>
          div(
            div('Enter a new name for your beat:'),
            input({
              type: 'text',
              value: () => tempBeatName.val,
              oninput: (e: Event) => {
                tempBeatName.val = (e.target as HTMLInputElement).value
              },
              onkeydown: (e: KeyboardEvent) => {
                if (e.key === 'Enter') {
                  saveBeatNameFromModal()
                }
              },
            })
          ),
        primaryButton: {
          text: 'Rename',
          onClick: saveBeatNameFromModal,
        },
        secondaryButton: {
          text: 'Cancel',
          onClick: cancelBeatNameModal,
        },
      }),
      PatchModal({
        isOpen: showPatchModal,
        selectedInstrument,
        onSelectPatch: handleSelectPatch,
        onClose: handleClosePatchModal,
      }),
      ShareModal({
        isOpen: showShareModal,
        shareUrl: shareUrl.val,
        onClose: handleCloseShareModal,
        onCopyUrl: handleCopyUrl,
      }),
      Grid(grid, playing, playingCells, stepHistory, toggleCell),
      AuthorsDisplay(sharedBeatAuthors)
    ),
    BottomTray({
      icons: [
        {
          children: () => (playing.val ? '⏹️' : '▶️'),
          onClick: togglePlay,
        },
        {
          children: () => {
            const patch = sampleMetadata[selectedInstrument.val]
            return patch ? patch.emoji : '🥁'
          },
          onClick: handleShowPatchModal,
        },
        {
          children: '🔗',
          onClick: handleShowShareModal,
        },
        {
          children: '🗑️',
          onClick: handleDeleteBeat,
        },
      ],
    })
  )
}
