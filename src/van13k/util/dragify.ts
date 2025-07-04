export interface DragState {
  isDragging: boolean
  startX: number
  startY: number
  currentX: number
  currentY: number
  deltaX: number
  deltaY: number
}

export interface DragCallbacks {
  onDragStart?: (state: DragState, e: TouchEvent | MouseEvent) => void
  onDragMove?: (state: DragState, e: TouchEvent | MouseEvent) => void
  onDragEnd?: (state: DragState, e: TouchEvent | MouseEvent) => void
}

export const dragify = ({ onDragStart, onDragMove, onDragEnd }: DragCallbacks) => {
  let dragState: DragState = {
    isDragging: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    deltaX: 0,
    deltaY: 0,
  }

  const threshold = 5 // Reduced threshold for more responsive drag start
  let isMouseDown = false
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
    dragState = {
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
    dragState.currentX = coords.x
    dragState.currentY = coords.y
    dragState.deltaX = coords.x - dragState.startX
    dragState.deltaY = coords.y - dragState.startY

    // Check if we've moved enough to start dragging
    if (!dragState.isDragging) {
      const distance = Math.sqrt(dragState.deltaX ** 2 + dragState.deltaY ** 2)
      if (distance > threshold) {
        dragState.isDragging = true
        onDragStart?.(dragState, e)
      }
    }

    // If we're dragging, call the move callback
    if (dragState.isDragging) {
      onDragMove?.(dragState, e)
    }

    pendingMove = false
  }

  const handleMove = (e: TouchEvent | MouseEvent) => {
    // Use requestAnimationFrame for smoother updates
    if (!pendingMove) {
      pendingMove = true
      rafId = requestAnimationFrame(() => performMove(e))
    }

    // Prevent scrolling immediately
    if (dragState.isDragging) {
      e.preventDefault()
    }
  }

  const handleEnd = (e: TouchEvent | MouseEvent) => {
    // Cancel any pending animation frame
    if (rafId) {
      cancelAnimationFrame(rafId)
      rafId = null
    }

    if (dragState.isDragging) {
      onDragEnd?.(dragState, e)
    }

    if (e instanceof MouseEvent) {
      isMouseDown = false
      // Remove document-level mouse event listeners
      document.removeEventListener('mousemove', handleDocumentMouseMove)
      document.removeEventListener('mouseup', handleDocumentMouseUp)
    }

    // Reset drag state
    dragState = {
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

  return {
    // Touch events
    ontouchstart: handleStart,
    ontouchmove: handleMove,
    ontouchend: handleEnd,
    // Mouse events (only mousedown on element, move/up handled on document)
    onmousedown: handleStart,
    // Prevent context menu on long press
    oncontextmenu: (e: Event) => e.preventDefault(),
    // Prevent default drag behavior
    ondragstart: (e: Event) => e.preventDefault(),
  }
}
