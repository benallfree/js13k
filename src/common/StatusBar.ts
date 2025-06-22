import { div } from '../common/tags'
import globalStyles from '../components/common.module.css'
import { base, visible } from './StatusBar.module.css'
import { statusMessage, statusVisible } from './statusManager'
import { classify } from './utils'

export const StatusBar = () =>
  div(
    {
      ...classify(
        base,
        globalStyles.fixed,
        globalStyles.left0,
        globalStyles.right0,
        globalStyles.bgAccent,
        globalStyles.textAccentDark,
        globalStyles.px6,
        globalStyles.py3,
        globalStyles.textSm,
        globalStyles.zIndexMax,
        globalStyles.backdropBlur,
        globalStyles.textCenter,
        globalStyles.minH20,
        globalStyles.transitionSlow,
        globalStyles.shadowMedium,
        () => (statusVisible.val ? visible : '')
      ),
    },
    () => statusMessage.val
  )
