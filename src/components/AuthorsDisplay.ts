import { State } from 'vanjs-core'
import { a, p } from '../common/tags'

interface AuthorsDisplayProps {
  authors: string[] | State<string[]>
  className?: string
  prefix?: string
  clickHandler?: (e: Event) => void
}

export const AuthorsDisplay = ({
  authors,
  className = '',
  prefix = 'Authors: ',
  clickHandler,
}: AuthorsDisplayProps) => {
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
              href: `https://twitter.com/${author}`,
              target: '_blank',
              rel: 'noopener noreferrer',
              class: 'text-link mr-2',
              onclick: clickHandler || ((e: Event) => e.stopPropagation()),
            },
            `@${author}`
          ),
          index < authorList.length - 1 ? ', ' : '',
        ])
        .flat()
    )
  }
}
