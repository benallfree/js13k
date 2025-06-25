import { Player } from '@/types'
import { RoomEventType, service, State, van } from '@van13k'
import { useNetManager } from '../NetManager/NetManager'

export type SoundManagerService = {
  playCollisionSound: () => void
  isMuted: State<boolean>
}

type CarTrackingData = {
  // Audio nodes
  oscillator: OscillatorNode
  rumbleOscillator: OscillatorNode
  gainNode: GainNode
  rumbleGain: GainNode
  pannerNode?: PannerNode // Only for remote cars

  // Movement tracking
  lastPosition: { x: number; y: number }
  lastUpdateTime: number
  currentSpeed: number

  // Audio characteristics
  rumbleOffset: number
  rumbleSpeed: number
  baseFreqOffset: number

  // RPM state
  currentRPM: number
  targetRPM: number

  isLocal: boolean
}

export const SoundManager = () => {
  const isMuted = van.state(false)
  let audioContext: AudioContext | null = null
  let activeSounds = 0
  const maxConcurrentSounds = 3

  // Get access to the room through NetManager
  const netManager = useNetManager()
  const { room, isConnected } = netManager

  // Centralized car tracking
  const cars = new Map<string, CarTrackingData>()
  let rafId: number | null = null

  // Listener position for spatial audio
  let listenerPosition = { x: 0, y: 0 }

  // Collision debouncing
  const lastCollisionTimes = new Map<string, number>()
  const collisionDebounceMs = 500

  // Initialize AudioContext lazily
  const getAudioContext = () => {
    if (!audioContext) {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      // Set up spatial audio listener
      if (audioContext.listener) {
        audioContext.listener.positionX?.setValueAtTime(0, audioContext.currentTime)
        audioContext.listener.positionY?.setValueAtTime(0, audioContext.currentTime)
        audioContext.listener.positionZ?.setValueAtTime(0, audioContext.currentTime)
        audioContext.listener.forwardX?.setValueAtTime(0, audioContext.currentTime)
        audioContext.listener.forwardY?.setValueAtTime(-1, audioContext.currentTime)
        audioContext.listener.forwardZ?.setValueAtTime(0, audioContext.currentTime)
        audioContext.listener.upX?.setValueAtTime(0, audioContext.currentTime)
        audioContext.listener.upY?.setValueAtTime(0, audioContext.currentTime)
        audioContext.listener.upZ?.setValueAtTime(1, audioContext.currentTime)
      }
    }
    return audioContext
  }

  // Collision sound frequencies
  const collisionFrequencies = [440, 330, 523, 392, 494] // A4, E4, C5, G4, B4

  // RPM sound configuration
  const RPM_CONFIG = {
    idleFreq: 80, // Hz - idle engine frequency
    maxFreq: 300, // Hz - max engine frequency
    idleVolume: 0.04, // Very quiet idle
    maxVolume: 0.12, // Moderate volume at max
    smoothing: 0.95, // RPM smoothing factor
    rumbleDepth: 8, // Hz - how much rumble affects frequency
    rumbleVolume: 0.02, // Volume of rumble oscillator
    maxSpeed: 400, // Max speed for RPM calculation
    speedSmoothing: 0.8, // Speed smoothing factor
  }

  // Generate unique rumble characteristics based on player ID
  const generateRumbleCharacteristics = (playerId: string) => {
    // Use player ID as seed for consistent characteristics
    let hash = 0
    for (let i = 0; i < playerId.length; i++) {
      hash = ((hash << 5) - hash + playerId.charCodeAt(i)) & 0xffffffff
    }
    const normalizedHash = Math.abs(hash) / 0xffffffff

    return {
      rumbleOffset: 2 + normalizedHash * 6, // 2-8 Hz rumble frequency
      rumbleSpeed: 0.5 + normalizedHash * 1.5, // 0.5-2.0 Hz rumble speed variation
      baseFreqOffset: -10 + normalizedHash * 20, // -10 to +10 Hz base frequency variation
    }
  }

  function createCollisionSound(frequency: number, duration: number) {
    if (isMuted.val || activeSounds >= maxConcurrentSounds) return

    activeSounds++
    const ctx = getAudioContext()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    // Create a harsh, metallic collision sound
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.3, ctx.currentTime + duration)

    gainNode.gain.setValueAtTime(0.2, ctx.currentTime) // Reduced volume
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration)

    oscillator.type = 'sawtooth'
    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + duration)

    // Track when sound ends
    setTimeout(() => {
      activeSounds = Math.max(0, activeSounds - 1)
    }, duration * 1000)
  }

  function startCarSound(playerId: string, isLocal: boolean) {
    if (isMuted.val || cars.has(playerId)) return

    const ctx = getAudioContext()
    const characteristics = generateRumbleCharacteristics(playerId)

    const oscillator = ctx.createOscillator()
    const rumbleOscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()
    const rumbleGain = ctx.createGain()
    let pannerNode: PannerNode | undefined

    // Set up audio routing
    if (isLocal) {
      // Local car: direct routing
      oscillator.connect(gainNode)
      rumbleOscillator.connect(rumbleGain)
      rumbleGain.connect(gainNode.gain) // Modulate main volume
      gainNode.connect(ctx.destination)
    } else {
      // Remote car: spatial audio
      pannerNode = ctx.createPanner()
      pannerNode.panningModel = 'HRTF'
      pannerNode.distanceModel = 'exponential'
      pannerNode.refDistance = 100
      pannerNode.maxDistance = 1000
      pannerNode.rolloffFactor = 2

      oscillator.connect(gainNode)
      rumbleOscillator.connect(rumbleGain)
      rumbleGain.connect(gainNode.gain)
      gainNode.connect(pannerNode)
      pannerNode.connect(ctx.destination)
    }

    oscillator.type = 'sawtooth'
    oscillator.frequency.setValueAtTime(RPM_CONFIG.idleFreq + characteristics.baseFreqOffset, ctx.currentTime)
    gainNode.gain.setValueAtTime(isLocal ? RPM_CONFIG.idleVolume : 0, ctx.currentTime)

    rumbleOscillator.type = 'sine'
    rumbleOscillator.frequency.setValueAtTime(characteristics.rumbleOffset, ctx.currentTime)
    rumbleGain.gain.setValueAtTime(RPM_CONFIG.rumbleVolume, ctx.currentTime)

    oscillator.start()
    rumbleOscillator.start()

    // Get initial position from room
    const player = room?.getAllPlayers().find((p) => p.id === playerId)
    const initialPosition = player ? player.position : { x: 0, y: 0 }

    cars.set(playerId, {
      oscillator,
      rumbleOscillator,
      gainNode,
      rumbleGain,
      pannerNode,
      lastPosition: initialPosition,
      lastUpdateTime: performance.now(),
      currentSpeed: 0,
      rumbleOffset: characteristics.rumbleOffset,
      rumbleSpeed: characteristics.rumbleSpeed,
      baseFreqOffset: characteristics.baseFreqOffset,
      currentRPM: 0,
      targetRPM: 0,
      isLocal,
    })

    // Start main loop if not already running
    if (!rafId) {
      startMainLoop()
    }
  }

  function stopCarSound(playerId: string) {
    const car = cars.get(playerId)
    if (car) {
      car.oscillator.stop()
      car.rumbleOscillator.stop()
      cars.delete(playerId)
    }

    // Stop main loop if no cars left
    if (cars.size === 0 && rafId) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
  }

  function stopAllCarSounds() {
    for (const playerId of cars.keys()) {
      stopCarSound(playerId)
    }
  }

  function startMainLoop() {
    const loop = (currentTime: number) => {
      if (cars.size === 0) {
        rafId = null
        return
      }

      updateAllCarTracking(currentTime)
      animateAllCars(currentTime)

      rafId = requestAnimationFrame(loop)
    }

    rafId = requestAnimationFrame(loop)
  }

  function updateAllCarTracking(currentTime: number) {
    if (!room) return

    const allPlayers = room.getAllPlayers()
    const localPlayer = room.getLocalPlayer()

    // Update listener position based on local player
    if (localPlayer) {
      listenerPosition = localPlayer.position
      const ctx = getAudioContext()
      if (ctx.listener) {
        ctx.listener.positionX?.setValueAtTime(localPlayer.position.x * 0.01, ctx.currentTime)
        ctx.listener.positionZ?.setValueAtTime(-localPlayer.position.y * 0.01, ctx.currentTime)
      }
    }

    // Track all connected players
    for (const player of allPlayers) {
      if (!player.isConnected) continue

      // Start car sound if not already running
      if (!cars.has(player.id) && !isMuted.val) {
        startCarSound(player.id, player.isLocal)
        continue // Skip this frame for newly added cars
      }

      const car = cars.get(player.id)
      if (!car) continue

      // Calculate speed based on position change
      const deltaTime = (currentTime - car.lastUpdateTime) / 1000 // Convert to seconds

      if (deltaTime > 0) {
        const deltaX = player.position.x - car.lastPosition.x
        const deltaY = player.position.y - car.lastPosition.y
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
        const actualSpeed = distance / deltaTime

        // Smooth speed changes
        car.currentSpeed = car.currentSpeed * RPM_CONFIG.speedSmoothing + actualSpeed * (1 - RPM_CONFIG.speedSmoothing)

        // Calculate RPM based on actual movement
        const speedPercent = Math.max(0, Math.min(1, car.currentSpeed / RPM_CONFIG.maxSpeed))
        car.targetRPM = speedPercent

        // Update tracking data
        car.lastPosition = player.position
        car.lastUpdateTime = currentTime
      }

      // Update spatial position for remote cars
      if (!player.isLocal && car.pannerNode) {
        const relativeX = player.position.x - listenerPosition.x
        const relativeY = player.position.y - listenerPosition.y

        const ctx = getAudioContext()
        car.pannerNode.positionX?.setValueAtTime(relativeX * 0.01, ctx.currentTime)
        car.pannerNode.positionY?.setValueAtTime(0, ctx.currentTime)
        car.pannerNode.positionZ?.setValueAtTime(-relativeY * 0.01, ctx.currentTime)
      }
    }

    // Remove cars for players that are no longer connected
    for (const [playerId, car] of cars) {
      const player = allPlayers.find((p) => p.id === playerId)
      if (!player || !player.isConnected) {
        stopCarSound(playerId)
      }
    }
  }

  function animateAllCars(currentTime: number) {
    const ctx = getAudioContext()

    for (const [playerId, car] of cars) {
      // Smooth RPM changes
      car.currentRPM = car.currentRPM * RPM_CONFIG.smoothing + car.targetRPM * (1 - RPM_CONFIG.smoothing)

      // Calculate frequency and volume based on RPM
      const rpmPercent = Math.max(0, Math.min(1, car.currentRPM))
      const baseFrequency = RPM_CONFIG.idleFreq + (RPM_CONFIG.maxFreq - RPM_CONFIG.idleFreq) * rpmPercent
      const volume = RPM_CONFIG.idleVolume + (RPM_CONFIG.maxVolume - RPM_CONFIG.idleVolume) * rpmPercent

      // Add rumble variation
      const rumbleVariation = Math.sin(currentTime * 0.001 * car.rumbleSpeed) * RPM_CONFIG.rumbleDepth
      const finalFrequency = baseFrequency + car.baseFreqOffset + rumbleVariation

      // Apply volume scaling for remote cars
      const finalVolume = car.isLocal ? volume : volume * 0.7

      car.oscillator.frequency.setValueAtTime(finalFrequency, ctx.currentTime)
      car.gainNode.gain.setValueAtTime(isMuted.val ? 0 : finalVolume, ctx.currentTime)

      // Vary rumble speed
      car.rumbleOscillator.frequency.setValueAtTime(
        car.rumbleOffset + Math.sin(currentTime * 0.002) * 2,
        ctx.currentTime
      )
    }
  }

  function initializePlayerSounds() {
    if (!room || !isConnected.val || isMuted.val) return

    const allPlayers = room.getAllPlayers()
    for (const player of allPlayers) {
      if (player.isConnected && !cars.has(player.id)) {
        startCarSound(player.id, player.isLocal)
      }
    }
  }

  const playCollisionSound = () => {
    if (isMuted.val || activeSounds >= maxConcurrentSounds) return

    // Play a random collision sound
    const randomFreq = collisionFrequencies[Math.floor(Math.random() * collisionFrequencies.length)]
    createCollisionSound(randomFreq, 0.3)
  }

  // Reactive state management
  van.derive(() => {
    if (isMuted.val) {
      // Stop all car sounds when muted
      stopAllCarSounds()
    } else if (isConnected.val && room) {
      // Start car sounds when unmuted and connected
      setTimeout(initializePlayerSounds, 100) // Small delay to ensure room is ready
    }
  })

  // React to connection state changes
  van.derive(() => {
    if (isConnected.val && room && !isMuted.val) {
      // Initialize sounds when connected
      setTimeout(initializePlayerSounds, 100)
    } else if (!isConnected.val) {
      // Stop all sounds when disconnected
      stopAllCarSounds()
    }
  })

  // Set up room event listeners when room becomes available
  van.derive(() => {
    if (!room) return

    // Handle collision sounds from player updates
    room.on(RoomEventType.PlayerUpdated, ({ data: player }) => {
      const typedPlayer = player as Player
      if (typedPlayer.collision) {
        const now = Date.now()
        const lastCollisionTime = lastCollisionTimes.get(typedPlayer.id) || 0
        const shouldPlaySound = now - lastCollisionTime > collisionDebounceMs

        if (shouldPlaySound) {
          playCollisionSound()
          lastCollisionTimes.set(typedPlayer.id, now)
        }
      }
    })

    // Handle collision sounds from player mutations
    room.on(RoomEventType.PlayerMutated, ({ data: player }) => {
      const typedPlayer = player as Player
      if (typedPlayer.collision) {
        const now = Date.now()
        const lastCollisionTime = lastCollisionTimes.get(typedPlayer.id) || 0
        const shouldPlaySound = now - lastCollisionTime > collisionDebounceMs

        if (shouldPlaySound) {
          playCollisionSound()
          lastCollisionTimes.set(typedPlayer.id, now)
        }
      }
    })

    // Handle player leaving
    room.on(RoomEventType.PlayerLeft, ({ data: player }) => {
      stopCarSound(player.id)
      lastCollisionTimes.delete(player.id)
    })

    // Handle player joining - start their car sound
    room.on(RoomEventType.PlayerJoined, ({ data: player }) => {
      if (!isMuted.val && player.isConnected) {
        setTimeout(() => startCarSound(player.id, player.isLocal), 100)
      }
    })
  })

  service<SoundManagerService>('sound', {
    playCollisionSound,
    isMuted,
  })
}

export const useSoundManager = () => {
  const soundManager = service<SoundManagerService>('sound')
  return soundManager
}
