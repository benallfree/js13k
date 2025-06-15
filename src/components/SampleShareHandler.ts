import { Button } from '@/common/Button'
import { Modal } from '@/common/Modal'
import { navigate } from '@/common/router'
import { flash } from '@/common/statusManager'
import { div } from '@/common/tags'
import { useModal } from '@/common/utils'
import { Sample, generateGuid, loadSamplesFromStorage, saveSamplesToStorage } from '@/storage'
import van from 'vanjs-core'

export const SampleShareHandler = ({ payload }: { payload: string }) => {
  const conflictModal = useModal()
  const sharedSample = van.state<Sample | null>(null)
  const existingSample = van.state<Sample | null>(null)
  const isProcessing = van.state(true)

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
    if (sharedSample.val) {
      processSample(sharedSample.val, true)
    }
    conflictModal.close()
  }

  const handleMakeCopy = () => {
    if (sharedSample.val) {
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
      // Decode the base64 payload
      const sampleJson = atob(payload)
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
        fallbackIdx: sampleInfo.fallbackIdx || 0,
        duration: sampleInfo.duration || 0,
        authors: sampleInfo.authors || [],
        created: sampleInfo.created || Date.now(),
        modified: Date.now(),
      }

      processSample(sample)
    } catch (e) {
      console.error('Error processing shared sample:', e)
      flash('❌ Invalid sample share link', 3000)
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
      title: 'Sample Already Exists',
      content: () =>
        div(
          div(`A sample named "${existingSample.val?.name}" already exists in your library.`),
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
            div({ class: 'text-lg' }, '🔄 Processing shared sample...'),
            div({ class: 'text-sm text-gray-600 mt-2' }, 'Please wait while we import your sample.')
          )
        : ''
  )
}
