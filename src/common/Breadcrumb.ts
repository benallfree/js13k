import styles from './Breadcrumb.module.css'
import { classify } from './classify'
import { clickify } from './clickify'
import { Link } from './router'
import { div, span } from './tags'

export interface BreadcrumbItem {
  label: string | (() => string)
  href?: string
  onClick?: () => void
  isModified?: boolean | (() => boolean)
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export const Breadcrumb = ({ items }: BreadcrumbProps) => {
  return div(
    { class: styles.breadcrumb },
    ...items.flatMap((item, index) => {
      const elements = []

      // Add separator if not the first item
      if (index > 0) {
        elements.push(span(' > '))
      }

      // Add the item itself
      if (item.href) {
        elements.push(
          Link(
            {
              href: item.href,
            },
            typeof item.label === 'function' ? item.label() : item.label
          )
        )
      } else if (item.onClick) {
        elements.push(
          span(
            {
              ...classify(styles.breadcrumbTitle),
              ...clickify(item.onClick),
              style: 'touch-action: manipulation',
            },
            typeof item.label === 'function' ? item.label : item.label,
            typeof item.isModified === 'function'
              ? () => ((item.isModified as () => boolean)() ? span({ class: styles.breadcrumbModified }, ' *') : '')
              : item.isModified
                ? span({ class: styles.breadcrumbModified }, ' *')
                : ''
          )
        )
      } else {
        elements.push(span(typeof item.label === 'function' ? item.label : item.label))
      }

      return elements
    })
  )
}
