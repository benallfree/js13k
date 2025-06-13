import { DEFAULT_GRID_SIZE } from '@/constants'
import {
  AssetId,
  AssetState,
  AssetStateCollection,
  AssetState_AtRest,
  CellAssetState,
  CellCollection_AtRest,
  CellState,
  CellState_AtRest,
  GridSize,
  PointSlug,
  atRestToInMemoryAsset,
  atRestToInMemoryCell,
  createNewAssetState,
  inMemoryToAtRestAsset,
  toAssetId,
  toCellId,
  xyToSlug
} from '@/types'
import { assert, keys, objectEntries, range, uniq } from '@/util'
import { State, bind, state } from '@/van'
import { nanoid } from 'nanoid'
import { Opaque } from 'type-fest'
import { AssetEditor } from '../components/AssetEditor/AssetEditor'
import { AssetEditorApi, createAssetEditorStore } from '../components/AssetEditor/store'
import { Modal } from '../components/Modal'
import { loadCurrentWorldId, loadWorld, saveCurrentWorldId, saveWorld } from './localStorage'

export type WorldId = Opaque<string, 'world-id'>
export const newWorldId = () => nanoid() as WorldId

export type WorldState = {
  size: GridSize
  id: WorldId
  name: WorldName
  cells: StatefulCellCollection
  assets: AssetStateCollection
}

export type AssetCollection_AtRest = { [assetId: AssetId]: AssetState_AtRest }

const mkPointSlug = (s: string) => s as PointSlug

export type WorldState_AtRest = {
  id: WorldId
  name: WorldName
  assets: AssetCollection_AtRest
  cells: CellCollection_AtRest
}

type StatefulCellCollection = { [id: PointSlug]: State<CellState> }

type StatefulAssetCollection = { [id: AssetId]: State<AssetState> }

export type WorldName = Opaque<string, 'world-name'>

const loadCurrentWorld = () => {
  const currentWorldId = loadCurrentWorldId()
  if (!currentWorldId) return
  const savedState = loadWorld(currentWorldId)
  return savedState
}

export const mkWorldName = (s: string) => s as WorldName
export const DEFAULT_WORLD_STATE: WorldState = {
  id: newWorldId(),
  size: DEFAULT_GRID_SIZE,
  name: mkWorldName('New World'),
  assets: {},
  cells: {}
}

const atRestCell = (cellIn: CellState): CellState_AtRest => {
  return {
    assets: cellIn.assets.map((assetIn) => assetIn)
  }
}

export type GameStateApi = ReturnType<typeof createGameStore>
export const createGameStore = () => {
  const loaded = state(false)
  const imported = state(false)
  const worldId = state(newWorldId())
  const size = DEFAULT_GRID_SIZE
  const name = state(mkWorldName('New World'))
  const assets: StatefulAssetCollection = {}
  const assetIds = state<AssetId[]>([])
  const cells: StatefulCellCollection = {}
  let assetEditor: AssetEditorApi | undefined = undefined

  range(size).forEach((x) => {
    range(size).forEach((y) => {
      const slug = xyToSlug(x, y)
      cells[slug] = state<CellState>({
        assets: []
      })
    })
  })

  const save = () => {
    // backupWorld(worldId.val)
    saveWorld(worldAtRest())
    saveCurrentWorldId(worldId.val)
  }

  const world = loadCurrentWorld()
  if (world) {
    worldId.val = world.id
    name.val = world.name

    // Load assets
    objectEntries(world.assets).forEach(([id, asset]) => {
      try {
        const inMemoryAsset = atRestToInMemoryAsset(asset)
        const statefulAsset = state(inMemoryAsset)
        assets[toAssetId(id)] = statefulAsset
      } catch (data) {
        console.error(data)
      }
    })
    assetIds.val = keys(assets) as AssetId[]

    // Load cells
    objectEntries(world.cells).forEach(([slug, atRestCell]) => {
      try {
        const inMemoryCell = atRestToInMemoryCell(atRestCell)
        const statefulCell = state(inMemoryCell)
        cells[toCellId(slug)] = statefulCell
      } catch (data) {
        console.error(data)
      }
    })
    console.log(`world loaded`, { assetIds, assets, cells })
  }
  loaded.val = true

  const worldAtRest = (): WorldState_AtRest => {
    return {
      id: worldId.val,
      name: name.val,
      assets: Object.values(assets).reduce((c, v, k) => {
        const atRest = inMemoryToAtRestAsset(v.val)
        c[atRest.id] = atRest
        return c
      }, {} as AssetCollection_AtRest),
      cells: Object.entries(cells).reduce((c, [slug, v]) => {
        const atRest = atRestCell(v.val)
        c[mkPointSlug(slug)] = atRest
        return c
      }, {} as CellCollection_AtRest)
    }
  }
  const serializeWorld = () => JSON.stringify(worldAtRest())

  const [modal, openModal, closeModal, isModalOpen] = Modal()

  const activeAssetId = state<AssetId | undefined>(undefined)
  const setActiveAssetId = (s: AssetId | undefined) => (activeAssetId.val = s)

  const addAssetToTerrainCell = (x: number, y: number, activeAssetId: AssetId) => {
    const slug = xyToSlug(x, y)
    if (!cells[slug]) cells[slug] = state<CellState>({ assets: [] })
    const cellData = cells[slug]!.val
    const copy = [...cellData.assets, { assetId: activeAssetId }].reverse()
    const newAssets: CellAssetState[] = [
      copy.find((asset) => assets[asset.assetId].val.isBedrock),
      copy.find((asset) => !assets[asset.assetId].val.isBedrock)
    ].filter((v): v is CellAssetState => !!v)
    console.log({ newAssets })
    cells[slug]!.val = {
      ...cellData,
      assets: newAssets
    }
    save()
  }

  const api = {
    createAsset: async () => {
      const newAsset = createNewAssetState()
      return newAsset
    },
    deleteAsset: async (assetId: AssetId) => {
      delete assets[assetId]
      Object.entries(cells).map(([pos, cell]) => {
        cell.val = { ...cell, assets: cell.val.assets.filter((asset) => asset.assetId !== assetId) }
      })
      assetIds.val = keys(assets) as AssetId[]
      save()
    },
    openAssetEditor: async (asset: AssetState) => {
      const clonedAsset = atRestToInMemoryAsset(inMemoryToAtRestAsset(asset)) // Clone
      assetEditor = await createAssetEditorStore(clonedAsset)
      const { name } = assetEditor
      const save = () => {
        assert(assetEditor)
        api.saveAsset(assetEditor.asset())
      }
      openModal({
        title: () => bind(name, (name) => `Asset Editor: ${name}`),
        body: () => AssetEditor({}),
        onCloseClicked: save,
        onClickAway: save,
        onClosed: () => {
          assetEditor = undefined
        }
      })
    },
    saveAsset: (asset: AssetState) => {
      if (!assets[asset.id]) assets[asset.id] = state(asset)
      assets[asset.id]!.val = asset
      assetIds.val = uniq([...assetIds.val, asset.id])
      save()
    },
    assetEditor() {
      assert(assetEditor)
      return assetEditor
    },
    worldId,
    loaded,
    size,
    name,
    assets,
    assetIds,
    serializeWorld,
    worldAtRest,
    openModal,
    closeModal,
    modal,
    isModalOpen,
    activeAssetId,
    setActiveAssetId,
    addAssetToTerrainCell,
    cells,
    imported
  }
  return api
}

export const gameStore = createGameStore()
