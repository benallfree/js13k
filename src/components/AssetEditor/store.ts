import { RGB_GREEN, RGB_TRANSPARENT, SPRITE_SIZE } from '@/constants'
import { AssetState, RgbHex, RgbaHex, rgbToRgba, rgbaToRgb } from '@/types'
import { range, uniq } from '@/util'
import { State, state, toReadOnlyState } from '@/van'
import { AsyncReturnType } from 'type-fest'
import {
  Canvas,
  blitImageDataToCanvas,
  blitImageToCanvas,
  clearPixel,
  createCanvas,
  ctx,
  dataUrlToImage,
  drawPixel,
  getCanvasPixelDataAsCssHexColorArray,
  getCanvasSlice
} from './Tabs/Canvas/canvas-helpers'
import { EditorTools } from './Tools/tool'

export type Palette = RgbHex[]

function createPaletteFromCanvas(canvas: Canvas): Palette {
  const nonTransparent = uniq(getCanvasPixelDataAsCssHexColorArray(canvas))
    .filter((c) => c !== RGB_TRANSPARENT)
    .map(rgbaToRgb)
  return nonTransparent
}

export type AssetEditorApi = AsyncReturnType<typeof createAssetEditorStore>

export const createAssetEditorStore = async (asset: AssetState) => {
  const image = await dataUrlToImage(asset.sprite)
  const sprite = state(asset.sprite)
  const spriteData = state(asset.spriteData)
  const name = state(asset.name)
  const description = state(asset.description)
  const code = state(asset.code)
  const isBedrock = state(asset.isBedrock)
  const tool = state(EditorTools.Draw)
  const color = state(RGB_GREEN)
  const xOffset = state(0)
  const yOffset = state(0)
  const hasCopy = state(false)
  const canvas = createCanvas()
  canvas.width = image.width
  canvas.height = image.height
  ctx(canvas).clearRect(0, 0, canvas.width, canvas.height)
  blitImageToCanvas(canvas, image)
  const isPlaying = state(false)
  const clipboard = state(new ImageData(1, 1))
  const palette = state<Palette>([])
  const rgbHexPixels: State<RgbaHex>[] = range(SPRITE_SIZE * SPRITE_SIZE).map(() =>
    state(RGB_TRANSPARENT)
  )

  const _calcHighestFrameCount = () =>
    spriteData.val.animations.reduce((c, row) => {
      return Math.max(c, row.frameCount)
    }, 0)
  const repackCanvas = () => {
    const _sd = spriteData.val

    // Calculate the max frame count
    _sd.highestFrameCount = _calcHighestFrameCount()

    // Shift animation rows up to take up empty rows, then filter empty rows out of the animations lookup
    {
      _sd.animations.forEach((row, srcIdx) => {
        if (row.frameCount > 0) {
          return
        }
        // If we need to shift everything up to remove a row
        debugger
        if (srcIdx + 1 < _sd.animations.length) {
          const sx = 0
          const sy = (srcIdx + 1) * SPRITE_SIZE
          const w = canvas.width
          const h = canvas.height - sy
          const animationRow = ctx(canvas).getImageData(sx, sy, w, h)

          const dx = 0
          const dy = srcIdx * SPRITE_SIZE
          ctx(canvas).putImageData(animationRow, dx, dy)
          console.log(`moving`, { sx, dx, sy, dy, w, h })
        }
        if (yOffset.val > srcIdx) yOffset.val--
      })
      _sd.animations = _sd.animations.filter((row) => row.frameCount > 0)
    }

    // Calculate the ideal canvas width and height of the canvas and resize
    {
      const idealWidth = _sd.highestFrameCount * SPRITE_SIZE
      const idealHeight =
        _sd.animations.reduce((c, row) => {
          return c + (row.frameCount > 0 ? 1 : 0)
        }, 0) * SPRITE_SIZE
      const backupImg = ctx(canvas).getImageData(0, 0, canvas.width, canvas.height)
      canvas.width = idealWidth
      canvas.height = idealHeight
      ctx(canvas).putImageData(backupImg, 0, 0)
      console.log({ idealWidth, idealHeight })
      sprite.val = canvas.toDataURL()
    }

    // SpriteData may be dirty
    spriteData.val = { ..._sd }
  }

  const recalc = async () => {
    const newPalette = createPaletteFromCanvas(canvas).sort()
    if (JSON.stringify(palette.val) !== JSON.stringify(newPalette)) {
      palette.val = newPalette
    }
    getCanvasPixelDataAsCssHexColorArray(
      canvas,
      xOffset.val * SPRITE_SIZE,
      yOffset.val * SPRITE_SIZE,
      SPRITE_SIZE,
      SPRITE_SIZE
    ).forEach((rgb, i) => {
      if (rgbHexPixels[i]!.val === rgb) return
      rgbHexPixels[i]!.val = rgb
    })
  }
  recalc()

  const _copy = (xo = xOffset.val, yo = yOffset.val) =>
    getCanvasSlice(canvas, xo * SPRITE_SIZE, yo * SPRITE_SIZE, SPRITE_SIZE, SPRITE_SIZE)

  const _paste = (clipboard: ImageData, xo = xOffset.val, yo = yOffset.val) => {
    blitImageDataToCanvas(clipboard, canvas, xo * SPRITE_SIZE, yo * SPRITE_SIZE)
    sprite.val = canvas.toDataURL()
  }

  const api = {
    asset(): AssetState {
      return {
        id: asset.id,
        name: name.val,
        description: description.val,
        code: code.val,
        isBedrock: isBedrock.val,
        sprite: sprite.val,
        spriteData: spriteData.val
      }
    },
    setSelectedColor: (c: RgbHex) => {
      color.val = c
      tool.val = EditorTools.Draw
    },
    setPixel(framePixelX: number, framePixelY: number) {
      const frameStartX = xOffset.val * SPRITE_SIZE
      const frameStartY = yOffset.val * SPRITE_SIZE
      const px = frameStartX + framePixelX
      const py = frameStartY + framePixelY
      if (tool.val === EditorTools.Erase) {
        clearPixel(px, py, canvas)
      } else {
        drawPixel(px, py, color.val, canvas)
      }
      const newPalette = createPaletteFromCanvas(canvas)
      if (palette.val.length !== newPalette.length) {
        palette.val = newPalette
      }
      sprite.val = canvas.toDataURL()
      rgbHexPixels[framePixelY * SPRITE_SIZE + framePixelX].val =
        tool.val === EditorTools.Erase ? RGB_TRANSPARENT : rgbToRgba(color.val, 255)
    },
    setTool(_c: EditorTools) {
      tool.val = _c
    },
    addAnimation() {
      spriteData.val.animations.push({ reverseLoop: false, frameCount: 1 })
      spriteData.val = { ...spriteData.val }
      repackCanvas()
      _paste(_copy(xOffset.val, yOffset.val), 0, spriteData.val.animations.length - 1)
      yOffset.val = spriteData.val.animations.length - 1
      xOffset.val = 0
      recalc()
    },
    selectAnimationFrame(xo: number, yo: number) {
      xOffset.val = xo
      yOffset.val = yo
      recalc()
    },
    togglePlay() {
      isPlaying.val = !isPlaying.val
    },
    addFrame(yo: number) {
      const oldLastFrame = _copy()
      spriteData.val.animations[yo].frameCount++
      _calcHighestFrameCount()
      spriteData.val = { ...spriteData.val }
      repackCanvas()
      xOffset.val = spriteData.val.animations[yo].frameCount - 1
      yOffset.val = yo
      _paste(oldLastFrame)
      recalc()
    },
    removeFrame(yo: number) {
      // Blank out this frame
      ctx(canvas).clearRect(
        (spriteData.val.animations[yo].frameCount - 1) * SPRITE_SIZE,
        yo * SPRITE_SIZE,
        SPRITE_SIZE,
        SPRITE_SIZE
      )

      // Decrement the frame count
      spriteData.val.animations[yo].frameCount--

      // Recalc the highest frame count
      _calcHighestFrameCount()

      spriteData.val = { ...spriteData.val }

      // Repack canvas
      repackCanvas()

      // Adjsut xOffset and yOffset if necessary
      yOffset.val = Math.min(yOffset.val, spriteData.val.animations.length - 1)
      xOffset.val = Math.min(xOffset.val, spriteData.val.animations[yOffset.val].frameCount - 1)
      recalc()
    },
    copy() {
      clipboard.val = _copy(xOffset.val, yOffset.val)
      hasCopy.val = true
    },
    paste() {
      _paste(clipboard.val, xOffset.val, yOffset.val)
      recalc()
    },
    toggleReverseLoop(yo: number) {
      spriteData.val.animations[yo].reverseLoop = !asset.spriteData.animations[yo].reverseLoop
      spriteData.val = { ...spriteData.val }
    },
    setCode(s: string) {
      code.val = s
    },
    description,
    setDescription(s: string) {
      description.val = s
    },
    name,
    setName(s: string) {
      name.val = s
    },
    isBedrock: toReadOnlyState(isBedrock),
    setIsBedrock(b: boolean) {
      isBedrock.val = b
    },
    spriteData: toReadOnlyState(spriteData),
    code: toReadOnlyState(code),
    tool: toReadOnlyState(tool),
    color: toReadOnlyState(color),
    rgbHexPixels: rgbHexPixels.map(toReadOnlyState),
    palette: toReadOnlyState(palette),
    sprite: toReadOnlyState(sprite),
    xOffset: toReadOnlyState(xOffset),
    yOffset: toReadOnlyState(yOffset),
    isPlaying: toReadOnlyState(isPlaying),
    hasCopy: toReadOnlyState(hasCopy),
    id: asset.id,
    canvas
  }
  return api
}
