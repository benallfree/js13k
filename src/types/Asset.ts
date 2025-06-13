import { State } from '@/van'
import { nanoid } from 'nanoid'
import { Opaque, PartialDeep } from 'type-fest'
import { Sprite } from './Sprite'

export type StatefulAsset = State<AssetState>
export type AssetId = Opaque<string, 'asset-id'>
export type SpriteAnimationRow = {
  reverseLoop: boolean
  frameCount: number
}
export type SpriteData = { highestFrameCount: number; animations: SpriteAnimationRow[] }

export const toAssetId = (id: string) => id as AssetId
export const newAssetId = () => nanoid() as AssetId

export type AssetState = {
  id: AssetId
  name: string
  description: string
  code: string
  isBedrock: boolean
  sprite: Sprite
  spriteData: SpriteData
}

export const isAssetAtRest = (o: any): o is AssetState_AtRest => {
  return `id` in o && `code` in o && `sprite` in o
}

export type AssetStateCollection = {
  [id: AssetId]: AssetState
}

export type AssetState_AtRest = AssetState

export type Asset_AtRest_Untrusted = PartialDeep<AssetState_AtRest>

export const EMPTY_SPRITE =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7' as Sprite

export const createNewAssetState = () => {
  const asset: AssetState = {
    id: newAssetId(),
    name: 'New Asset',
    description: ``,
    code: ``,
    isBedrock: false,
    sprite: EMPTY_SPRITE,
    spriteData: { highestFrameCount: 1, animations: [{ reverseLoop: false, frameCount: 1 }] }
  }
  return asset
}

export const inMemoryToAtRestAsset = (asset: AssetState): AssetState_AtRest => {
  return { ...asset }
}

export const atRestToInMemoryAsset = (untrustedAsset: AssetState_AtRest) => {
  const trustedAsset: AssetState_AtRest = {
    ...createNewAssetState(),
    ...untrustedAsset
  }
  const memory: AssetState = { ...trustedAsset }
  return memory
}

export const cloneAsset = (toClone: AssetState) => {
  const cloned = {
    ...atRestToInMemoryAsset(inMemoryToAtRestAsset(toClone)),
    id: newAssetId(),
    name: `Copy of ${toClone.name}`
  }
  return cloned
}
