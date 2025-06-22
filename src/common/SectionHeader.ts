import globalStyles from '../components/common.module.css'
import { div, h2 } from './tags'
import { classify } from './utils'

interface SectionHeaderProps {
  title: string | (() => string)
  controls?: any
  className?: string
}

export const SectionHeader = ({ title, controls, className }: SectionHeaderProps) => {
  return div(
    {
      ...classify(
        globalStyles.flex,
        globalStyles.itemsCenter,
        globalStyles.justifyBetween,
        globalStyles.mb3,
        globalStyles.mt0,
        ...(className ? [className] : [])
      ),
    },
    h2({ ...classify(globalStyles.textWhite, globalStyles.textXl, globalStyles.mb0) }, title),
    controls
  )
}
