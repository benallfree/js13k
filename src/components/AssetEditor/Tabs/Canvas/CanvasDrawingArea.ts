import { div } from '@/van'
import { CustomPalette } from './CustomPalette'
import { PixelEditor } from './PixelEditor'

export type CanvasDrawingAreaProps = {}
export const DefaultCanvasDrawingAreaProps: CanvasDrawingAreaProps = {}
export const CanvasDrawingArea = (props?: Partial<CanvasDrawingAreaProps>) => {
  const {} = { ...DefaultCanvasDrawingAreaProps, ...props }

  return div(PixelEditor({}), CustomPalette({}))
}
