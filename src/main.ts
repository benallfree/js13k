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
let intervalId: ReturnType<typeof setInterval>

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
  for (let i = 0; i < 16; i++) {
    if (currentGrid[i][currentStep.val])
      sounds[(currentGrid[i][currentStep.val] - 1) as keyof typeof sounds]()
  }
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
}

// App component
van.add(
  document.getElementById('app')!,
  style(`
    body { font-family: monospace; background: #111; color: #fff; margin: 0; padding: 20px; }
    .grid { display: grid; grid-template-columns: repeat(16, 20px); gap: 2px; margin: 20px 0; }
    .cell { width: 20px; height: 20px; border: 1px solid #333; cursor: pointer; }
    .cell.k { background: #f44; }
    .cell.s { background: #4f4; }
    .cell.h { background: #44f; }
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
                return `cell ${val ? ['k', 's', 'h'][val - 1] : ''}`
              },
              onclick: () => toggleCell(row, col)
            })
          )
      )
  )
)
