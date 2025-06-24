import { flex, itemsCenter, justifyCenter, minH20, overflowHidden, p5, relative } from '@/styles.module.css'
import { div } from '@van13k'
import { playingField } from './PlayingField.module.css'

export const PlayingField = () => {
  return div(
    { class: `${flex} ${justifyCenter} ${itemsCenter} ${minH20} ${p5}` },
    div({ class: `${playingField} ${relative} ${overflowHidden}` })
  )
}
