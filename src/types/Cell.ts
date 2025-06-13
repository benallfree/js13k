import { PartialDeep } from 'type-fest'
import { AssetId } from './Asset'
import { PointSlug } from './helpers'

export const toCellId = (s: string) => s as PointSlug

export type CellCollection_AtRest = { [cellId: PointSlug]: CellState_AtRest }
type CellAssetState_AtRest = {
  assetId: AssetId
}

export type CellState_AtRest = {
  assets: CellAssetState_AtRest[]
}
export type CellState_AtRest_Untrusted = PartialDeep<CellState_AtRest>

export type CellAssetState = {
  assetId: AssetId
}

export type CellState = {
  assets: CellAssetState[]
}

export const inMemoryToAtRestCell = (cell: CellState): CellState_AtRest => {
  const { assets } = cell
  return { assets: assets.map((asset) => ({ assetId: asset.assetId })) }
}

export const atRestToInMemoryCell = (untrustedCell: CellState_AtRest_Untrusted) => {
  const trustedCell: CellState_AtRest = {
    assets: [],
    ...untrustedCell
  }
  const { assets } = trustedCell
  const memory: CellState = {
    assets
  }
  return memory
}
