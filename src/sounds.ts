// Audio context
const ctx = new AudioContext()
export { ctx }

// Import custom sample functions
import { playCustomSample } from '@/components/SampleManager/audioUtils'
import { loadSamplesFromStorage } from '@/components/SampleManager/storage'

export enum InstrumentType {
  Kick = 'K',
  Snare = 'S',
  HiHat = 'H',
  Crash = 'C',
  Tom = 'T',
  Clap = 'P',
  Bell = 'B',
}

// Sample metadata type
export type SampleMetadata = {
  guid: string
  shortName: InstrumentType
  emoji: string
  longName: string
  description: string
}

// Sample metadata
export const sampleMetadata: Record<number, SampleMetadata> = {
  0: {
    guid: 'kick-1',
    shortName: InstrumentType.Kick,
    emoji: '🥁',
    longName: 'Kick Drum',
    description: 'Deep bass drum sound with pitch decay',
  },
  1: {
    guid: 'snare-1',
    shortName: InstrumentType.Snare,
    emoji: '🎯',
    longName: 'Snare Drum',
    description: 'Sharp snare with noise and filter',
  },
  2: {
    guid: 'hihat-1',
    shortName: InstrumentType.HiHat,
    emoji: '🔔',
    longName: 'Hi-Hat',
    description: 'Bright high-frequency cymbal sound',
  },
  3: {
    guid: 'crash-1',
    shortName: InstrumentType.Crash,
    emoji: '💥',
    longName: 'Crash Cymbal',
    description: 'Loud, sustained cymbal crash',
  },
  4: {
    guid: 'tom-1',
    shortName: InstrumentType.Tom,
    emoji: '🥁',
    longName: 'Tom-Tom',
    description: 'Medium-pitched drum with pitch sweep',
  },
  5: {
    guid: 'clap-1',
    shortName: InstrumentType.Clap,
    emoji: '👏',
    longName: 'Clap',
    description: 'Sharp hand clap sound',
  },
  6: {
    guid: 'bell-1',
    shortName: InstrumentType.Bell,
    emoji: '🔔',
    longName: 'Cowbell',
    description: 'Metallic bell sound with two tones',
  },
}

// Shared noise generator
const createNoise = (
  duration: number,
  filterType?: 'highpass' | 'bandpass',
  frequency?: number,
  Q?: number,
  gain = 0.3
) => {
  const noise = ctx.createBufferSource()
  const buffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1

  noise.buffer = buffer
  const gainNode = ctx.createGain()

  if (filterType && frequency) {
    const filter = ctx.createBiquadFilter()
    filter.type = filterType
    filter.frequency.value = frequency
    if (Q) filter.Q.value = Q
    noise.connect(filter).connect(gainNode)
  } else {
    noise.connect(gainNode)
  }

  gainNode.connect(ctx.destination)
  gainNode.gain.setValueAtTime(gain, ctx.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration)
  noise.start()
}

// Stock sound generators
const stockSounds = {
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
  1: () => createNoise(0.2, undefined, 1000, undefined, 0.3), // Snare - simplified
  2: () => createNoise(0.1, 'highpass', 7000, undefined, 0.1), // Hi-hat
  3: () => createNoise(0.5, 'highpass', 5000, undefined, 0.4), // Cymbal Crash
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
  5: () => createNoise(0.3, 'bandpass', 2000, 1, 0.4), // Clap
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
  },
}

/**
 * Play a sound - either custom sample or stock fallback
 * @param hitIdx - The instrument index (0-6)
 * @param sampleMapping - Optional mapping of custom samples
 */
export const playSound = (
  hitIdx: number,
  sampleMapping?: { [hitIdx: number]: { sampleGuid: string; fallbackIdx: number } }
) => {
  // Check if there's a custom sample mapping for this hit
  if (sampleMapping && sampleMapping[hitIdx]) {
    const mapping = sampleMapping[hitIdx]
    const samples = loadSamplesFromStorage()
    const customSample = samples.find((s) => s.id === mapping.sampleGuid)

    if (customSample && customSample.audioData) {
      try {
        playCustomSample(customSample.audioData)
        return
      } catch (error) {
        console.warn('Failed to play custom sample, falling back to stock:', error)
        // Fall through to fallback
      }
    }

    // Use fallback sample
    const fallbackSound = stockSounds[mapping.fallbackIdx as keyof typeof stockSounds]
    if (fallbackSound) {
      fallbackSound()
      return
    }
  }

  // Use stock sound for this hit index
  const stockSound = stockSounds[hitIdx as keyof typeof stockSounds]
  if (stockSound) {
    stockSound()
  }
}
