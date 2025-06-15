import { State } from 'vanjs-core'
import { a, div } from '../common/tags'

export const AuthorsDisplay = (authors: State<string[]>) => () =>
  authors.val.length > 0
    ? div(
        {
          class: 'current-beat-authors text-sm text-gray mb-2',
        },
        'Authors: ',
        ...authors.val
          .map((author, index) => [
            a(
              {
                href: `https://x.com/${author}`,
                target: '_blank',
                rel: 'noopener noreferrer',
                class: 'text-link mr-2',
              },
              `@${author}`
            ),
            index < authors.val.length - 1 ? ', ' : '',
          ])
          .flat()
      )
    : ''
