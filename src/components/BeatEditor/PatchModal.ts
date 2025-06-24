import { ButtonVariant } from '@/common/Button'
import { clickify } from '@/common/clickify'
import { Modal } from '@/common/Modal'
import { div } from '@/common/tags'
import { classify } from '@/common/utils'
import common from '@/styles.module.css'
import { State } from 'vanjs-core'
import { sampleMetadata } from '../../sounds'

interface PatchModalProps {
  selectedInstrument: State<number>
  onSelectPatch: (index: number, sampleId?: string) => void
  onClose: () => void
}

export const PatchModal = ({ selectedInstrument, onSelectPatch, onClose }: PatchModalProps) => {
  const handleStockInstrumentSelect = (index: number) => {
    onSelectPatch(index)
    onClose()
  }

  const handleStockInstrumentInteraction = (patchIndex: number) => () => handleStockInstrumentSelect(patchIndex)

  return Modal({
    title: 'Select Instrument',
    content: () => {
      return div(
        // Stock instruments section
        div(
          {
            ...classify(
              common.fontBold,
              common.textSm,
              common.textWhite,
              common.my4,
              common.mb2,
              common.borderB,
              common.borderGray300,
              common.py1
            ),
          },
          '🎵 Stock Instruments'
        ),
        div(
          { ...classify(common.grid) },
          ...Object.entries(sampleMetadata).map(([index, patch]) => {
            const patchIndex = Number(index)
            const isSelected = selectedInstrument.val === patchIndex
            return div(
              {
                ...classify(
                  common.flex,
                  common.itemsCenter,
                  common.gapMedium,
                  common.p3,
                  common.border,
                  common.borderGray300,
                  common.rounded,
                  common.cursorPointer,
                  common.transition,
                  common.hoverBgGray200,
                  common.hoverBorderGray700,
                  isSelected ? common.bgGray300 + ' ' + common.borderAccent : ''
                ),
                ...clickify(handleStockInstrumentInteraction(patchIndex)),
              },
              div({ ...classify(common.textIconLarge, common.w32, common.textCenter) }, patch.emoji),
              div(
                { ...classify(common.flex1) },
                div({ ...classify(common.fontBold, common.textWhite, common.mb1) }, patch.longName),
                div({ ...classify(common.textXs, common.textGray) }, patch.description)
              )
            )
          })
        )
      )
    },
    buttons: [
      {
        text: 'Close',
        variant: ButtonVariant.Cancel,
        onClick: onClose,
      },
    ],
  })
}
