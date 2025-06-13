import { assert } from '@/util'
import { Opaque } from 'type-fest'
import { RgbHex, RgbaHex } from './RgbHex'
import { XCoordinate, XOffset, YCoordinate, YOffset } from './XY'

export type CountPicker = typeof DEFAULT_FEATURE_COUNT_PICKER
export const DEFAULT_FEATURE_COUNT_PICKER = (r: number, c: number) => {
  const area = r * c
  const quadRoot = Math.pow(area, 0.25)
  const n = Math.max(1, Math.min(Math.ceil(quadRoot), Math.floor(quadRoot) + 1))
  return n
}

export const mkHeight = (height: number) => {
  assert(height >= MIN_HEIGHT && height <= MAX_HEIGHT, `Invalid height ${height}`)
  return height as Height
}
export const mkXOffset = (xOffset: number) => {
  return xOffset as XOffset
}
export const mkYOffset = (yOffset: number) => {
  return yOffset as YOffset
}
export const mkX = (x: number) => {
  assert(x >= 0 && x <= MAX_GRID_SIZE, `Row size ${x} out of range`)
  return x as XCoordinate
}
export const mkY = (y: number) => {
  assert(y >= 0 && y <= MAX_GRID_SIZE, `Row size ${y} out of range`)
  return y as YCoordinate
}
const MAX_GRID_SIZE = 100
export const mkGridSize = (sz: number) => {
  assert(sz >= 0 && sz <= MAX_GRID_SIZE, `Grid size ${sz} out of range`)
  return sz as GridSize
}
export const xyToPointArray = (x: XCoordinate | string, y: YCoordinate | string): PointArray =>
  [mkX(parseInt(x.toString())), mkY(parseInt(y.toString()))] as PointArray

export const xyToPoint = (x: XCoordinate | string, y: YCoordinate | string): Point =>
  ({ x: mkX(parseInt(x.toString())), y: mkY(parseInt(y.toString())) } as Point)

export const MAX_HEIGHT = 999 as Height
export const MIN_HEIGHT = 0 as Height

export enum TerrainType {
  Rock = 'R',
  Spring = 'S',
  Water = 'W',
  Land = 'L'
}
export const xyToSlug = (x: XCoordinate | number, y: YCoordinate | number) =>
  `${x}:${y}` as PointSlug

export const pointArrayToSlug = (p: PointArray): PointSlug => xyToSlug(p[0], p[1])
export const pointToSlug = ({ x, y }: Point): PointSlug => xyToSlug(x, y)

export const slugToPoint = (slug: PointSlug): Point => {
  const [x, y] = slug.split(/:/)
  assert(typeof x !== 'undefined' && typeof y !== 'undefined', `${slug} is not a valid coordinate`)

  return xyToPoint(x, y)
}

export type GridSize = Opaque<number, 'gridsize'>
export type Ordinal = Opaque<number, 'ordinal'>
export type PointSlug = Opaque<string, 'coordinate'>
export type Height = Opaque<number, 'height'>
export type TerrainCell = {
  slug: PointSlug
  pointArr: PointArray
  point: Point
  x: XCoordinate
  y: YCoordinate
  type: TerrainType
  height: Height
  topographicalHeat: () => RgbHex | RgbaHex
}
export type TerrainCell_Create = Partial<Omit<TerrainCell, 'r' | 'c'>>

export type PeakCell = TerrainCell & {
  type: TerrainType.Rock
}
export type SpringCell = TerrainCell & { type: TerrainType.Spring }
export type Terrain = {
  topographicalHeat: (h: Height) => RgbHex | RgbaHex
  minHeight: Height
  maxHeight: Height
  size: GridSize
  cells: {
    [coord: string]: TerrainCell
  }
}

export type PointArray = Opaque<[XCoordinate, YCoordinate], 'point-array'>
export type Point = Opaque<{ x: XCoordinate; y: YCoordinate }, 'point'>
