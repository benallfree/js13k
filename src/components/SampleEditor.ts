import { generateWaveform, getTrimmedAudioData, playCustomSample, processAudioFileWithOriginal } from '@/audioUtils'
import { ConfirmationModal, InputModal } from '@/common'
import { BottomTray } from '@/common/BottomTray'
import { Link } from '@/common/router'
import { flash } from '@/common/statusManager'
import { canvas, div, input, span } from '@/common/tags'
import { mergeAuthors, useModal } from '@/common/utils'
import { xHandle } from '@/common/xHandleManager'
import {
  currentSampleData,
  currentSampleDuration,
  currentSampleFallback,
  currentSampleId,
  currentSampleName,
  deleteSample,
  getAuthorsForCurrentSample,
  loadSample,
  newSample,
  originalSampleData,
  sampleIsModified,
  saveSample,
  savedSamples,
  setEffectiveDurationGetter,
  setEffectiveSampleDataGetter,
  setWindowPositionGetter,
  setWindowSizeGetter,
  sharedSampleAuthors,
} from '@/sampleState'
import { sampleMetadata } from '@/sounds'
import { Sample, generateGuid, loadSamplesFromStorage } from '@/storage'
import van from 'vanjs-core'
import { AuthorsDisplay, ShareModal, SplashPage } from './index'
import sharedStyles from './Shared.module.css'

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

// Window control state (simplified) - updated for 8-bit PCM
const maxSamplesForSharing = 3000 // About 375ms at 8kHz - fits in ~4KB base64 for URL sharing
const windowSizeInSamples = van.state(maxSamplesForSharing)
const windowPositionInSamples = van.state(0)
const totalSampleCount = van.state(0)
const shareWindowActive = van.state(false)

// Canvas reference
let canvasElement: HTMLCanvasElement | null = null

// Auto-save function
const autoSave = () => {
  if (!currentSampleName.val.trim() || !currentSampleData.val) {
    return
  }

  const authors = getAuthorsForCurrentSample()
  saveSample(currentSampleName.val, authors)
}

// Handle sample name save
const handleSampleNameSave = (newName: string) => {
  const authors = getAuthorsForCurrentSample()
  if (saveSample(newName, authors)) {
    flash(`💾 Sample renamed to "${newName}"`)
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
    const { originalAudioData, downsampledAudioData, duration } = await processAudioFileWithOriginal(file)

    // Set file name as sample name (remove extension)
    const fileName = file.name.replace(/\.[^/.]+$/, '')
    currentSampleName.val = fileName

    originalSampleData.val = originalAudioData
    currentSampleData.val = downsampledAudioData
    currentSampleDuration.val = duration
    sampleIsModified.val = true

    // Calculate total samples for 8-bit PCM (1 byte per sample)
    const sampleCount = Math.floor((downsampledAudioData.length * 3) / 4) // base64 -> bytes = samples for 8-bit
    totalSampleCount.val = sampleCount

    // Always enable windowing
    shareWindowActive.val = true

    // Set window size to either full sample or max sharable size
    if (sampleCount > maxSamplesForSharing) {
      windowSizeInSamples.val = maxSamplesForSharing
    } else {
      windowSizeInSamples.val = sampleCount
    }
    windowPositionInSamples.val = 0

    // Generate waveform from original (higher quality for display)
    waveformData.val = generateWaveform(originalAudioData, 800, false) // original is Float32

    setTimeout(() => {
      drawWaveform()
    }, 100)

    flash(`📁 Audio file loaded: ${fileName}`)
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
  if (shareWindowActive.val && totalSampleCount.val > 0) {
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

// Get effective sample data for sharing/playback
const getEffectiveSampleData = () => {
  if (!currentSampleData.val) return ''

  // If windowing is active, apply window to current data
  if (shareWindowActive.val && totalSampleCount.val > 0) {
    const windowStart = windowPositionInSamples.val / totalSampleCount.val
    const windowEnd = (windowPositionInSamples.val + windowSizeInSamples.val) / totalSampleCount.val
    try {
      const { audioData: windowedData } = getTrimmedAudioData(currentSampleData.val, windowStart, windowEnd)
      return windowedData
    } catch {
      return currentSampleData.val
    }
  }

  return currentSampleData.val
}

// Get effective duration for sharing/saving
const getEffectiveDuration = () => {
  if (!currentSampleData.val) return 0

  // If windowing is active, calculate windowed duration
  if (shareWindowActive.val && totalSampleCount.val > 0) {
    const windowRatio = windowSizeInSamples.val / totalSampleCount.val
    return currentSampleDuration.val * windowRatio
  }

  return currentSampleDuration.val
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

  drawWaveform()
  sampleIsModified.val = true

  // Auto-save the windowed sample
  setTimeout(() => {
    autoSave()
  }, 300)
}

// Window position slider handler
const handleWindowPositionChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  windowPositionInSamples.val = parseInt(input.value)
  drawWaveform()
  sampleIsModified.val = true

  // Auto-save the windowed sample
  setTimeout(() => {
    autoSave()
  }, 300)
}

// Fallback sample selection
const handleFallbackChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  currentSampleFallback.val = parseInt(input.value)
  sampleIsModified.val = true
  autoSave()
}

// Share modal handlers
const handleShowShareModal = () => {
  if (!currentSampleData.val) {
    flash('❌ No sample data to share', 3000)
    return
  }

  const effectiveSampleData = getEffectiveSampleData()
  const effectiveDuration = getEffectiveDuration()

  const sampleData: Sample = {
    id: currentSampleId.val || generateGuid(),
    name: currentSampleName.val,
    audioData: effectiveSampleData,
    fallbackIdx: currentSampleFallback.val,
    duration: effectiveDuration,
    authors: mergeAuthors([], sharedSampleAuthors.val, xHandle.val),
    createdDate: new Date().toISOString(),
    modifiedDate: new Date().toISOString(),
  }

  const sampleJson = JSON.stringify({ [sampleData.id]: sampleData })
  shareUrl.val = `${window.location.origin}/share-sample/${btoa(sampleJson)}`
  shareModal.open()
}

const handleCloseShareModal = () => {
  shareModal.close()
}

const handleCopyUrl = () => {
  navigator.clipboard
    .writeText(shareUrl.val)
    .then(() => {
      flash(`📋 Sample URL copied to clipboard!`)
    })
    .catch(() => {
      prompt('Copy this URL to share your sample:', shareUrl.val)
      flash('🔗 Share URL generated')
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
  // Register our getEffectiveSampleData function with the state manager
  setEffectiveSampleDataGetter(getEffectiveSampleData)
  setEffectiveDurationGetter(getEffectiveDuration)
  setWindowPositionGetter(() => windowPositionInSamples.val)
  setWindowSizeGetter(() => windowSizeInSamples.val)

  // Initialize editor
  const initializeEditor = () => {
    savedSamples.val = loadSamplesFromStorage()

    const samples = loadSamplesFromStorage()
    const sample = samples.find((s) => s.id === sampleId)
    if (sample) {
      loadSample(sample)
      // Use original data for waveform if available, otherwise downsampled (as 8-bit)
      if (sample.originalAudioData) {
        waveformData.val = generateWaveform(sample.originalAudioData, 800, false) // Float32
      } else {
        waveformData.val = generateWaveform(sample.audioData, 800, true) // 8-bit PCM
      }

      // Setup windowing - calculate samples for 8-bit PCM
      const sampleCount = Math.floor((sample.audioData.length * 3) / 4) // base64 -> bytes = samples for 8-bit
      totalSampleCount.val = sampleCount

      // Always enable windowing
      shareWindowActive.val = true

      // Restore saved window settings or use defaults
      if (sample.windowSize !== undefined) {
        windowSizeInSamples.val = sample.windowSize
      } else {
        // Set window size to either full sample or max sharable size
        if (sampleCount > maxSamplesForSharing) {
          windowSizeInSamples.val = maxSamplesForSharing
        } else {
          windowSizeInSamples.val = sampleCount
        }
      }

      if (sample.windowPosition !== undefined) {
        windowPositionInSamples.val = sample.windowPosition
      } else {
        windowPositionInSamples.val = 0
      }

      flash(`📂 Loaded "${sample.name}"`)

      setTimeout(() => {
        drawWaveform()
      }, 200)
    } else {
      newSample()
      currentSampleId.val = sampleId
      flash(`✨ Created new sample`)
    }
  }

  // Watch for window changes and redraw
  van.derive(() => {
    const size = windowSizeInSamples.val
    const position = windowPositionInSamples.val
    if (currentSampleData.val && totalSampleCount.val > 0) {
      setTimeout(() => {
        drawWaveform()
      }, 10)
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
        Link({ href: '/' }, '🏠'),
        span(' > '),
        span(
          {
            class: sharedStyles.breadcrumbTitle,
            onclick: openSampleNameModal,
          },
          () => currentSampleName.val || 'New Sample',
          () => (sampleIsModified.val ? span({ class: sharedStyles.breadcrumbModified }, ' *') : '')
        )
      ),

      // Modals
      ConfirmationModal({
        isOpen: deleteModal.isOpen,
        title: 'Delete Sample',
        message: () => `Are you sure you want to delete "${currentSampleName.val}"? This action cannot be undone.`,
        confirmText: 'Delete',
        confirmVariant: 'danger',
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
        { class: 'mb-4' },
        input({
          type: 'file',
          accept: 'audio/*',
          onchange: handleFileUpload,
          disabled: () => isProcessing.val,
          class: 'mb-2',
        }),
        () => (isProcessing.val ? div({ class: 'text-sm text-blue' }, '🔄 Processing...') : '')
      ),

      // Waveform display
      div(
        { class: 'mb-4' },
        (() => {
          const canvasEl = canvas({
            width: 800,
            height: 120,
            class: 'border border-gray',
            style: 'max-width: 100%; height: auto; display: block;',
          })

          setTimeout(() => {
            canvasElement = canvasEl as HTMLCanvasElement
            if (currentSampleData.val && waveformData.val.length > 0) {
              drawWaveform()
            } else {
              drawTestPattern()
            }
          }, 0)

          return canvasEl
        })(),

        // Window control sliders (always show when there's audio data)
        () =>
          currentSampleData.val
            ? div(
                { class: 'mt-3 p-3 bg-gray-50 border border-gray-200 rounded' },

                // Window size slider
                div(
                  { class: 'mb-3' },
                  div({ class: 'text-xs text-gray-600 mb-1' }, `Length`),
                  input({
                    type: 'range',
                    min: '500', // ~62ms at 8kHz - minimum useful drum hit
                    max: () => totalSampleCount.val.toString(),
                    value: () => windowSizeInSamples.val.toString(),
                    oninput: handleWindowSizeChange,
                    class: 'w-full',
                  })
                ),

                // Window position slider
                div(
                  { class: 'mb-2' },
                  div({ class: 'text-xs text-gray-600 mb-1' }, `Position`),
                  input({
                    type: 'range',
                    min: '0',
                    max: () => Math.max(0, totalSampleCount.val - windowSizeInSamples.val).toString(),
                    value: () => windowPositionInSamples.val.toString(),
                    oninput: handleWindowPositionChange,
                    class: 'w-full',
                  })
                )
              )
            : ''
      ),

      // Fallback sample selection
      div(
        { class: 'mb-4' },
        div({ class: 'text-sm text-gray mb-2' }, 'Fallback Sample'),
        div(
          { class: 'flex items-center gap-2' },
          input({
            type: 'range',
            min: '0',
            max: '6',
            value: () => currentSampleFallback.val.toString(),
            oninput: handleFallbackChange,
            class: 'w-32',
          }),
          div({ class: 'text-sm' }, () => {
            const metadata = sampleMetadata[currentSampleFallback.val]
            return metadata ? `${metadata.emoji} ${metadata.longName}` : 'Unknown'
          })
        )
      ),

      // Authors display
      AuthorsDisplay({
        authors: sharedSampleAuthors,
        className: 'text-sm text-gray mb-2',
      })
    ),

    // Bottom tray - single play button
    BottomTray({
      icons: [
        {
          children: '▶️',
          onClick: () => {
            const effectiveData = getEffectiveSampleData()
            if (effectiveData) {
              playCustomSample(effectiveData)
            }
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
