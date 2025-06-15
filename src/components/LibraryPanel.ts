import { State } from 'vanjs-core'
import { Button } from '../common/Button'
import { div, h3 } from '../common/tags'
import { Beat } from '../storage'
import { AuthorsDisplay } from './AuthorsDisplay'
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
                      AuthorsDisplay({
                        authors: beat.authors || [],
                        className: styles.authors,
                      })
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
