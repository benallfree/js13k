import {
  borderB,
  mainContent,
  maxW800,
  mb2,
  mt0,
  mxAuto,
  my7,
  py5,
  text2xl,
  textCenter,
  textGray,
  textSm,
  textWhite,
} from '@/styles.module.css'
import { classify, div, h1, p } from '@van13k'
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
      { ...classify(maxW800, mxAuto, mainContent) },

      // Header
      div(
        { ...classify(textCenter, my7, py5, borderB) },
        h1({ ...classify(textWhite, text2xl, mb2, mt0) }, '🎵 Beat Threads'),
        p({ ...classify(textGray, textSm, mt0) }, 'Create, edit, and share your beats and samples')
      ),

      // Beat Library
      BeatLibrary()
    )
  )
}
