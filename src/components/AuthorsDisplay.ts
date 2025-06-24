import styles from '@styles'
import { a, classify, p } from '@van13k'
import { State } from 'vanjs-core'

interface AuthorsDisplayProps {
  authors: string[] | State<string[]>
  className?: string
  prefix?: string
  clickHandler?: (e: Event) => void
}

export const AuthorsDisplay = ({ authors, className = '', prefix = 'Authors: ' }: AuthorsDisplayProps) => {
  const getAuthors = () => (Array.isArray(authors) ? authors : authors.val)

  return () => {
    const authorList = getAuthors()

    if (!authorList || authorList.length === 0) {
      return ''
    }

    return p(
      { class: className },
      prefix,
      ...authorList
        .map((author, index) => [
          a(
            {
              href: `https://x.com/${author}`,
              target: '_blank',
              rel: 'noopener noreferrer',
              ...classify(styles.textLink, styles.mr2),
            },
            `@${author}`
          ),
          index < authorList.length - 1 ? ', ' : '',
        ])
        .flat()
    )
  }
}
