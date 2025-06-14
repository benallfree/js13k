import van, { State } from 'vanjs-core'

const { div, a } = van.tags

export const AuthorsDisplay = (authors: State<string[]>) => () =>
  authors.val.length > 0
    ? div(
        {
          class: 'current-beat-authors',
          style: 'margin-bottom: 10px; font-size: 12px; color: #888;',
        },
        'Authors: ',
        ...authors.val
          .map((author, index) => [
            a(
              {
                href: `https://x.com/${author}`,
                target: '_blank',
                rel: 'noopener noreferrer',
                style: 'color: #4a9eff; text-decoration: none; margin-right: 8px;',
              },
              `@${author}`
            ),
            index < authors.val.length - 1 ? ', ' : '',
          ])
          .flat()
      )
    : ''
