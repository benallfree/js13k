import { gameStore } from '@/store'
import { ToolButton } from '../../Toolbar/ToolButton'

type ShareToolProps = {}
export const ShareTool = (props?: ShareToolProps) =>
  ToolButton({
    title: () => '⬆️',
    onClick: () => {
      const { assetEditor } = gameStore
      const { cloneAsset } = assetEditor
    }
  })
