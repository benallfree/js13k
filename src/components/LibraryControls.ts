import van, { State } from 'vanjs-core'
import { Button } from './Button'

const { div } = van.tags

export const LibraryControls = (
  showLibrary: State<boolean>,
  onSave: () => void,
  onClear: () => void,
  onShare: () => void
) =>
  div(
    { class: 'flex flex-wrap gap-2 mb-4' },
    Button({ onClick: onSave, variant: 'primary', children: 'Save Beat' }),
    Button({ onClick: onClear, variant: 'danger', children: 'Clear Beat' }),
    Button({
      onClick: () => (showLibrary.val = !showLibrary.val),
      children: () => (showLibrary.val ? 'Hide Library' : 'Show Library'),
    }),
    Button({ onClick: onShare, children: 'Share Beat' })
  )
