// Audio context
const ctx = new AudioContext()
export { ctx }

// Sound generators
export const sounds = {
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
  },
  3: () => {
    // Cymbal Crash
    const noise = ctx.createBufferSource()
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
    const filter = ctx.createBiquadFilter()
    const gain = ctx.createGain()
    noise.buffer = buffer
    noise.connect(filter).connect(gain).connect(ctx.destination)
    filter.type = 'highpass'
    filter.frequency.value = 5000
    gain.gain.setValueAtTime(0.4, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5)
    noise.start()
  },
  4: () => {
    // Tom-tom
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain).connect(ctx.destination)
    osc.frequency.setValueAtTime(150, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.2)
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2)
    osc.start()
    osc.stop(ctx.currentTime + 0.2)
  },
  5: () => {
    // Clap
    const noise = ctx.createBufferSource()
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.3, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
    const filter = ctx.createBiquadFilter()
    const gain = ctx.createGain()
    noise.buffer = buffer
    noise.connect(filter).connect(gain).connect(ctx.destination)
    filter.type = 'bandpass'
    filter.frequency.value = 2000
    filter.Q.value = 1
    gain.gain.setValueAtTime(0.4, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
    noise.start()
  },
  6: () => {
    // Cowbell
    const osc1 = ctx.createOscillator()
    const osc2 = ctx.createOscillator()
    const gain = ctx.createGain()
    osc1.connect(gain)
    osc2.connect(gain)
    gain.connect(ctx.destination)
    osc1.frequency.setValueAtTime(800, ctx.currentTime)
    osc2.frequency.setValueAtTime(1200, ctx.currentTime)
    gain.gain.setValueAtTime(0.2, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
    osc1.start()
    osc2.start()
    osc1.stop(ctx.currentTime + 0.3)
    osc2.stop(ctx.currentTime + 0.3)
  }
}

export const instruments = ['K', 'S', 'H', 'C', 'T', 'P', 'B'] // Kick, Snare, Hi-hat, Crash, Tom, Clap, Bell
