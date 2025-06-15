import { State } from 'vanjs-core'
import { Modal } from '../common/Modal'
import { div } from '../common/tags'
import { sampleMetadata } from '../sounds'
import { loadSamplesFromStorage } from '../storage'
import styles from './PatchModal.module.css'

interface PatchModalProps {
  isOpen: State<boolean>
  selectedInstrument: State<number>
  selectedSampleId: State<string>
  onSelectPatch: (index: number, sampleId?: string) => void
  onClose: () => void
}

export const PatchModal = ({
  isOpen,
  selectedInstrument,
  selectedSampleId,
  onSelectPatch,
  onClose,
}: PatchModalProps) => {
  const handleStockInstrumentSelect = (index: number) => {
    onSelectPatch(index)
    onClose()
  }

  const handleCustomSampleSelect = (sampleId: string, fallbackIdx: number) => {
    onSelectPatch(fallbackIdx, sampleId)
    onClose()
  }

  return Modal({
    isOpen,
    title: 'Select Instrument',
    content: () => {
      // Load custom samples
      const customSamples = loadSamplesFromStorage()

      return div(
        // Stock instruments section
        div({ class: styles.sectionTitle }, '🎵 Stock Instruments'),
        div(
          { class: styles.patchGrid },
          ...Object.entries(sampleMetadata).map(([index, patch]) => {
            const patchIndex = Number(index)
            const isSelected = selectedInstrument.val === patchIndex && !selectedSampleId.val
            return div(
              {
                class: `${styles.patchItem} ${isSelected ? styles.selected : ''}`,
                onclick: () => handleStockInstrumentSelect(patchIndex),
              },
              div({ class: styles.patchIcon }, patch.emoji),
              div(
                { class: styles.patchInfo },
                div({ class: styles.patchName }, patch.longName),
                div({ class: styles.patchDescription }, patch.description)
              )
            )
          })
        ),

        // Custom samples section (only show if there are custom samples)
        customSamples.length > 0
          ? div(
              div({ class: styles.sectionTitle }, '🎛️ Custom Samples'),
              div(
                { class: styles.patchGrid },
                ...customSamples.map((sample) => {
                  const isSelected = selectedSampleId.val === sample.id
                  const fallbackPatch = sampleMetadata[sample.fallbackIdx]
                  return div(
                    {
                      class: `${styles.patchItem} ${styles.customSample} ${isSelected ? styles.selected : ''}`,
                      onclick: () => handleCustomSampleSelect(sample.id, sample.fallbackIdx),
                    },
                    div({ class: styles.patchIcon }, fallbackPatch?.emoji || '🎵'),
                    div(
                      { class: styles.patchInfo },
                      div({ class: styles.patchName }, sample.name),
                      div(
                        { class: styles.patchDescription },
                        `Custom sample (${fallbackPatch?.shortName || 'Unknown'} fallback)`
                      )
                    )
                  )
                })
              )
            )
          : null
      )
    },
    primaryButton: {
      text: 'Close',
      onClick: onClose,
    },
  })
}
