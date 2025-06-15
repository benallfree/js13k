import { State } from 'vanjs-core'
import { Modal } from '../common/Modal'
import { div } from '../common/tags'
import { sampleMetadata } from '../sounds'
import styles from './PatchModal.module.css'

interface PatchModalProps {
  isOpen: State<boolean>
  selectedInstrument: State<number>
  onSelectPatch: (index: number) => void
  onClose: () => void
}

export const PatchModal = ({ isOpen, selectedInstrument, onSelectPatch, onClose }: PatchModalProps) => {
  const handlePatchSelect = (index: number) => {
    onSelectPatch(index)
    onClose()
  }

  return Modal({
    isOpen,
    title: 'Select Patch',
    content: () =>
      div(
        { class: styles.patchGrid },
        ...Object.entries(sampleMetadata).map(([index, patch]) => {
          const patchIndex = Number(index)
          return div(
            {
              class: `${styles.patchItem} ${selectedInstrument.val === patchIndex ? styles.selected : ''}`,
              onclick: () => handlePatchSelect(patchIndex),
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
    primaryButton: {
      text: 'Close',
      onClick: onClose,
    },
  })
}
