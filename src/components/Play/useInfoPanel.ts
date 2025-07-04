import { van } from '@/van13k'
import { service } from '@/van13k/util/service'
import type { State } from 'vanjs-core'

type VanComponent = ReturnType<typeof van.tags.div>

interface InfoPanelService {
  items: State<Record<string, VanComponent>>
  set: (key: string, component: VanComponent) => void
  remove: (key: string) => void
  clear: () => void
}

const createInfoPanelService = (): InfoPanelService => {
  const items = van.state<Record<string, VanComponent>>({})

  const set = (key: string, component: VanComponent) => {
    items.val = { ...items.val, [key]: component }
  }

  const remove = (key: string) => {
    const newItems = { ...items.val }
    delete newItems[key]
    items.val = newItems
  }

  const clear = () => {
    items.val = {}
  }

  return {
    items,
    set,
    remove,
    clear,
  }
}

export const useInfoPanel = (): InfoPanelService => {
  try {
    return service<InfoPanelService>('infoPanel')
  } catch {
    // Service not found, create and register it
    const panelService = createInfoPanelService()
    service('infoPanel', panelService)
    return panelService
  }
}
