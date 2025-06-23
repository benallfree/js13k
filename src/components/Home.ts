import { classify } from '@/common/utils'
import { BEAT_EDITOR_FLAG, SAMPLE_EDITOR_FLAG } from '@/util/constants'
import { div, h1, p } from '../common/tags'
import { savedBeats } from '../components/BeatEditor/beatState'
import { savedSamples } from '../SampleManager/sampleState'
import { loadBeatsFromStorage, loadSamplesFromStorage } from '../storage'
import { BeatLibrary } from './BeatLibrary'
import globalStyles from './common.module.css'
import { SampleLibrary } from './SampleLibrary'
import { SplashPage } from './SplashPage'

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
      BEAT_EDITOR_FLAG ? BeatLibrary() : null,

      // Sample Library
      SAMPLE_EDITOR_FLAG ? SampleLibrary() : null
    )
  )
}
