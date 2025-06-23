import { ButtonVariant } from '@/common/Button'
import { clickify } from '@/common/clickify'
import { Modal } from '@/common/Modal'
import { div } from '@/common/tags'
import { classify } from '@/common/utils'
import common from '@/styles.module.css'
import { State } from 'vanjs-core'
import { sampleMetadata } from '../../sounds'
import { loadSamplesFromStorage } from '../SampleManager/storage'

interface PatchModalProps {
  selectedInstrument: State<number>
  selectedSampleId: State<string>
  onSelectPatch: (index: number, sampleId?: string) => void
  onClose: () => void
}

export const PatchModal = ({ selectedInstrument, selectedSampleId, onSelectPatch, onClose }: PatchModalProps) => {
  const handleStockInstrumentSelect = (index: number) => {
    onSelectPatch(index)
    onClose()
  }

  const handleCustomSampleSelect = (sampleId: string, fallbackIdx: number) => {
    onSelectPatch(fallbackIdx, sampleId)
    onClose()
  }

  const handleStockInstrumentInteraction = (patchIndex: number) => () => handleStockInstrumentSelect(patchIndex)
  const handleCustomSampleInteraction = (sampleId: string, fallbackIdx: number) => () =>
    handleCustomSampleSelect(sampleId, fallbackIdx)

  return Modal({
    title: 'Select Instrument',
    content: () => {
      // Load custom samples
      const customSamples = loadSamplesFromStorage()

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
            const isSelected = selectedInstrument.val === patchIndex && !selectedSampleId.val
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
        ),

        // Custom samples section (only show if there are custom samples)
        customSamples.length > 0
          ? div(
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
                '🎛️ Custom Samples'
              ),
              div(
                { ...classify(common.grid) },
                ...customSamples.map((sample) => {
                  const isSelected = selectedSampleId.val === sample.id
                  const fallbackPatch = sampleMetadata[sample.fallbackIdx]
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
                        common.borderLAccent,
                        isSelected ? common.bgGray300 + ' ' + common.borderAccent : ''
                      ),
                      ...clickify(handleCustomSampleInteraction(sample.id, sample.fallbackIdx)),
                    },
                    div(
                      { ...classify(common.textIconLarge, common.w32, common.textCenter) },
                      fallbackPatch?.emoji || '🎵'
                    ),
                    div(
                      { ...classify(common.flex1) },
                      div({ ...classify(common.fontBold, common.textWhite, common.mb1) }, sample.name),
                      div(
                        { ...classify(common.textXs, common.textGray) },
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
    buttons: [
      {
        text: 'Close',
        variant: ButtonVariant.Cancel,
        onClick: onClose,
      },
    ],
  })
}
