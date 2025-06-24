import { div, h1, p } from '@/common/tags'
import { classify } from '@/common/utils'
import globalStyles from '@/styles.module.css'
import { savedBeats } from '../BeatEditor/beatState'
import { loadBeatsFromStorage } from '../BeatEditor/storage'
import { SplashPage } from '../SplashPage'
import { BeatLibrary } from './BeatLibrary'

export const Home = () => {
  savedBeats.val = loadBeatsFromStorage()

  return div(
    { ...classify('app') },
    'Home',
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
      BeatLibrary()
    )
  )
}
