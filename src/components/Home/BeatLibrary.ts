import { Button, ButtonSize, ButtonVariant } from '@/common/Button'
import { navigate } from '@/common/router'
import { SectionHeader } from '@/common/SectionHeader'
import { div, h3, p } from '@/common/tags'
import { classify } from '@/common/util/classify'
import { clickify } from '@/common/util/clickify'
import { formatDate } from '@/common/util/formatDate'
import globalStyles from '@/styles.module.css'
import { generateGuid } from '@/util/generateGuid'
import { Beat } from '../../storage'
import { AuthorsDisplay } from '../AuthorsDisplay'
import { savedBeats } from '../BeatEditor/beatState'

// Create new beat
const createNewBeat = () => {
  const newBeatId = generateGuid()
  navigate(`/beats/${newBeatId}`)
}

// Beat item component
const BeatItem = (beat: Beat) => {
  const handleInteraction = () => navigate(`/beats/${beat.id}`)

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
      h3({ ...classify(globalStyles.textWhite, globalStyles.textLg, globalStyles.mb2, globalStyles.mt0) }, beat.name),
      p(
        { ...classify(globalStyles.textGray, globalStyles.textSm, globalStyles.my1) },
        `Modified: ${formatDate(beat.modified)}`
      ),
      AuthorsDisplay({
        authors: beat.authors || [],
        ...classify(globalStyles.textGray800, globalStyles.textXs, globalStyles.my1),
      })
    )
  )
}

export const BeatLibrary = () => {
  return div(
    { ...classify(globalStyles.my5) },
    SectionHeader({
      title: () => `Your Beats (${savedBeats.val.length})`,
      controls: Button({
        onClick: createNewBeat,
        variant: ButtonVariant.Primary,
        size: ButtonSize.Small,
        children: '+',
      }),
    }),
    () =>
      savedBeats.val.length === 0
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
              '🎼 No beats yet'
            ),
            p(
              { ...classify(globalStyles.textGray700, globalStyles.textSm, globalStyles.mt0) },
              'Create your first beat to get started!'
            )
          )
        : div(
            { ...classify(globalStyles.mt3) },
            ...savedBeats.val
              .sort((a, b) => b.modified - a.modified) // Sort by most recently modified
              .map((beat) => BeatItem(beat))
          )
  )
}
