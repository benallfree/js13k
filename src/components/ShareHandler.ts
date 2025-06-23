import { ButtonVariant } from '@/common/Button'
import { Modal } from '@/common/Modal'
import { navigate } from '@/common/router'
import { flash } from '@/common/statusManager'
import { div } from '@/common/tags'
import { classify, useModal } from '@/common/utils'
import { Beat, loadBeatsFromStorage, saveBeatsToStorage } from '@/components/BeatEditor/storage'
import styles from '@/styles.module.css'
import { generateGuid } from '@/util/generateGuid'
import van from 'vanjs-core'
import { loadSamplesFromStorage, Sample, saveSamplesToStorage } from './SampleManager/storage'

export const ImportHandler = ({ chunks }: { chunks: string[] }) => {
  const conflictModal = useModal()
  const sharedBeat = van.state<Beat | null>(null)
  const sharedSample = van.state<Sample | null>(null)
  const existingBeat = van.state<Beat | null>(null)
  const existingSample = van.state<Sample | null>(null)
  const isProcessing = van.state(true)
  const contentType = van.state<'beat' | 'sample' | null>(null)

  const processBeat = (beat: Beat, shouldOverwrite: boolean = false) => {
    const beats = loadBeatsFromStorage()
    const existing = beats.find((b) => b.id === beat.id)

    if (existing && !shouldOverwrite) {
      // Show conflict modal
      sharedBeat.val = beat
      existingBeat.val = existing
      conflictModal.open()
      isProcessing.val = false
      return
    }

    if (shouldOverwrite && existing) {
      // Overwrite existing beat
      const beatIndex = beats.findIndex((b) => b.id === beat.id)
      beats[beatIndex] = beat
      saveBeatsToStorage(beats)
      flash(`🔄 Beat "${beat.name}" overwritten`)
    } else if (!existing) {
      // Add new beat
      beats.push(beat)
      saveBeatsToStorage(beats)
      flash(`📥 Beat "${beat.name}" imported`)
    } else {
      // Make a copy
      const newBeat = { ...beat, id: generateGuid() }
      beats.push(newBeat)
      saveBeatsToStorage(beats)
      flash(`📋 Beat "${beat.name}" copied`)
      beat = newBeat
    }

    // Redirect to beat editor
    navigate(`/beats/${beat.id}`)
  }

  const processSample = (sample: Sample, shouldOverwrite: boolean = false) => {
    const samples = loadSamplesFromStorage()
    const existing = samples.find((s) => s.id === sample.id)

    if (existing && !shouldOverwrite) {
      // Show conflict modal
      sharedSample.val = sample
      existingSample.val = existing
      conflictModal.open()
      isProcessing.val = false
      return
    }

    if (shouldOverwrite && existing) {
      // Overwrite existing sample
      const sampleIndex = samples.findIndex((s) => s.id === sample.id)
      samples[sampleIndex] = sample
      saveSamplesToStorage(samples)
      flash(`🔄 Sample "${sample.name}" overwritten`)
    } else if (!existing) {
      // Add new sample
      samples.push(sample)
      saveSamplesToStorage(samples)
      flash(`📥 Sample "${sample.name}" imported`)
    } else {
      // Make a copy
      const newSample = { ...sample, id: generateGuid() }
      samples.push(newSample)
      saveSamplesToStorage(samples)
      flash(`📋 Sample "${sample.name}" copied`)
      sample = newSample
    }

    // Redirect to sample editor
    navigate(`/samples/${sample.id}`)
  }

  const handleOverwrite = () => {
    if (sharedBeat.val) {
      processBeat(sharedBeat.val, true)
    } else if (sharedSample.val) {
      processSample(sharedSample.val, true)
    }
    conflictModal.close()
  }

  const handleMakeCopy = () => {
    if (sharedBeat.val) {
      const newBeat = { ...sharedBeat.val, id: generateGuid() }
      processBeat(newBeat, false)
    } else if (sharedSample.val) {
      const newSample = { ...sharedSample.val, id: generateGuid() }
      processSample(newSample, false)
    }
    conflictModal.close()
  }

  const handleCancel = () => {
    conflictModal.close()
    navigate('/')
  }

  // Process the import payload
  const processImport = () => {
    try {
      // Join chunks and decode the base64 payload
      const joinedPayload = chunks.join('')
      const json = atob(decodeURIComponent(joinedPayload))
      const data = JSON.parse(json)

      // Get the first (and only) key which is the GUID
      const guid = Object.keys(data)[0]
      const info = data[guid]

      // Detect content type based on properties
      if (info.audioData) {
        contentType.val = 'sample'
        if (typeof info.audioData !== 'string') {
          throw new Error('Invalid sample data')
        }

        // Create a complete Sample object
        const sample: Sample = {
          id: guid,
          name: info.name || 'Shared Sample',
          audioData: info.audioData,
          originalAudioData: info.audioData, // Use same data for both since it's already processed
          fallbackIdx: info.fallbackIdx || 0,
          authors: info.authors || [],
          created: info.created || Date.now(),
          modified: Date.now(),
          windowPosition: 0,
          windowSize: info.audioData.length,
        }

        processSample(sample)
      } else if (info.grid) {
        contentType.val = 'beat'
        if (!Array.isArray(info.grid)) {
          throw new Error('Invalid beat data')
        }

        // Create a complete Beat object
        const beat: Beat = {
          id: guid,
          name: info.name || 'Shared Beat',
          grid: info.grid,
          authors: info.authors || [],
          created: info.created || Date.now(),
          modified: Date.now(),
          // Include sample mapping if present
          ...(info.sampleMapping && { sampleMapping: info.sampleMapping }),
        }

        processBeat(beat)
      } else {
        throw new Error('Invalid import data')
      }
    } catch (e) {
      console.error('Error processing imported content:', e)
      flash('❌ Invalid import link', 3000)
      navigate('/')
    }
  }

  // Process the import when component mounts
  van.derive(() => {
    if (isProcessing.val) {
      processImport()
    }
  })

  const confirmModal = Modal({
    title: contentType.val === 'beat' ? 'Beat Already Exists' : 'Sample Already Exists',
    content: () =>
      div(
        div(
          contentType.val === 'beat'
            ? `A beat named "${existingBeat.val?.name}" already exists in your library.`
            : `A sample named "${existingSample.val?.name}" already exists in your library.`
        ),
        div('What would you like to do?'),
        div({ ...classify(styles.flex, styles.gapSmall, styles.mt4, styles.justifyCenter) })
      ),
    buttons: [
      {
        onClick: handleOverwrite,
        variant: ButtonVariant.Danger,
        text: 'Overwrite',
      },
      {
        onClick: handleMakeCopy,
        variant: ButtonVariant.Primary,
        text: 'Make Copy',
      },
      {
        onClick: handleCancel,
        variant: ButtonVariant.Cancel,
        text: 'Cancel',
      },
    ],
  })

  return div(
    // Conflict resolution modal
    confirmModal.render(),

    // Loading state
    () =>
      isProcessing.val
        ? div(
            { ...classify(styles.textCenter, styles.py6) },
            div(
              { ...classify(styles.textLg) },
              contentType.val === 'beat' ? '🔄 Processing shared beat...' : '🔄 Processing shared sample...'
            ),
            div(
              { ...classify(styles.textSm, styles.textGray600, styles.mt2) },
              contentType.val === 'beat'
                ? 'Please wait while we import your beat.'
                : 'Please wait while we import your sample.'
            )
          )
        : ''
  )
}
