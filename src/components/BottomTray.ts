import { State } from 'vanjs-core'
import { Icon } from '../common/Icon'
import { div } from '../common/tags'
import { sampleMetadata } from '../sounds'
import styles from './BottomTray.module.css'

interface BottomTrayProps {
  playing: State<boolean>
  selectedInstrument: State<number>
  onTogglePlay: () => void
  onShowPatchModal: () => void
  onShowShareModal: () => void
  onDeleteBeat: () => void
}

export const BottomTray = ({
  playing,
  selectedInstrument,
  onTogglePlay,
  onShowPatchModal,
  onShowShareModal,
  onDeleteBeat,
}: BottomTrayProps) => {
  return div(
    { class: styles.bottomTray },
    Icon({
      onClick: onTogglePlay,
      children: () => (playing.val ? '⏹️' : '▶️'),
    }),
    Icon({
      onClick: onShowPatchModal,
      children: () => {
        const patch = sampleMetadata[selectedInstrument.val]
        return patch ? patch.emoji : '🥁'
      },
    }),
    Icon({
      onClick: onShowShareModal,
      children: '🔗',
    }),
    Icon({
      onClick: onDeleteBeat,
      children: '🗑️',
    })
  )
}
