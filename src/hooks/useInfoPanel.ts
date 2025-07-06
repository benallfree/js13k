import { service, van, type ChildDom, type State } from '@van13k'

export type InfoItemKey = string

interface InfoPanelService {
  items: State<Record<InfoItemKey, ChildDom>>
  set: (key: string, component: ChildDom) => void
  remove: (key: string) => void
  clear: () => void
}

const createInfoPanelService = (): InfoPanelService => {
  const items = van.state<Record<string, ChildDom>>({})

  const set = (key: string, component: ChildDom) => {
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
