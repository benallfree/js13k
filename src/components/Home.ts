import van from 'vanjs-core'
import { navigate } from 'vanjs-routing'
import { deleteBeat, newBeat, savedBeats } from '../beatState'
import { a, div, h1, h2, h3, p } from '../common/tags'
import { Beat, generateGuid, loadBeatsFromStorage, loadXHandleFromStorage, saveXHandleToStorage } from '../storage'
import { Button, SplashPage, StatusBar, XHandleModal } from './index'

// Status bar state
const statusMessage = van.state('')
const statusVisible = van.state(false)
let statusTimeoutId: ReturnType<typeof setTimeout>

// X Handle state and modal
const xHandle = van.state('')
const showXHandleModal = van.state(false)
const tempXHandle = van.state('')

// Status bar functions
const showStatus = (message: string, duration = 2000) => {
  if (statusTimeoutId) {
    clearTimeout(statusTimeoutId)
  }

  statusMessage.val = message
  statusVisible.val = true

  statusTimeoutId = setTimeout(() => {
    statusVisible.val = false
  }, duration)
}

// Save X handle
const saveXHandle = () => {
  xHandle.val = tempXHandle.val
  saveXHandleToStorage(tempXHandle.val)
  showXHandleModal.val = false
  if (tempXHandle.val) {
    showStatus(`👋 Welcome, @${tempXHandle.val}!`)
  }
}

const skipXHandle = () => {
  showXHandleModal.val = false
  showStatus('👋 Welcome to Beat Threads!')
}

// Format date helper
const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

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
      class: 'beat-item',
      style: `
        background: #333; 
        border: 1px solid #555; 
        padding: 15px; 
        margin: 10px 0; 
        border-radius: 4px; 
        cursor: pointer;
        transition: background 0.2s;
      `,
      onmouseover: (e: MouseEvent) => {
        ;(e.target as HTMLElement).style.background = '#444'
      },
      onmouseout: (e: MouseEvent) => {
        ;(e.target as HTMLElement).style.background = '#333'
      },
      onclick: () => navigate(`/beats/${beat.id}`),
    },
    div(
      { class: 'beat-info', style: 'flex: 1;' },
      h3({ style: 'margin: 0 0 8px 0; color: #fff;' }, beat.name),
      p({ style: 'margin: 4px 0; color: #999; font-size: 12px;' }, `Modified: ${formatDate(beat.modified)}`),
      beat.authors && beat.authors.length > 0
        ? p(
            { style: 'margin: 4px 0; font-size: 11px; color: #888;' },
            'Authors: ',
            ...beat.authors
              .map((author, index) => [
                a(
                  {
                    href: `https://twitter.com/${author}`,
                    target: '_blank',
                    rel: 'noopener noreferrer',
                    style: 'color: #4a9eff; text-decoration: none; margin-right: 8px;',
                    onclick: (e: Event) => e.stopPropagation(),
                  },
                  `@${author}`
                ),
                index < beat.authors.length - 1 ? ', ' : '',
              ])
              .flat()
          )
        : '',
      p({ style: 'margin: 4px 0; color: #666; font-size: 10px; font-family: monospace;' }, `ID: ${beat.id}`)
    ),
    div(
      { style: 'display: flex; gap: 8px; margin-top: 10px;' },
      Button({
        onClick: () => {
          navigate(`/beats/${beat.id}`)
        },
        variant: 'primary',
        size: 'sm',
        children: 'Edit',
      }),
      Button({
        onClick: () => {
          if (confirm(`Are you sure you want to delete "${beat.name}"?`)) {
            deleteBeat(beat.id)
            showStatus(`🗑️ Beat "${beat.name}" deleted`)
          }
        },
        variant: 'danger',
        size: 'sm',
        children: 'Delete',
      })
    )
  )
}

export const Home = () => {
  // Initialize app
  const initializeApp = () => {
    // Load X handle from storage
    xHandle.val = loadXHandleFromStorage()

    // Load beats library
    savedBeats.val = loadBeatsFromStorage()

    // Show X handle modal if not set
    if (!xHandle.val) {
      showXHandleModal.val = true
    }
  }

  // Initialize on component creation
  initializeApp()

  return div(
    { class: 'app' },
    SplashPage(),
    div(
      { class: 'main-content', style: 'max-width: 800px; margin: 0 auto;' },
      StatusBar(statusMessage, statusVisible),
      XHandleModal(showXHandleModal, tempXHandle, saveXHandle, skipXHandle),

      // Header
      div(
        { style: 'text-align: center; margin: 20px 0 30px 0; padding: 20px 0; border-bottom: 1px solid #333;' },
        h1({ style: 'margin: 0 0 10px 0; color: #fff; font-size: 28px;' }, '🎵 Beat Threads'),
        p({ style: 'margin: 0; color: #999; font-size: 14px;' }, 'Create, edit, and manage your beats')
      ),

      // New Beat Button
      div(
        { style: 'text-align: center; margin: 20px 0;' },
        Button({
          onClick: createNewBeat,
          variant: 'primary',
          children: '➕ Create New Beat',
        })
      ),

      // Beat Library
      div(
        { style: 'margin: 20px 0;' },
        h2(
          { style: 'margin: 0 0 15px 0; color: #fff; font-size: 20px;' },
          () => `Your Beats (${savedBeats.val.length})`
        ),
        () =>
          savedBeats.val.length === 0
            ? div(
                {
                  style: `
                  text-align: center; 
                  padding: 40px 20px; 
                  background: #222; 
                  border: 2px dashed #555; 
                  border-radius: 8px; 
                  margin: 20px 0;
                `,
                },
                p({ style: 'margin: 0 0 15px 0; color: #999; font-size: 16px;' }, '🎼 No beats yet'),
                p({ style: 'margin: 0; color: #777; font-size: 14px;' }, 'Create your first beat to get started!')
              )
            : div(
                { style: 'margin-top: 15px;' },
                ...savedBeats.val
                  .sort((a, b) => b.modified - a.modified) // Sort by most recently modified
                  .map((beat) => BeatItem(beat))
              )
      )
    )
  )
}
