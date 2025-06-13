import { gameStore } from '@/store'
import { ToolButtonProps_In } from '../../Toolbar/ToolButton'

export type SaveToolProps = {}
export const SaveTool = (): ToolButtonProps_In => {
  const { saveAsset, assetEditor } = gameStore
  const { asset } = assetEditor()
  return {
    title: () => '💾',
    onClick: () => {
      console.log(`saving`)
      saveAsset(asset())
    },
    selected: false
  }
}
