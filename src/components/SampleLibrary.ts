import { clickify } from '@/common/clickify'
import { navigate } from '@/common/router'
import { SectionHeader } from '@/common/SectionHeader'
import { classify, formatDate } from '@/common/utils'
import { generateGuid } from '@/util/generateGuid'
import { Button, ButtonSize, ButtonVariant } from '../common/Button'
import { div, h3, p } from '../common/tags'
import { savedSamples } from '../SampleManager/sampleState'
import { Sample } from '../storage'
import { AuthorsDisplay } from './AuthorsDisplay'
import globalStyles from './common.module.css'

// Create new sample
const createNewSample = () => {
  const newSampleId = generateGuid()
  navigate(`/samples/${newSampleId}`)
}

// Sample item component
const SampleItem = (sample: Sample) => {
  const handleInteraction = () => navigate(`/samples/${sample.id}`)

  return div(
    {
      ...classify(
        globalStyles.bgGray,
        globalStyles.border,
        globalStyles.borderGray,
        globalStyles.rounded,
        globalStyles.cursorPointer,
        globalStyles.transitionBg,
        globalStyles.p4,
        globalStyles.my2
      ),
      ...clickify(handleInteraction),
    },
    div(
      { ...classify(globalStyles.flex1) },
      h3({ ...classify(globalStyles.textWhite, globalStyles.textLg, globalStyles.mb2, globalStyles.mt0) }, sample.name),
      p(
        { ...classify(globalStyles.textGray, globalStyles.textSm, globalStyles.my1) },
        `Modified: ${formatDate(sample.modified)}`
      ),
      AuthorsDisplay({
        authors: sample.authors || [],
        ...classify(globalStyles.textGray800, globalStyles.textXs, globalStyles.my1),
      })
    )
  )
}

export const SampleLibrary = () => {
  return div(
    { ...classify(globalStyles.my5) },
    SectionHeader({
      title: () => `Your Samples (${savedSamples.val.length})`,
      controls: Button({
        onClick: createNewSample,
        variant: ButtonVariant.Primary,
        size: ButtonSize.Small,
        children: '+',
      }),
    }),
    () =>
      savedSamples.val.length === 0
        ? div(
            {
              ...classify(
                globalStyles.textCenter,
                globalStyles.p4,
                globalStyles.bgGray200,
                globalStyles.border2,
                globalStyles.borderGray400,
                globalStyles.roundedLg,
                globalStyles.my4
              ),
            },
            p(
              { ...classify(globalStyles.textGray, globalStyles.textLg, globalStyles.mb3, globalStyles.mt0) },
              '🎤 No samples yet'
            ),
            p(
              { ...classify(globalStyles.textGray700, globalStyles.textSm, globalStyles.mt0) },
              'Upload your first custom sample!'
            )
          )
        : div(
            { ...classify(globalStyles.mt3) },
            ...savedSamples.val
              .sort((a, b) => b.modified - a.modified) // Sort by most recently modified
              .map((sample) => SampleItem(sample))
          )
  )
}
