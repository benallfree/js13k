import { div } from '@van13k'
import { classify } from '../van13k/util'
import { app, fontBold, header, mb4, py4, text3xl, textCenter, textGray, textSm } from './Home.module.scss'
import { PlayingField } from './PlayingField/PlayingField'

export const Home = () => {
  return div(
    { ...classify(app) },
    div({ ...classify(header, text3xl, fontBold, textCenter, py4) }, `CRAZ 2D`),
    div({ ...classify(textCenter, textGray, mb4, textSm) }, `JS13K Edition`),
    PlayingField()
  )
}
