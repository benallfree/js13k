import { Button } from '@/common/Button'
import { Modal } from '@/common/Modal'
import { navigate } from '@/common/router'
import { flash } from '@/common/statusManager'
import { div } from '@/common/tags'
import { Beat, generateGuid, loadBeatsFromStorage, saveBeatsToStorage } from '@/storage'
import van from 'vanjs-core'

export const ShareHandler = ({ payload }: { payload: string }) => {
  const showConflictModal = van.state(false)
  const sharedBeat = van.state<Beat | null>(null)
  const existingBeat = van.state<Beat | null>(null)
  const isProcessing = van.state(true)

  const processBeat = (beat: Beat, shouldOverwrite: boolean = false) => {
    const beats = loadBeatsFromStorage()
    const existing = beats.find((b) => b.id === beat.id)

    if (existing && !shouldOverwrite) {
      // Show conflict modal
      sharedBeat.val = beat
      existingBeat.val = existing
      showConflictModal.val = true
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

  const handleOverwrite = () => {
    if (sharedBeat.val) {
      processBeat(sharedBeat.val, true)
    }
    showConflictModal.val = false
  }

  const handleMakeCopy = () => {
    if (sharedBeat.val) {
      const newBeat = { ...sharedBeat.val, id: generateGuid() }
      processBeat(newBeat, false)
    }
    showConflictModal.val = false
  }

  const handleCancel = () => {
    showConflictModal.val = false
    navigate('/')
  }

  // Process the share payload
  const processShare = () => {
    try {
      // Decode the base64 payload
      const beatJson = atob(payload)
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
      }

      processBeat(beat)
    } catch (e) {
      console.error('Error processing shared beat:', e)
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
      isOpen: showConflictModal,
      title: 'Beat Already Exists',
      content: () =>
        div(
          div(`A beat named "${existingBeat.val?.name}" already exists in your library.`),
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
            div({ class: 'text-lg' }, '🔄 Processing shared beat...'),
            div({ class: 'text-sm text-gray-600 mt-2' }, 'Please wait while we import your beat.')
          )
        : ''
  )
}
