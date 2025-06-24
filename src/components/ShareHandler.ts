import { ButtonVariant } from '@/common/Button'
import { Modal } from '@/common/Modal'
import { navigate } from '@/common/router'
import { flash } from '@/common/StatusBar'
import { div } from '@/common/tags'
import { classify, useModal } from '@/common/utils'
import { Beat, loadBeatsFromStorage, saveBeatsToStorage } from '@/components/BeatEditor/storage'
import styles from '@/styles.module.css'
import { generateGuid } from '@/util/generateGuid'
import van from 'vanjs-core'

export const ImportHandler = ({ chunks }: { chunks: string[] }) => {
  const conflictModal = useModal()
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

  const handleOverwrite = () => {
    processBeat(sharedBeat.val!, true)
    conflictModal.close()
  }

  const handleMakeCopy = () => {
    if (sharedBeat.val) {
      const newBeat = { ...sharedBeat.val, id: generateGuid() }
      processBeat(newBeat, false)
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

      // Validate beat data
      if (!info.grid || !Array.isArray(info.grid)) {
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
    } catch (e) {
      console.error('Error processing imported beat:', e)
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

  const conflictModalComponent = Modal({
    title: 'Beat Already Exists',
    content: () =>
      div(
        div(`A beat named "${existingBeat.val?.name}" already exists in your library.`),
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
    conflictModalComponent.render(),

    // Loading state
    () =>
      isProcessing.val
        ? div(
            { ...classify(styles.textCenter, styles.py6) },
            div({ ...classify(styles.textLg) }, '🔄 Processing shared beat...'),
            div(
              { ...classify(styles.textSm, styles.textGray600, styles.mt2) },
              'Please wait while we import your beat.'
            )
          )
        : ''
  )
}
