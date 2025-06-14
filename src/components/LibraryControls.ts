import van, { State } from 'vanjs-core'

const { div, button } = van.tags

export const LibraryControls = (
  showLibrary: State<boolean>,
  onSave: () => void,
  onNew: () => void,
  onShare: () => void
) =>
  div(
    { class: 'library-controls' },
    button({ onclick: onSave }, 'Save Beat'),
    button({ onclick: onNew }, 'New Beat'),
    button({ onclick: () => (showLibrary.val = !showLibrary.val) }, () =>
      showLibrary.val ? 'Hide Library' : 'Show Library'
    ),
    button({ onclick: onShare }, 'Share Beat')
  )
