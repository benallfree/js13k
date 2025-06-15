import { navigate } from '@/common/router'
import { formatDate } from '@/common/utils'
import { savedBeats } from '../beatState'
import { div, h1, h2, h3, p } from '../common/tags'
import { Beat, generateGuid, loadBeatsFromStorage } from '../storage'
import styles from './Home.module.css'
import { AuthorsDisplay, Button, SplashPage } from './index'

// Create new beat
const createNewBeat = () => {
  const newBeatId = generateGuid()
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
      AuthorsDisplay({
        authors: beat.authors || [],
        className: styles.beatAuthors,
        clickHandler: (e: Event) => e.stopPropagation(),
      })
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
