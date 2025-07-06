import { useInfoPanel } from '@/hooks/useInfoPanel'
import { div } from '@van13k'

export const InfoOverlay = () => {
  const panel = useInfoPanel()

  return div(
    {
      class: 'absolute top-16 left-4 bg-black/50 text-white p-4 rounded-lg z-50',
    },
    // Render all panel items
    () => {
      const items = panel.items.val
      return div(...Object.values(items))
    }
  )
}
