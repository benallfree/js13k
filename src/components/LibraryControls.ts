import van, { State } from 'vanjs-core'
import { Button } from '../common/Button'

const { div } = van.tags

export const LibraryControls = (
  showLibrary: State<boolean>,
  onSave: () => void,
  onClear: () => void,
  onShare: () => void
) =>
  div(
    { class: 'flex flex-wrap gap-2 mb-4' },
    Button({ onClick: onSave, variant: 'primary', children: '💾' }),
    Button({ onClick: onClear, variant: 'danger', children: '🗑️' }),
    Button({
      onClick: () => (showLibrary.val = !showLibrary.val),
      children: () => (showLibrary.val ? '📚' : '📚'),
    }),
    Button({ onClick: onShare, children: '🔗' })
  )
