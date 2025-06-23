import { Button, ButtonVariant } from '@/common/Button'
import { div } from '@/common/tags'
import { classify } from '@/common/utils'
import styles from '@/styles.module.css'
import { State } from 'vanjs-core'

export const LibraryControls = (
  showLibrary: State<boolean>,
  onSave: () => void,
  onClear: () => void,
  onShare: () => void
) =>
  div(
    { ...classify(styles.flex, styles.flexWrap, styles.gapMedium, styles.mb4) },
    Button({ onClick: onSave, variant: ButtonVariant.Primary, children: '💾' }),
    Button({ onClick: onClear, variant: ButtonVariant.Danger, children: '🗑️' }),
    Button({
      onClick: () => (showLibrary.val = !showLibrary.val),
      children: () => (showLibrary.val ? '📚' : '📚'),
    }),
    Button({ onClick: onShare, children: '🔗' })
  )
