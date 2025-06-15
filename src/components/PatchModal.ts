import { State } from 'vanjs-core'
import { Modal } from '../common/Modal'
import { div } from '../common/tags'
import { sampleMetadata } from '../sounds'

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
        { class: 'patch-grid' },
        ...Object.entries(sampleMetadata).map(([index, patch]) => {
          const patchIndex = Number(index)
          return div(
            {
              class: `patch-item ${selectedInstrument.val === patchIndex ? 'selected' : ''}`,
              onclick: () => handlePatchSelect(patchIndex),
            },
            div({ class: 'patch-icon' }, patch.emoji),
            div(
              { class: 'patch-info' },
              div({ class: 'patch-name' }, patch.longName),
              div({ class: 'patch-description' }, patch.description)
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
