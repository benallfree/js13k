import { State } from 'vanjs-core'
import { Button } from '../common/Button'
import { a, div, h3 } from '../common/tags'
import { Beat } from '../storage'
import styles from './LibraryPanel.module.css'

export const LibraryPanel =
  (
    showLibrary: State<boolean>,
    savedBeats: State<Beat[]>,
    formatDate: (timestamp: number) => string,
    onLoad: (beat: Beat) => void,
    onDelete: (beatId: string) => void
  ) =>
  () =>
    showLibrary.val
      ? div(
          { class: styles.libraryPanel },
          h3(`Beat Library (${savedBeats.val.length} beats)`),
          savedBeats.val.length === 0
            ? div('No saved beats yet. Create and save your first beat!')
            : div(
                { class: styles.beatList },
                ...savedBeats.val.map((beat) =>
                  div(
                    { class: styles.beatItem },
                    div(
                      { class: styles.beatInfo },
                      div(beat.name),
                      div({ class: 'text-sm text-gray' }, `Modified: ${formatDate(beat.modified)}`),
                      beat.authors && beat.authors.length > 0
                        ? div(
                            { class: styles.authors },
                            'Authors: ',
                            ...beat.authors
                              .map((author, index) => [
                                a(
                                  {
                                    href: `https://twitter.com/${author}`,
                                    target: '_blank',
                                    rel: 'noopener noreferrer',
                                  },
                                  `@${author}`
                                ),
                                index < beat.authors.length - 1 ? ', ' : '',
                              ])
                              .flat()
                          )
                        : ''
                    ),
                    div(
                      { class: 'flex gap-1' },
                      Button({ onClick: () => onLoad(beat), size: 'sm', children: 'Load' }),
                      Button({
                        onClick: () => onDelete(beat.id),
                        variant: 'danger',
                        size: 'sm',
                        children: 'Delete',
                      })
                    )
                  )
                )
              )
        )
      : ''
