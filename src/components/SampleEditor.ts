import {
  generateWaveform,
  getSampleCount,
  getTrimmedAudioData,
  playCustomSample,
  processAudioFileWithOriginal,
} from '@/audioUtils'
import { ConfirmationModal, InputModal } from '@/common'
import { BottomTray } from '@/common/BottomTray'
import { Breadcrumb } from '@/common/Breadcrumb'
import { ButtonVariant } from '@/common/Button'
import { flash } from '@/common/statusManager'
import { canvas, div, input } from '@/common/tags'
import { classify, useModal } from '@/common/utils'
import { xHandle } from '@/common/xHandleManager'
import {
  currentSampleFallback,
  currentSampleId,
  currentSampleName,
  deleteSample,
  fullSampleData,
  getAuthorsForCurrentSample,
  loadSample,
  maxSamplesForSharing,
  newSample,
  saveSample,
  savedSamples,
  sharedSampleAuthors,
  totalSampleCount,
  windowPositionInSamples,
  windowSizeInSamples,
  windowedSampleData,
} from '@/sampleState'
import { sampleMetadata } from '@/sounds'
import { Sample, generateGuid, loadSamplesFromStorage } from '@/storage'
import { shareSample } from '@/url'
import van from 'vanjs-core'
import { AuthorsDisplay } from './AuthorsDisplay'
import styles from './common.module.css'
import { ShareModal } from './ShareModal'

// Modal state management
const deleteModal = useModal()
const sampleNameModal = useModal()
const shareModal = useModal()

// Sample name editing state
const tempSampleName = van.state('')

// Waveform state
const waveformData = van.state<number[]>([])

// File upload state
const isProcessing = van.state(false)

// Share state
const shareUrl = van.state('')

// Canvas reference
let canvasElement: HTMLCanvasElement | null = null

// Auto-save function
const autoSave = () => {
  if (!currentSampleName.val.trim() || !windowedSampleData.val) {
    return
  }

  const authors = getAuthorsForCurrentSample()
  saveSample(currentSampleName.val, authors)
}

// Handle sample name save
const handleSampleNameSave = (newName: string) => {
  const authors = getAuthorsForCurrentSample()
  if (saveSample(newName, authors)) {
  }
}

const openSampleNameModal = () => {
  tempSampleName.val = currentSampleName.val
  sampleNameModal.open()
}

const cancelSampleNameModal = () => {
  sampleNameModal.close()
}

// File upload handling
const handleFileUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) return

  // Check file type
  if (!file.type.startsWith('audio/')) {
    flash('❌ Please select an audio file', 3000)
    return
  }

  isProcessing.val = true

  try {
    const { originalAudioData, downsampledAudioData } = await processAudioFileWithOriginal(file)

    // Set file name as sample name (remove extension)
    const fileName = file.name.replace(/\.[^/.]+$/, '')
    currentSampleName.val = fileName

    fullSampleData.val = downsampledAudioData // Store downsampled version as original
    windowedSampleData.val = downsampledAudioData

    // Calculate total samples for 8-bit PCM (1 byte per sample)
    const sampleCount = Math.floor((downsampledAudioData.length * 3) / 4) // base64 -> bytes = samples for 8-bit
    totalSampleCount.val = sampleCount

    // Set window size to either full sample or max sharable size
    if (sampleCount > maxSamplesForSharing) {
      windowSizeInSamples.val = maxSamplesForSharing
    } else {
      windowSizeInSamples.val = sampleCount
    }
    windowPositionInSamples.val = 0

    // Generate waveform from downsampled data
    waveformData.val = generateWaveform(downsampledAudioData, 800) // Use downsampled 8-bit PCM

    setTimeout(() => {
      drawWaveform()
    }, 100)

    autoSave()
  } catch (error) {
    console.error('File processing error:', error)
    flash('❌ Failed to process audio file', 3000)
  } finally {
    isProcessing.val = false
    input.value = ''
  }
}

// Waveform drawing
const drawWaveform = () => {
  if (!canvasElement || waveformData.val.length === 0) return

  const ctx = canvasElement.getContext('2d')
  if (!ctx) return

  const width = canvasElement.width
  const height = canvasElement.height
  const centerY = height / 2

  // Clear canvas
  ctx.fillStyle = '#1a1a1a'
  ctx.fillRect(0, 0, width, height)

  // Draw waveform
  ctx.strokeStyle = '#4f46e5'
  ctx.lineWidth = 1
  ctx.beginPath()

  waveformData.val.forEach((amplitude, i) => {
    const x = (i / waveformData.val.length) * width
    const y = centerY - amplitude * centerY * 0.8

    if (i === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  })

  ctx.stroke()

  // Draw share window if active
  if (totalSampleCount.val > 0) {
    const windowStart = windowPositionInSamples.val / totalSampleCount.val
    const windowEnd = (windowPositionInSamples.val + windowSizeInSamples.val) / totalSampleCount.val

    const windowStartX = windowStart * width
    const windowEndX = windowEnd * width

    // Green overlay for share window
    ctx.fillStyle = 'rgba(34, 197, 94, 0.2)'
    ctx.fillRect(windowStartX, 0, windowEndX - windowStartX, height)

    // Green dashed borders
    ctx.strokeStyle = '#22c55e'
    ctx.lineWidth = 3
    ctx.setLineDash([5, 5])

    ctx.beginPath()
    ctx.moveTo(windowStartX, 0)
    ctx.lineTo(windowStartX, height)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(windowEndX, 0)
    ctx.lineTo(windowEndX, height)
    ctx.stroke()

    ctx.setLineDash([])
  }
}

// Window size slider handler
const handleWindowSizeChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  windowSizeInSamples.val = parseInt(input.value)

  // Adjust position if window would exceed bounds
  const maxPosition = totalSampleCount.val - windowSizeInSamples.val
  if (windowPositionInSamples.val > maxPosition) {
    windowPositionInSamples.val = Math.max(0, maxPosition)
  }

  windowedSampleData.val = getTrimmedAudioData(
    fullSampleData.val,
    windowPositionInSamples.val,
    windowSizeInSamples.val
  ).audioData

  drawWaveform()

  // Auto-save the windowed sample
  setTimeout(() => {
    autoSave()
  }, 300)
}

// Window position slider handler
const handleWindowPositionChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  windowPositionInSamples.val = parseInt(input.value)

  // Update the windowed sample data
  windowedSampleData.val = getTrimmedAudioData(
    fullSampleData.val,
    windowPositionInSamples.val,
    windowPositionInSamples.val + windowSizeInSamples.val
  ).audioData

  drawWaveform()

  // Auto-save the windowed sample
  setTimeout(() => {
    autoSave()
  }, 300)
}

// Fallback sample selection
const handleFallbackChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  currentSampleFallback.val = parseInt(input.value)
  autoSave()
}

// Share modal handlers
const handleShowShareModal = () => {
  if (!windowedSampleData.val) {
    flash('❌ No sample data to share', 3000)
    return
  }

  const sampleData: Sample = {
    id: generateGuid(),
    name: currentSampleName.val,
    audioData: windowedSampleData.val,
    originalAudioData: windowedSampleData.val,
    fallbackIdx: currentSampleFallback.val,
    authors: getAuthorsForCurrentSample(),
    created: Date.now(),
    modified: Date.now(),
    windowPosition: 0,
    windowSize: windowedSampleData.val.length,
  }

  shareUrl.val = shareSample(sampleData, xHandle.val)
  shareModal.open()
}

const handleCloseShareModal = () => {
  shareModal.close()
}

const handleCopyUrl = () => {
  navigator.clipboard
    .writeText(shareUrl.val)
    .then(() => {})
    .catch(() => {
      prompt('Copy this URL to share your sample:', shareUrl.val)
    })
}

// Delete sample handling
const handleDeleteSample = () => {
  deleteModal.open()
}

const confirmDeleteSample = () => {
  if (currentSampleId.val && currentSampleName.val) {
    deleteSample(currentSampleId.val)
    flash(`🗑️ Sample "${currentSampleName.val}" deleted`)
    window.history.pushState({}, '', '/')
    window.dispatchEvent(new PopStateEvent('popstate'))
  }
}

const cancelDeleteSample = () => {
  deleteModal.close()
}

// Test pattern for empty canvas
const drawTestPattern = () => {
  if (!canvasElement) return

  const ctx = canvasElement.getContext('2d')
  if (!ctx) return

  const width = canvasElement.width
  const height = canvasElement.height

  ctx.fillStyle = '#1a1a1a'
  ctx.fillRect(0, 0, width, height)

  ctx.strokeStyle = '#4f46e5'
  ctx.lineWidth = 2
  ctx.beginPath()

  for (let i = 0; i < width; i++) {
    const x = i
    const y = height / 2 + Math.sin(i * 0.02) * height * 0.3

    if (i === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  }

  ctx.stroke()

  ctx.fillStyle = '#ffffff'
  ctx.font = '16px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('Upload audio file to see waveform', width / 2, height / 2 + 40)
}

interface SampleEditorProps {
  sampleId: string
}

export const SampleEditor = ({ sampleId }: SampleEditorProps) => {
  // Initialize editor
  const initializeEditor = () => {
    const samples = loadSamplesFromStorage()
    savedSamples.val = samples

    const sample = samples.find((s) => s.id === sampleId)
    if (sample) {
      loadSample(sample)
      // Use downsampled data for waveform
      waveformData.val = generateWaveform(sample.originalAudioData, 800) // Use 8-bit PCM

      // Setup windowing - calculate samples for 8-bit PCM
      totalSampleCount.val = getSampleCount(sample.originalAudioData)

      windowSizeInSamples.val = sample.windowSize
      windowPositionInSamples.val = sample.windowPosition || 0
    } else {
      newSample()
      currentSampleId.val = sampleId
    }
  }

  // Watch for window changes and redraw
  van.derive(() => {
    if (windowedSampleData.val) {
      drawWaveform()
    }
  })

  // Initialize on component creation
  initializeEditor()

  return div(
    div(
      { ...classify(styles.mainContent) },

      // Breadcrumb navigation
      Breadcrumb({
        items: [
          {
            label: '🏠',
            href: '/',
          },
          {
            label: () => currentSampleName.val || 'New Sample',
            onClick: openSampleNameModal,
          },
        ],
      }),

      // Modals
      ConfirmationModal({
        isOpen: deleteModal.isOpen,
        title: 'Delete Sample',
        message: () => `Are you sure you want to delete "${currentSampleName.val}"? This action cannot be undone.`,
        confirmText: 'Delete',
        confirmVariant: ButtonVariant.Danger,
        onConfirm: confirmDeleteSample,
        onCancel: cancelDeleteSample,
      }),

      InputModal({
        isOpen: sampleNameModal.isOpen,
        title: 'Rename Sample',
        prompt: 'Enter a new name for your sample:',
        inputValue: tempSampleName,
        confirmText: 'Rename',
        onConfirm: handleSampleNameSave,
        onCancel: cancelSampleNameModal,
      }),

      ShareModal({
        isOpen: shareModal.isOpen,
        shareUrl: shareUrl.val,
        onClose: handleCloseShareModal,
        onCopyUrl: handleCopyUrl,
      }),

      // File upload section
      div(
        { ...classify(styles.mb4) },
        input({
          type: 'file',
          accept: 'audio/*',
          onchange: handleFileUpload,
          disabled: () => isProcessing.val,
          ...classify(styles.mb2),
        }),
        () => (isProcessing.val ? div({ ...classify(styles.textSm, styles.textPrimary) }, '🔄 Processing...') : '')
      ),

      // Waveform display
      div(
        { ...classify(styles.mb4) },
        (() => {
          const canvasEl = canvas({
            width: 800,
            height: 120,
            ...classify(styles.border, styles.borderGray, styles.widthFull),
          })

          setTimeout(() => {
            canvasElement = canvasEl as HTMLCanvasElement
            if (windowedSampleData.val && waveformData.val.length > 0) {
              drawWaveform()
            } else {
              drawTestPattern()
            }
          }, 0)

          return canvasEl
        })(),

        // Window control sliders (always show when there's audio data)
        () =>
          div(
            {
              ...classify(styles.mt3, styles.p3, styles.bgGray200, styles.border, styles.borderGray200, styles.rounded),
            },

            // Window size slider
            div(
              { ...classify(styles.mb3) },
              div({ ...classify(styles.textXs, styles.textGray600, styles.mb1) }, `Length`),
              input({
                type: 'range',
                min: '500', // ~62ms at 8kHz - minimum useful drum hit
                max: () => Math.min(fullSampleData.val.length, maxSamplesForSharing).toString(),
                value: () => windowSizeInSamples.val.toString(),
                oninput: handleWindowSizeChange,
                ...classify(styles.widthFull),
              })
            ),

            // Window position slider
            div(
              { ...classify(styles.mb2) },
              div({ ...classify(styles.textXs, styles.textGray600, styles.mb1) }, `Position`),
              input({
                type: 'range',
                min: '0',
                max: () => Math.max(0, totalSampleCount.val - windowSizeInSamples.val).toString(),
                value: () => windowPositionInSamples.val.toString(),
                oninput: handleWindowPositionChange,
                ...classify(styles.widthFull),
              })
            )
          )
      ),

      // Fallback sample selection
      div(
        { ...classify(styles.mb4) },
        div({ ...classify(styles.textSm, styles.textGray, styles.mb2) }, 'Fallback Sample'),
        div(
          { ...classify(styles.flex, styles.itemsCenter, styles.gapSmall) },
          input({
            type: 'range',
            min: '0',
            max: '6',
            value: () => currentSampleFallback.val.toString(),
            oninput: handleFallbackChange,
          }),
          div({ ...classify(styles.textSm) }, () => {
            const metadata = sampleMetadata[currentSampleFallback.val]
            return metadata ? `${metadata.emoji} ${metadata.longName}` : 'Unknown'
          })
        )
      ),

      // Authors display
      AuthorsDisplay({
        authors: sharedSampleAuthors,
        ...classify(styles.textSm, styles.textGray, styles.mb2),
      })
    ),

    // Bottom tray - single play button
    BottomTray({
      icons: [
        {
          children: '▶️',
          onClick: () => {
            playCustomSample(windowedSampleData.val)
          },
        },
        {
          children: '🔗',
          onClick: handleShowShareModal,
        },
        {
          children: '🗑️',
          onClick: handleDeleteSample,
        },
      ],
    })
  )
}
