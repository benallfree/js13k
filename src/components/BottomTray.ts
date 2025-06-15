import { State } from 'vanjs-core'
import { Icon } from '../common/Icon'
import { div } from '../common/tags'
import { sampleMetadata } from '../sounds'

interface BottomTrayProps {
  playing: State<boolean>
  selectedInstrument: State<number>
  onTogglePlay: () => void
  onShowPatchModal: () => void
  onShowShareModal: () => void
}

export const BottomTray = ({
  playing,
  selectedInstrument,
  onTogglePlay,
  onShowPatchModal,
  onShowShareModal,
}: BottomTrayProps) => {
  return div(
    { class: 'bottom-tray' },
    Icon({
      onClick: onTogglePlay,
      children: () => (playing.val ? '⏹️' : '▶️'),
    }),
    div({ class: 'bottom-tray-divider' }),
    Icon({
      onClick: onShowPatchModal,
      children: () => {
        const patch = sampleMetadata[selectedInstrument.val]
        return patch ? patch.emoji : '🥁'
      },
    }),
    div({ class: 'bottom-tray-divider' }),
    Icon({
      onClick: onShowShareModal,
      children: '🔗',
    })
  )
}
