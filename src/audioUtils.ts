// Audio processing utilities for custom samples

/**
 * Process an audio file and return both original and downsampled versions
 * @param file - Audio file to process
 * @returns Promise with original (Float32) and downsampled (8-bit PCM) audio data plus duration
 */
export const processAudioFileWithOriginal = async (
  file: File
): Promise<{
  originalAudioData: string
  downsampledAudioData: string
  duration: number
}> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer
        const audioContext = new AudioContext()
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)

        // Store original audio data (convert to mono if needed)
        const originalData = audioBuffer.getChannelData(0) // Get first channel for mono
        const originalAudioData = float32ArrayToBase64(originalData)

        // Downsample to 8kHz mono
        const targetSampleRate = 8000
        const sourceSampleRate = audioBuffer.sampleRate
        const duration = audioBuffer.duration

        // Calculate downsample ratio
        const ratio = sourceSampleRate / targetSampleRate
        const newLength = Math.floor(originalData.length / ratio)
        const downsampledFloat32 = new Float32Array(newLength)

        // Simple decimation downsampling
        for (let i = 0; i < newLength; i++) {
          const sourceIndex = Math.floor(i * ratio)
          downsampledFloat32[i] = originalData[sourceIndex]
        }

        // Convert to 8-bit PCM (0-255 range)
        const downsampledPCM8 = new Uint8Array(newLength)
        for (let i = 0; i < newLength; i++) {
          // Convert from -1,1 float range to 0-255 uint8 range
          const sample = Math.max(-1, Math.min(1, downsampledFloat32[i]))
          downsampledPCM8[i] = Math.round((sample + 1) * 127.5)
        }

        // Convert to base64
        const downsampledAudioData = uint8ArrayToBase64(downsampledPCM8)

        resolve({ originalAudioData, downsampledAudioData, duration })
      } catch (error) {
        reject(error)
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsArrayBuffer(file)
  })
}

/**
 * Process an audio file and downsample to 8kHz mono (legacy compatibility)
 * @param file - Audio file to process
 * @returns Promise with processed audio data and duration
 */
export const processAudioFile = async (file: File): Promise<{ audioData: string; duration: number }> => {
  const { downsampledAudioData, duration } = await processAudioFileWithOriginal(file)
  return { audioData: downsampledAudioData, duration }
}

/**
 * Generate PCM waveform data for visualization
 * @param audioData - Base64 encoded audio data (Float32 or 8-bit PCM)
 * @param width - Width of the waveform display
 * @param is8Bit - Whether the data is 8-bit PCM (default: false, assumes Float32)
 * @returns Array of waveform values normalized to 0-1
 */
export const generateWaveform = (audioData: string, width: number = 800, is8Bit: boolean = false): number[] => {
  try {
    let floatArray: Float32Array

    if (is8Bit) {
      // Convert 8-bit PCM to Float32 for visualization
      const uint8Array = base64ToUint8Array(audioData)
      floatArray = new Float32Array(uint8Array.length)
      for (let i = 0; i < uint8Array.length; i++) {
        // Convert from 0-255 uint8 range to -1,1 float range
        floatArray[i] = uint8Array[i] / 127.5 - 1
      }
    } else {
      // Assume Float32 data
      const arrayBuffer = base64ToArrayBuffer(audioData)
      floatArray = new Float32Array(arrayBuffer)
    }

    const chunkSize = Math.ceil(floatArray.length / width)
    const waveform: number[] = []

    for (let i = 0; i < width; i++) {
      const start = i * chunkSize
      const end = Math.min(start + chunkSize, floatArray.length)

      let max = 0
      for (let j = start; j < end; j++) {
        max = Math.max(max, Math.abs(floatArray[j]))
      }

      waveform.push(max)
    }

    return waveform
  } catch (error) {
    console.error('Error generating waveform:', error)
    return new Array(width).fill(0)
  }
}

/**
 * Apply trim to 8-bit PCM audio data and return trimmed version
 * @param audioData - Base64 encoded 8-bit PCM audio data
 * @param trimStart - Start position (0-1)
 * @param trimEnd - End position (0-1)
 * @returns Trimmed audio data and new duration
 */
export const getTrimmedAudioData = (
  audioData: string,
  trimStart: number,
  trimEnd: number
): { audioData: string; duration: number } => {
  try {
    const uint8Array = base64ToUint8Array(audioData)

    const startIndex = Math.floor(trimStart * uint8Array.length)
    const endIndex = Math.floor(trimEnd * uint8Array.length)
    const trimmedArray = uint8Array.slice(startIndex, endIndex)

    // Calculate new duration (assuming 8kHz sample rate)
    const duration = trimmedArray.length / 8000
    const newAudioData = uint8ArrayToBase64(trimmedArray)

    return { audioData: newAudioData, duration }
  } catch {
    throw new Error('Failed to trim audio')
  }
}

/**
 * Trim audio data based on start and end positions (legacy compatibility)
 * @param audioData - Base64 encoded audio data
 * @param trimStart - Start position (0-1)
 * @param trimEnd - End position (0-1)
 * @returns Trimmed audio data and new duration
 */
export const trimAudio = getTrimmedAudioData

/**
 * Play 8-bit PCM audio data using Web Audio API
 * @param audioData - Base64 encoded 8-bit PCM audio data
 */
export const playCustomSample = (audioData: string): void => {
  try {
    // Convert 8-bit PCM back to Float32 for playback
    const uint8Array = base64ToUint8Array(audioData)
    const floatArray = new Float32Array(uint8Array.length)

    for (let i = 0; i < uint8Array.length; i++) {
      // Convert from 0-255 uint8 range to -1,1 float range
      floatArray[i] = uint8Array[i] / 127.5 - 1
    }

    const audioContext = new AudioContext()
    const buffer = audioContext.createBuffer(1, floatArray.length, 8000) // 8kHz mono
    buffer.copyToChannel(floatArray, 0)

    const source = audioContext.createBufferSource()
    source.buffer = buffer
    source.connect(audioContext.destination)
    source.start()
  } catch (error) {
    console.error('Failed to play custom sample:', error)
  }
}

/**
 * Convert Float32Array to base64 string
 */
const float32ArrayToBase64 = (floatArray: Float32Array): string => {
  const bytes = new Uint8Array(floatArray.buffer)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

/**
 * Convert Uint8Array to base64 string
 */
const uint8ArrayToBase64 = (uint8Array: Uint8Array): string => {
  let binary = ''
  for (let i = 0; i < uint8Array.length; i++) {
    binary += String.fromCharCode(uint8Array[i])
  }
  return btoa(binary)
}

/**
 * Convert base64 string to Uint8Array
 */
const base64ToUint8Array = (base64: string): Uint8Array => {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

/**
 * Convert ArrayBuffer to base64 string
 */
const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

/**
 * Convert base64 string to ArrayBuffer
 */
const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}
