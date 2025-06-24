import { ButtonVariant } from '@/common/Button'
import { Modal } from '@/common/Modal'
import { navigate } from '@/common/router'
import { flash } from '@/common/StatusBar'
import { div } from '@/common/tags'
import { classify } from '@/common/util/classify'
import { Beat, loadBeatsFromStorage, saveBeatsToStorage } from '@/components/BeatEditor/storage'
import styles from '@/styles.module.css'
import { decompressFromBase64 } from '@/util/compress'
import { generateGuid } from '@/util/generateGuid'
import van from 'vanjs-core'

export const ImportHandler = ({ chunks }: { chunks: string[] }) => {
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
  const processImport = async () => {
    try {
      // Join chunks and decode the base64 payload
      const joinedPayload = chunks.join('')
      const beat = await decompressFromBase64<Beat>(joinedPayload)

      // Validate beat data
      if (!beat.grid || !Array.isArray(beat.grid)) {
        throw new Error('Invalid beat data')
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

  const conflictModal = Modal({
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
    conflictModal(),

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
