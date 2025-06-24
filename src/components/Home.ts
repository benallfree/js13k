import { div } from '@van13k'
import { app } from './Home.module.scss'
import { PlayingField } from './PlayingField/PlayingField'

export const Home = () => {
  return div({ class: app }, [PlayingField()])
}
