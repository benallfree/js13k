import { Button } from '@/common/Button'
import { Modal } from '@/common/Modal'
import { navigate } from '@/common/router'
import { flash } from '@/common/statusManager'
import { div } from '@/common/tags'
import { useModal } from '@/common/utils'
import {
  Beat,
  Sample,
  generateGuid,
  loadBeatsFromStorage,
  loadSamplesFromStorage,
  saveBeatsToStorage,
  saveSamplesToStorage,
} from '@/storage'
import van from 'vanjs-core'

export const ShareHandler = ({ beatPayload, samplePayload }: { beatPayload?: string; samplePayload?: string }) => {
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

    console.log(`sample`, sample)

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

  // Process the share payload
  const processShare = () => {
    try {
      if (beatPayload) {
        contentType.val = 'beat'
        // Decode the base64 payload
        const beatJson = atob(beatPayload)
        const beatData = JSON.parse(beatJson)

        // Get the first (and only) key which is the GUID
        const guid = Object.keys(beatData)[0]
        const beatInfo = beatData[guid]

        if (!beatInfo.grid || !Array.isArray(beatInfo.grid)) {
          throw new Error('Invalid beat data')
        }

        // Create a complete Beat object
        const beat: Beat = {
          id: guid,
          name: beatInfo.name || 'Shared Beat',
          grid: beatInfo.grid,
          authors: beatInfo.authors || [],
          created: beatInfo.created || Date.now(),
          modified: Date.now(),
          // Include sample mapping if present
          ...(beatInfo.sampleMapping && { sampleMapping: beatInfo.sampleMapping }),
        }

        processBeat(beat)
      } else if (samplePayload) {
        contentType.val = 'sample'
        // Decode the base64 payload
        const sampleJson = atob(samplePayload)
        const sampleData = JSON.parse(sampleJson)

        // Get the first (and only) key which is the GUID
        const guid = Object.keys(sampleData)[0]
        const sampleInfo = sampleData[guid]

        if (!sampleInfo.audioData || typeof sampleInfo.audioData !== 'string') {
          throw new Error('Invalid sample data')
        }

        // Create a complete Sample object
        const sample: Sample = {
          id: guid,
          name: sampleInfo.name || 'Shared Sample',
          audioData: sampleInfo.audioData,
          originalAudioData: sampleInfo.audioData, // Use same data for both since it's already processed
          fallbackIdx: sampleInfo.fallbackIdx || 0,
          authors: sampleInfo.authors || [],
          created: sampleInfo.created || Date.now(),
          modified: Date.now(),
          windowPosition: 0,
          windowSize: sampleInfo.audioData.length,
        }

        processSample(sample)
      } else {
        throw new Error('No payload provided')
      }
    } catch (e) {
      console.error('Error processing shared content:', e)
      flash('❌ Invalid share link', 3000)
      navigate('/')
    }
  }

  // Process the share when component mounts
  van.derive(() => {
    if (isProcessing.val) {
      processShare()
    }
  })

  return div(
    // Conflict resolution modal
    Modal({
      isOpen: conflictModal.isOpen,
      title: contentType.val === 'beat' ? 'Beat Already Exists' : 'Sample Already Exists',
      content: () =>
        div(
          div(
            contentType.val === 'beat'
              ? `A beat named "${existingBeat.val?.name}" already exists in your library.`
              : `A sample named "${existingSample.val?.name}" already exists in your library.`
          ),
          div('What would you like to do?'),
          div(
            { class: 'flex gap-2 mt-4 justify-center' },
            Button({
              onClick: handleOverwrite,
              variant: 'danger',
              children: 'Overwrite',
            }),
            Button({
              onClick: handleMakeCopy,
              variant: 'primary',
              children: 'Make Copy',
            }),
            Button({
              onClick: handleCancel,
              variant: 'secondary',
              children: 'Cancel',
            })
          )
        ),
    }),

    // Loading state
    () =>
      isProcessing.val
        ? div(
            { class: 'text-center py-8' },
            div(
              { class: 'text-lg' },
              contentType.val === 'beat' ? '🔄 Processing shared beat...' : '🔄 Processing shared sample...'
            ),
            div(
              { class: 'text-sm text-gray-600 mt-2' },
              contentType.val === 'beat'
                ? 'Please wait while we import your beat.'
                : 'Please wait while we import your sample.'
            )
          )
        : ''
  )
}
