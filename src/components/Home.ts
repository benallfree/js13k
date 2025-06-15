import { navigate } from '@/common/router'
import { formatDate } from '@/common/utils'
import { savedBeats } from '../beatState'
import { div, h1, h2, h3, p } from '../common/tags'
import { savedSamples } from '../sampleState'
import { Beat, Sample, generateGuid, loadBeatsFromStorage, loadSamplesFromStorage } from '../storage'
import styles from './Home.module.css'
import { AuthorsDisplay, Button, SplashPage } from './index'

// Create new beat
const createNewBeat = () => {
  const newBeatId = generateGuid()
  navigate(`/beats/${newBeatId}`)
}

// Create new sample
const createNewSample = () => {
  const newSampleId = generateGuid()
  navigate(`/samples/${newSampleId}`)
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

// Sample item component
const SampleItem = (sample: Sample) => {
  return div(
    {
      class: styles.beatItem, // Reuse beat item styles
      onclick: () => navigate(`/samples/${sample.id}`),
    },
    div(
      { class: styles.beatInfo },
      h3({ class: styles.beatTitle }, sample.name),
      p({ class: styles.beatMeta }, `Modified: ${formatDate(sample.modified)}`),
      AuthorsDisplay({
        authors: sample.authors || [],
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
    // Load samples library
    savedSamples.val = loadSamplesFromStorage()
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
        p({ class: styles.headerSubtitle }, 'Create, edit, and manage your beats and samples')
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
      ),

      // New Sample Button
      div(
        { class: 'text-center my-5' },
        Button({
          onClick: createNewSample,
          variant: 'secondary',
          children: '🎤 Create New Sample',
        })
      ),

      // Sample Library
      div(
        { class: 'my-5' },
        h2({ class: styles.sectionTitle }, () => `Your Samples (${savedSamples.val.length})`),
        () =>
          savedSamples.val.length === 0
            ? div(
                { class: styles.emptyState },
                p({ class: styles.emptyStateTitle }, '🎤 No samples yet'),
                p({ class: styles.emptyStateSubtitle }, 'Upload your first custom sample!')
              )
            : div(
                { class: styles.beatsContainer }, // Reuse beats container styles
                ...savedSamples.val
                  .sort((a, b) => b.modified - a.modified) // Sort by most recently modified
                  .map((sample) => SampleItem(sample))
              )
      )
    )
  )
}
