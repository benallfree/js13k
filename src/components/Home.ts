import { navigate } from '@/common/router'
import { formatDate } from '@/common/utils'
import { newBeat, savedBeats } from '../beatState'
import { a, div, h1, h2, h3, p } from '../common/tags'
import { Beat, generateGuid, loadBeatsFromStorage } from '../storage'
import styles from './Home.module.css'
import { Button, SplashPage } from './index'

// Create new beat
const createNewBeat = () => {
  const newBeatId = generateGuid()
  newBeat()
  navigate(`/beats/${newBeatId}`)
}

// Beat item component
const BeatItem = (beat: Beat) => {
  return div(
    {
      class: styles.beatItem,
      onclick: () => navigate(`/beats/${beat.id}`),
    },
    div(
      { class: styles.beatInfo },
      h3({ class: styles.beatTitle }, beat.name),
      p({ class: styles.beatMeta }, `Modified: ${formatDate(beat.modified)}`),
      beat.authors && beat.authors.length > 0
        ? p(
            { class: styles.beatAuthors },
            'Authors: ',
            ...beat.authors
              .map((author, index) => [
                a(
                  {
                    href: `https://twitter.com/${author}`,
                    target: '_blank',
                    rel: 'noopener noreferrer',
                    class: 'text-link mr-2',
                    onclick: (e: Event) => e.stopPropagation(),
                  },
                  `@${author}`
                ),
                index < beat.authors.length - 1 ? ', ' : '',
              ])
              .flat()
          )
        : ''
    )
  )
}

export const Home = () => {
  // Initialize app
  const initializeApp = () => {
    // Load beats library
    savedBeats.val = loadBeatsFromStorage()
  }

  // Initialize on component creation
  initializeApp()

  return div(
    { class: 'app' },
    SplashPage(),
    div(
      { class: 'main-content max-w-800 mx-auto' },

      // Header
      div(
        { class: 'text-center my-7 py-5 border-b' },
        h1({ class: styles.headerTitle }, '🎵 Beat Threads'),
        p({ class: styles.headerSubtitle }, 'Create, edit, and manage your beats')
      ),

      // New Beat Button
      div(
        { class: 'text-center my-5' },
        Button({
          onClick: createNewBeat,
          variant: 'primary',
          children: '➕ Create New Beat',
        })
      ),

      // Beat Library
      div(
        { class: 'my-5' },
        h2({ class: styles.sectionTitle }, () => `Your Beats (${savedBeats.val.length})`),
        () =>
          savedBeats.val.length === 0
            ? div(
                { class: styles.emptyState },
                p({ class: styles.emptyStateTitle }, '🎼 No beats yet'),
                p({ class: styles.emptyStateSubtitle }, 'Create your first beat to get started!')
              )
            : div(
                { class: styles.beatsContainer },
                ...savedBeats.val
                  .sort((a, b) => b.modified - a.modified) // Sort by most recently modified
                  .map((beat) => BeatItem(beat))
              )
      )
    )
  )
}
