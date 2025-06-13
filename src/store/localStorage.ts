import { clone, objectEntries } from '@/util'
import { Opaque } from 'type-fest'
import { WorldId, WorldState_AtRest } from './gameStore'

type RootKey = Opaque<string, 'root-key'>
const ROOT_KEY = '__worldforge__' as RootKey

enum StorageKeys {
  Worlds = 'worlds',
  Splash = 'splash',
  CurrentWorldId = 'currentWorldId'
}

type Root = Opaque<
  {
    [StorageKeys.Splash]: boolean
    [StorageKeys.Worlds]: WorldCollection
    [StorageKeys.CurrentWorldId]?: WorldId
  },
  'storage-root'
>

type WorldCollection = Opaque<
  {
    [worldId: WorldId]: WorldState_AtRest
  },
  'worlds'
>

if (import.meta.env.DEV) {
  objectEntries(localStorage)
    .map(([k, v]) => k)
    .filter((k) => k.match(/backup/))
    .forEach((k) => localStorage.removeItem(k))
}

export const safeParse = (json: string | null): string | number | object | null => {
  if (!json) return null
  try {
    const parsed = JSON.parse(json)
    return parsed as object
  } catch {}
  return null
}

export const backupWorld = (worldId: WorldId) => {
  const old = loadWorld(worldId)
  if (old) {
    localStorage.setItem(`${ROOT_KEY}_${worldId}_backup_${+new Date()}`, JSON.stringify(old))
  }
}

const _getRoot = (): Root => {
  const root = safeParse(localStorage.getItem(ROOT_KEY))
  return {
    [StorageKeys.Splash]: false,
    [StorageKeys.Worlds]: {} as WorldCollection,
    ...(typeof root === 'object' ? root : {})
  } as Root
}
const _setRoot = (data: object | boolean | string | number) => {
  console.log(`Writing to storage`, clone(data))
  return localStorage.setItem(ROOT_KEY, JSON.stringify(data))
}

const getKeyOrDefault = <K extends StorageKeys>(name: K, def: Root[K]): Root[K] => {
  const root = _getRoot()
  if (typeof root[name] === 'undefined') return def
  return root[name]
}

const setKey = <K extends StorageKeys>(name: K, data: Root[K]): void => {
  const current = _getRoot()
  current[name] = data
  _setRoot(current)
}

export const loadCurrentWorldId = () => getKeyOrDefault(StorageKeys.CurrentWorldId, undefined)
export const saveCurrentWorldId = (data: Root[StorageKeys.CurrentWorldId]) =>
  setKey(StorageKeys.CurrentWorldId, data)

export const loadWorld = (id: WorldId) =>
  getKeyOrDefault(StorageKeys.Worlds, {} as WorldCollection)[id]
export const saveWorld = (data: WorldState_AtRest) => {
  const worlds = getKeyOrDefault(StorageKeys.Worlds, {} as WorldCollection)
  worlds[data.id] = data
  setKey(StorageKeys.Worlds, worlds)
}
