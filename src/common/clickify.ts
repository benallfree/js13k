export const clickify = (onClick: (e: Event) => void) => {
  let touchStartX = 0
  let touchStartY = 0
  let isTap = true
  const threshold = 10 // Pixels to allow minor movement for a tap

  const handleClick = (e: Event) => {
    e.stopPropagation()
    e.preventDefault()
    onClick(e)
  }

  const handleTouchStart = (e: TouchEvent) => {
    // Store initial touch coordinates
    touchStartX = e.touches[0].clientX
    touchStartY = e.touches[0].clientY
    isTap = true // Assume it's a tap until movement suggests otherwise
  }

  const handleTouchMove = (e: TouchEvent) => {
    // Calculate movement
    const deltaX = Math.abs(e.touches[0].clientX - touchStartX)
    const deltaY = Math.abs(e.touches[0].clientY - touchStartY)

    // If movement exceeds threshold, it's a scroll, not a tap
    if (deltaX > threshold || deltaY > threshold) {
      isTap = false
    }
  }

  const handleTouchEnd = (e: TouchEvent) => {
    if (isTap) {
      // Handle tap event
      console.log('Tap detected!')
      e.preventDefault()
      onClick(e)
    }
  }

  return {
    onclick: handleClick,
    ontouchstart: handleTouchStart,
    ontouchmove: handleTouchMove,
    ontouchend: handleTouchEnd,
  }
}
