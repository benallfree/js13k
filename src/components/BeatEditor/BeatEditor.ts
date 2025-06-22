import { Breadcrumb, ConfirmationModal, InputModal } from '@/common'
import { BottomTray } from '@/common/BottomTray'
import { ButtonVariant } from '@/common/Button'
import { _routerPathname } from '@/common/router/_state'
import { flash } from '@/common/statusManager'
import { div } from '@/common/tags'
import { classify, mergeAuthors, useModal } from '@/common/utils'
import { xHandle } from '@/common/xHandleManager'
import { playSound, sampleMetadata } from '@/sounds'
import { Beat, loadBeatsFromStorage, loadSamplesFromStorage } from '@/storage'
import { generateGuid } from '@/util/generateGuid'
import { shareBeat as createShareUrl } from '@/util/url'
import van from 'vanjs-core'
import { AuthorsDisplay } from '../AuthorsDisplay'
import { ShareModal } from '../ShareModal'
import { SplashPage } from '../SplashPage'
import styles from '../common.module.css'
import { Grid } from './Grid'
import { PatchModal } from './PatchModal'
import {
  currentBeatId,
  currentBeatName,
  currentSampleMapping,
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
  selectedSampleId,
  sharedBeatAuthors,
  stepHistory,
  updateSampleMapping,
} from './beatState'

// Modal state management using useModal utility
const deleteModal = useModal()
const beatNameModal = useModal()
const patchModal = useModal()
const shareModal = useModal()

// Beat name editing state
const tempBeatName = van.state('')

// Share modal state
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

const handleBeatNameSave = (newName: string) => {
  const authors = getAuthorsForCurrentBeat()

  if (saveBeat(newName, authors)) {
    flash(`💾 Beat renamed to "${newName}"`)
  }
}

const openBeatNameModal = () => {
  tempBeatName.val = currentBeatName.val
  beatNameModal.open()
}

const cancelBeatNameModal = () => {
  beatNameModal.close()
}

// Get current beat's sample mapping
const getCurrentBeatSampleMapping = () => {
  return currentSampleMapping.val
}

// Cell interaction handling
const toggleCell = (row: number, col: number) => {
  console.log(`toggling`)
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
    const sampleMapping = getCurrentBeatSampleMapping()
    playSound(soundIndex, sampleMapping)
  }
}

// Music playback logic
const playStep = () => {
  if (!playing.val) return

  // Clear previous playing cells
  playingCells.val = new Set()

  const newPlayingCells = new Set<string>()
  const sampleMapping = getCurrentBeatSampleMapping()

  // Play sounds for current step
  grid.val.forEach((row, rowIndex) => {
    if (row && row[currentStep.val]) {
      const soundIndex = row[currentStep.val] - 1
      newPlayingCells.add(`${rowIndex}-${currentStep.val}`)
      playSound(soundIndex, sampleMapping)
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
  patchModal.open()
}

const handleClosePatchModal = () => {
  patchModal.close()
}

const handleSelectPatch = (index: number, sampleId?: string) => {
  selectedInstrument.val = index
  if (sampleId) {
    selectedSampleId.val = sampleId
    // Find the custom sample to get its fallback index
    const customSamples = loadSamplesFromStorage()
    const sample = customSamples.find((s) => s.id === sampleId)
    if (sample) {
      updateSampleMapping(index, sampleId, sample.fallbackIdx)
    }
  } else {
    selectedSampleId.val = ''
    // Remove any custom sample mapping for this instrument
    updateSampleMapping(index, '', 0)
  }
}

const handleShowShareModal = () => {
  const existingBeat = savedBeats.val.find((b) => b.id === currentBeatId.val)
  const beatData: Beat = {
    id: currentBeatId.val || generateGuid(),
    name: currentBeatName.val,
    grid: grid.val,
    authors: mergeAuthors(existingBeat?.authors, sharedBeatAuthors.val),
    created: Date.now(),
    modified: Date.now(),
    sampleMapping: Object.keys(currentSampleMapping.val).length > 0 ? currentSampleMapping.val : undefined,
  }

  shareUrl.val = createShareUrl(beatData, xHandle.val)
  shareModal.open()
}

const handleCloseShareModal = () => {
  shareModal.close()
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
  deleteModal.open()
}

const confirmDeleteBeat = () => {
  if (currentBeatId.val && currentBeatName.val) {
    deleteBeat(currentBeatId.val)
    flash(`🗑️ Beat "${currentBeatName.val}" deleted`)
    // Navigate back to home
    window.history.pushState({}, '', '/')
    window.dispatchEvent(new PopStateEvent('popstate'))
  }
}

const cancelDeleteBeat = () => {
  deleteModal.close()
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
    } else {
      // If beat not found, create a new beat with the provided beatId
      newBeat()
      currentBeatId.val = beatId
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
      Breadcrumb({
        items: [
          {
            label: '🏠',
            href: '/',
          },
          {
            label: () => currentBeatName.val || 'New Beat',
            onClick: openBeatNameModal,
            isModified: () => isModified.val,
          },
        ],
      }),
      ConfirmationModal({
        isOpen: deleteModal.isOpen,
        title: 'Delete Beat',
        message: () => `Are you sure you want to delete "${currentBeatName.val}"? This action cannot be undone.`,
        confirmText: 'Delete',
        confirmVariant: ButtonVariant.Danger,
        onConfirm: confirmDeleteBeat,
        onCancel: cancelDeleteBeat,
      }),
      InputModal({
        isOpen: beatNameModal.isOpen,
        title: 'Rename Beat',
        prompt: 'Enter a new name for your beat:',
        inputValue: tempBeatName,
        confirmText: 'Rename',
        onConfirm: handleBeatNameSave,
        onCancel: cancelBeatNameModal,
      }),
      PatchModal({
        isOpen: patchModal.isOpen,
        selectedInstrument,
        selectedSampleId,
        onSelectPatch: handleSelectPatch,
        onClose: handleClosePatchModal,
      }),
      ShareModal({
        isOpen: shareModal.isOpen,
        shareUrl: shareUrl.val,
        onClose: handleCloseShareModal,
        onCopyUrl: handleCopyUrl,
      }),
      Grid(grid, playing, playingCells, stepHistory, toggleCell),
      AuthorsDisplay({
        authors: sharedBeatAuthors,
        ...classify(styles.textSm, styles.textGray, styles.mb2),
      })
    ),
    BottomTray({
      icons: [
        {
          children: () => (playing.val ? '⏹️' : '▶️'),
          onClick: togglePlay,
        },
        {
          children: () => {
            // Show custom sample name if selected, otherwise show stock instrument
            if (selectedSampleId.val) {
              const customSamples = loadSamplesFromStorage()
              const sample = customSamples.find((s) => s.id === selectedSampleId.val)
              const fallbackPatch = sampleMetadata[sample?.fallbackIdx || 0]
              return sample ? `${fallbackPatch?.emoji || '🎵'}` : '🥁'
            } else {
              const patch = sampleMetadata[selectedInstrument.val]
              return patch ? patch.emoji : '🥁'
            }
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
