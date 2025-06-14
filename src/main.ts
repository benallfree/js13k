import van from 'vanjs-core'

const { div, button, style } = van.tags

// Audio context
const ctx = new AudioContext()

// Beat maker state - using van.state for reactivity
const playing = van.state(false)
const currentStep = van.state(0)
const selectedInstrument = van.state(0)
const grid = van.state(
  Array(16)
    .fill(0)
    .map(() => Array(16).fill(0))
) // 16x16 grid
const playingCells = van.state(new Set<string>()) // Track cells currently playing animation
let intervalId: ReturnType<typeof setInterval>

// URL state management
const encodeGrid = (gridData: number[][]) => {
  return gridData
    .flat()
    .map((v) => v.toString(4))
    .join('')
}

const decodeGrid = (encoded: string) => {
  if (!encoded || encoded.length !== 256) return null
  const flat = encoded.split('').map((c) => parseInt(c, 4) || 0)
  const result = []
  for (let i = 0; i < 16; i++) {
    result.push(flat.slice(i * 16, (i + 1) * 16))
  }
  return result
}

const updateUrl = () => {
  const encoded = encodeGrid(grid.val)
  if (encoded !== '0'.repeat(256)) {
    window.location.hash = encoded
  } else {
    window.location.hash = ''
  }
}

const loadFromUrl = () => {
  const hash = window.location.hash.slice(1)
  if (hash) {
    const decoded = decodeGrid(hash)
    if (decoded) {
      grid.val = decoded
    }
  }
}

const instruments = ['K', 'S', 'H'] // Kick, Snare, Hi-hat

// Sound generators
const sounds = {
  0: () => {
    // Kick
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain).connect(ctx.destination)
    osc.frequency.setValueAtTime(60, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
    osc.start()
    osc.stop(ctx.currentTime + 0.3)
  },
  1: () => {
    // Snare
    const noise = ctx.createBufferSource()
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.2, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
    const filter = ctx.createBiquadFilter()
    const gain = ctx.createGain()
    noise.buffer = buffer
    noise.connect(filter).connect(gain).connect(ctx.destination)
    filter.frequency.value = 1000
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2)
    noise.start()
  },
  2: () => {
    // Hi-hat
    const noise = ctx.createBufferSource()
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
    const filter = ctx.createBiquadFilter()
    const gain = ctx.createGain()
    noise.buffer = buffer
    noise.connect(filter).connect(gain).connect(ctx.destination)
    filter.type = 'highpass'
    filter.frequency.value = 7000
    gain.gain.setValueAtTime(0.1, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1)
    noise.start()
  }
}

// Play step
const playStep = () => {
  const currentGrid = grid.val
  const step = currentStep.val
  const newPlayingCells = new Set<string>()

  for (let i = 0; i < 16; i++) {
    if (currentGrid[i][step]) {
      sounds[(currentGrid[i][step] - 1) as keyof typeof sounds]()
      const cellKey = `${i}-${step}`
      newPlayingCells.add(cellKey)
    }
  }

  // Update playing cells
  playingCells.val = newPlayingCells

  // Clear playing animation after a short delay
  setTimeout(() => {
    playingCells.val = new Set()
  }, 100)

  currentStep.val = (currentStep.val + 1) % 16
}

// Toggle play/stop
const togglePlay = () => {
  if (playing.val) {
    clearInterval(intervalId)
    playing.val = false
  } else {
    playing.val = true
    intervalId = setInterval(playStep, 120) // ~125 BPM
  }
}

// Toggle cell
const toggleCell = (row: number, col: number) => {
  const newGrid = grid.val.map((r) => [...r]) // Create deep copy
  newGrid[row][col] =
    newGrid[row][col] === selectedInstrument.val + 1 ? 0 : selectedInstrument.val + 1
  grid.val = newGrid
  updateUrl()
}

// App component
van.add(
  document.getElementById('app')!,
  style(`
    body { font-family: monospace; background: #111; color: #fff; margin: 0; padding: 20px; }
    .grid { display: grid; grid-template-columns: repeat(16, 20px); gap: 2px; margin: 20px 0; }
    .cell { width: 20px; height: 20px; border: 1px solid #333; cursor: pointer; transition: all 0.1s; }
    .cell.k { background: #f44; }
    .cell.s { background: #4f4; }
    .cell.h { background: #44f; }
    .cell.current { border: 2px solid #fff !important; }
    .cell.playing { transform: scale(1.2); box-shadow: 0 0 10px currentColor; }
    .controls { margin: 10px 0; }
    .controls button { margin: 5px; padding: 10px; }
    .instruments button { margin: 2px; padding: 5px 10px; }
    .instruments button.active { background: #555; }
  `),

  div(
    { class: 'controls' },
    button({ onclick: togglePlay }, () => (playing.val ? 'Stop' : 'Play'))
  ),

  div(
    { class: 'instruments' },
    ...instruments.map((inst, i) =>
      button(
        {
          class: () => (selectedInstrument.val === i ? 'active' : ''),
          onclick: () => (selectedInstrument.val = i)
        },
        inst
      )
    )
  ),

  div(
    { class: 'grid' },
    ...Array(16)
      .fill(0)
      .flatMap((_, row) =>
        Array(16)
          .fill(0)
          .map((_, col) =>
            div({
              class: () => {
                const val = grid.val[row][col]
                const cellKey = `${row}-${col}`
                const isCurrent = playing.val && currentStep.val === col
                const isPlaying = playingCells.val.has(cellKey)

                let classes = 'cell'
                if (val) classes += ` ${['k', 's', 'h'][val - 1]}`
                if (isCurrent) classes += ' current'
                if (isPlaying) classes += ' playing'

                return classes
              },
              onclick: () => toggleCell(row, col)
            })
          )
      )
  )
)

// Initialize from URL on page load
loadFromUrl()

// Listen for hash changes
window.addEventListener('hashchange', loadFromUrl)
