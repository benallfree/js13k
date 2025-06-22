import { clickify } from '@/common/clickify'
import { navigate } from '@/common/router'
import { SectionHeader } from '@/common/SectionHeader'
import { classify, formatDate } from '@/common/utils'
import { savedBeats } from '../beatState'
import { Button, ButtonSize, ButtonVariant } from '../common/Button'
import { div, h1, h3, p } from '../common/tags'
import { savedSamples } from '../sampleState'
import { Beat, Sample, generateGuid, loadBeatsFromStorage, loadSamplesFromStorage } from '../storage'
import { AuthorsDisplay } from './AuthorsDisplay'
import globalStyles from './common.module.css'
import { SplashPage } from './SplashPage'

// Create new beat
const createNewBeat = () => {
  const newBeatId = generateGuid()
  navigate(`/beats/${newBeatId}`)
}

// Create new sample
const createNewSample = () => {
  const newSampleId = generateGuid()
  navigate(`/samples/${newSampleId}`)
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

export const Home = () => {
  // Initialize app
  const initializeApp = () => {
    // Load beats library
    savedBeats.val = loadBeatsFromStorage()
    // Load samples library
    savedSamples.val = loadSamplesFromStorage()
  }

  // Initialize on component creation
  initializeApp()

  return div(
    { ...classify('app') },
    SplashPage(),
    div(
      { ...classify(globalStyles.maxW800, globalStyles.mxAuto, globalStyles.mainContent) },

      // Header
      div(
        { ...classify(globalStyles.textCenter, globalStyles.my7, globalStyles.py5, globalStyles.borderB) },
        h1(
          { ...classify(globalStyles.textWhite, globalStyles.text2xl, globalStyles.mb2, globalStyles.mt0) },
          '🎵 Beat Threads'
        ),
        p(
          { ...classify(globalStyles.textGray, globalStyles.textSm, globalStyles.mt0) },
          'Create, edit, and share your beats and samples'
        )
      ),

      // Beat Library
      div(
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
      ),

      // Sample Library
      div(
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
                { ...classify(globalStyles.mt3) }, // Reuse beats container styles
                ...savedSamples.val
                  .sort((a, b) => b.modified - a.modified) // Sort by most recently modified
                  .map((sample) => SampleItem(sample))
              )
      )
    )
  )
}
