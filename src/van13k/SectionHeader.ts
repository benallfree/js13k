import { classify, div, h2 } from '@van13k'
import { flex, itemsCenter, justifyBetween, mb0, mb3, mt0, textWhite, textXl } from '../styles.module.css'

interface SectionHeaderProps {
  title: string | (() => string)
  controls?: any
  className?: string
}

export const SectionHeader = ({ title, controls, className }: SectionHeaderProps) => {
  return div(
    {
      ...classify(flex, itemsCenter, justifyBetween, mb3, mt0, ...(className ? [className] : [])),
    },
    h2({ ...classify(textWhite, textXl, mb0) }, title),
    controls
  )
}
