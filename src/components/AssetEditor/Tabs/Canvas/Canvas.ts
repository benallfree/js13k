import { mkClass } from '@/util'
import { div } from '@/van'
import { CanvasAnimationControls } from './CanvasAnimationControls'
import { CanvasDrawingArea } from './CanvasDrawingArea'
import { CanvasPreviewArea } from './CanvasPreviewArea'
import { CanvasToolbar } from './CanvasToolbar'

export const Canvas = () => {
  return div(
    { ...mkClass('Canvas') },
    CanvasToolbar(),
    CanvasAnimationControls(),
    div({ ...mkClass('grid-container') }, CanvasDrawingArea(), CanvasPreviewArea())
  )
}
