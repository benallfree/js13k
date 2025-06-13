import { Opaque } from 'type-fest'

export type RgbHex = Opaque<string, 'rgb-hex'>
export type RgbaHex = Opaque<string, 'rgba-hex'>

export const base10ToHex = (value: number) => value.toString(16).padStart(2, '0')

export const parseRgbHex = (color: RgbHex | RgbaHex) => {
  const alpha = parseInt(color.slice(7, 9), 16)
  const red = parseInt(color.slice(1, 3), 16)
  const green = parseInt(color.slice(3, 5), 16)
  const blue = parseInt(color.slice(5, 7), 16)
  return { alpha, red, green, blue }
}

export const base10RgbToCssRgb = (red: number, green: number, blue: number) =>
  `rgb(${red}, ${green}, ${blue})`

export const pixelDataToParsedRgba = (imageData: Uint8ClampedArray, offset = 0) => {
  const red = imageData[offset]!
  const green = imageData[offset + 1]!
  const blue = imageData[offset + 2]!
  const alpha = imageData[offset + 3]!
  return { red, green, blue, alpha }
}

export const base10RgbToHex = (red: number, green: number, blue: number) =>
  `#${base10ToHex(red)}${base10ToHex(green)}${base10ToHex(blue)}`

export const base10RgbaToHex = (red: number, green: number, blue: number, alpha: number) =>
  `#${base10ToHex(red)}${base10ToHex(green)}${base10ToHex(blue)}${base10ToHex(alpha)}`

export const rgbaToRgb = (c: RgbaHex | RgbHex): RgbHex => c.slice(0, 7) as RgbHex

export const rgbToRgba = (c: RgbHex, alpha: number): RgbaHex =>
  `${c}${base10ToHex(alpha)}` as RgbaHex
