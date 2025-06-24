import { Breadcrumb, ConfirmationModal, InputModal } from '@/common'
import { BottomTray } from '@/common/BottomTray'
import { ButtonVariant } from '@/common/Button'
import { ShareModal } from '@/common/ShareModal'
import { flash } from '@/common/StatusBar'
import { _routerPathname } from '@/common/router/_state'
import { div } from '@/common/tags'
import { classify } from '@/common/util/classify'
import { AuthorsDisplay } from '@/components/AuthorsDisplay'
import { shareBeat } from '@/components/BeatEditor/shareBeat'
import { SplashPage } from '@/components/SplashPage'
import { playSound, sampleMetadata } from '@/sounds'
import styles from '@/styles.module.css'
import van from 'vanjs-core'
import { Grid } from './Grid'
import { PatchModal } from './PatchModal'
import {
  currentBeatId,
  currentBeatName,
  currentStep,
  deleteBeat,
  getAuthorsForCurrentBeat,
  grid,
  loadBeat,
  newBeat,
  playing,
  playingCells,
  saveBeat,
  savedBeats,
  selectedInstrument,
  sharedBeatAuthors,
  stepHistory,
} from './beatState'
import { loadBeatsFromStorage } from './storage'

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

  // Share modal state

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

  // Cell interaction handling
  const toggleCell = (row: number, col: number) => {
    const newGrid = [...grid.val]
    if (!newGrid[row]) newGrid[row] = new Array(16).fill(0)

    const currentValue = newGrid[row][col] || 0
    newGrid[row][col] = currentValue === selectedInstrument.val + 1 ? 0 : selectedInstrument.val + 1

    grid.val = newGrid

    // Auto-save after each edit
    autoSave()

    // Play sample immediately when placed
    if (newGrid[row][col]) {
      const soundIndex = newGrid[row][col] - 1
      playSound(soundIndex)
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
        playSound(soundIndex)
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

  const handleShowShareModal = async () => {
    const existingBeat = savedBeats.val.find((b) => b.id === currentBeatId.val)!

    const url = await shareBeat(existingBeat)
    shareModal.open({ shareUrl: url })
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

  const deleteModal = ConfirmationModal({
    title: 'Delete Beat',
    message: () => `Are you sure you want to delete "${currentBeatName.val}"? This action cannot be undone.`,
    confirmText: 'Delete',
    confirmVariant: ButtonVariant.Danger,
    onConfirm: confirmDeleteBeat,
    onCancel: cancelDeleteBeat,
  })

  const renameModal = InputModal({
    title: 'Rename Beat',
    prompt: 'Enter a new name for your beat:',
    initialValue: currentBeatName.val,
    confirmText: 'Rename',
    onConfirm: (newName: string) => {
      const authors = getAuthorsForCurrentBeat()

      if (saveBeat(newName, authors)) {
        flash(`💾 Beat renamed to "${newName}"`)
      }
    },
  })

  const patchModal = PatchModal({
    selectedInstrument,
    onSelectPatch: (index: number) => {
      selectedInstrument.val = index
    },
    onClose: () => patchModal.close(),
  })

  const shareModal = ShareModal({
    title: 'Share Your Beat',
    instructions: 'Share this URL to let others listen to your beat.',
    onCopyUrl: () => flash(`📋 Beat URL copied to clipboard!`),
  })

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
            onClick: () => renameModal.open({ initialValue: currentBeatName.val }),
          },
        ],
      }),
      deleteModal(),
      renameModal(),
      patchModal(),
      shareModal(),
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
            const patch = sampleMetadata[selectedInstrument.val]
            return patch ? patch.emoji : '🥁'
          },
          onClick: () => patchModal.open(),
        },
        {
          children: '🔗',
          onClick: handleShowShareModal,
        },
        {
          children: '🗑️',
          onClick: () => deleteModal.open(),
        },
      ],
    })
  )
}
