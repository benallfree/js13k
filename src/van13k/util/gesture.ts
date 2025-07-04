export interface DragState {
  isDragging: boolean
  startX: number
  startY: number
  currentX: number
  currentY: number
  deltaX: number
  deltaY: number
}

export interface GestureCallbacks {
  onTap?: (e: TouchEvent | MouseEvent) => void
  onDragStart?: (state: DragState, e: TouchEvent | MouseEvent) => void
  onDragMove?: (state: DragState, e: TouchEvent | MouseEvent) => void
  onDragEnd?: (state: DragState, e: TouchEvent | MouseEvent) => void
}

export const gesture = ({ onTap, onDragStart, onDragMove, onDragEnd }: GestureCallbacks) => {
  let gestureState: DragState = {
    isDragging: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    deltaX: 0,
    deltaY: 0,
  }

  const tapThreshold = 10 // Pixels to allow minor movement for a tap
  const dragThreshold = 5 // Pixels to start drag detection
  const tapTimeThreshold = 300 // Max time for a tap in milliseconds

  let isMouseDown = false
  let startTime = 0
  let rafId: number | null = null
  let pendingMove = false

  const getEventCoordinates = (e: TouchEvent | MouseEvent) => {
    if (e instanceof TouchEvent) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }
    return { x: e.clientX, y: e.clientY }
  }

  const handleStart = (e: TouchEvent | MouseEvent) => {
    const coords = getEventCoordinates(e)
    startTime = Date.now()

    gestureState = {
      isDragging: false,
      startX: coords.x,
      startY: coords.y,
      currentX: coords.x,
      currentY: coords.y,
      deltaX: 0,
      deltaY: 0,
    }

    if (e instanceof MouseEvent) {
      isMouseDown = true
      // Add document-level mouse event listeners for proper dragging
      document.addEventListener('mousemove', handleDocumentMouseMove)
      document.addEventListener('mouseup', handleDocumentMouseUp)
    }

    // Prevent scrolling on mobile
    e.preventDefault()
  }

  const performMove = (e: TouchEvent | MouseEvent) => {
    const coords = getEventCoordinates(e)
    gestureState.currentX = coords.x
    gestureState.currentY = coords.y
    gestureState.deltaX = coords.x - gestureState.startX
    gestureState.deltaY = coords.y - gestureState.startY

    // Check if we've moved enough to start dragging
    if (!gestureState.isDragging && (onDragStart || onDragMove || onDragEnd)) {
      const distance = Math.sqrt(gestureState.deltaX ** 2 + gestureState.deltaY ** 2)
      if (distance > dragThreshold) {
        gestureState.isDragging = true
        onDragStart?.(gestureState, e)
      }
    }

    // If we're dragging, call the move callback
    if (gestureState.isDragging) {
      onDragMove?.(gestureState, e)
    }

    pendingMove = false
  }

  const handleMove = (e: TouchEvent | MouseEvent) => {
    // Use requestAnimationFrame for smoother updates
    if (!pendingMove) {
      pendingMove = true
      rafId = requestAnimationFrame(() => performMove(e))
    }

    // Prevent scrolling immediately if we're dragging
    if (gestureState.isDragging) {
      e.preventDefault()
    }
  }

  const handleEnd = (e: TouchEvent | MouseEvent) => {
    // Cancel any pending animation frame
    if (rafId) {
      cancelAnimationFrame(rafId)
      rafId = null
    }

    const timeDiff = Date.now() - startTime
    const distance = Math.sqrt(gestureState.deltaX ** 2 + gestureState.deltaY ** 2)

    // Determine if this was a tap or drag
    const wasTap = !gestureState.isDragging && distance <= tapThreshold && timeDiff <= tapTimeThreshold

    if (wasTap && onTap) {
      // Prevent event from bubbling up to parent elements
      e.stopPropagation()
      e.preventDefault()
      onTap(e)
    } else if (gestureState.isDragging && onDragEnd) {
      onDragEnd(gestureState, e)
    }

    if (e instanceof MouseEvent) {
      isMouseDown = false
      // Remove document-level mouse event listeners
      document.removeEventListener('mousemove', handleDocumentMouseMove)
      document.removeEventListener('mouseup', handleDocumentMouseUp)
    }

    // Reset gesture state
    gestureState = {
      isDragging: false,
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      deltaX: 0,
      deltaY: 0,
    }
    pendingMove = false
  }

  // Document-level mouse event handlers
  const handleDocumentMouseMove = (e: MouseEvent) => {
    if (isMouseDown) {
      handleMove(e)
    }
  }

  const handleDocumentMouseUp = (e: MouseEvent) => {
    if (isMouseDown) {
      handleEnd(e)
    }
  }

  // For simple clicks (mouse events only, for compatibility with existing clickify usage)
  const handleClick = (e: Event) => {
    if (onTap && !onDragStart && !onDragMove && !onDragEnd) {
      e.stopPropagation()
      e.preventDefault()
      onTap(e as MouseEvent)
    }
  }

  return {
    // Touch events
    ontouchstart: handleStart,
    ontouchmove: handleMove,
    ontouchend: handleEnd,
    // Mouse events
    onmousedown: handleStart,
    // Simple click handler for tap-only scenarios (only include if not undefined)
    ...(onTap && !onDragStart && !onDragMove && !onDragEnd ? { onclick: handleClick } : {}),
    // Prevent context menu on long press
    oncontextmenu: (e: Event) => e.preventDefault(),
    // Prevent default drag behavior
    ondragstart: (e: Event) => e.preventDefault(),
  }
}

// Legacy compatibility function for existing clickify usage
export const clickify = (onClick: (e: Event) => void) => {
  return gesture({ onTap: onClick })
}
