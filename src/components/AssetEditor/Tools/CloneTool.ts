import { gameStore } from '@/store'
import { newAssetId } from '@/types'
import { ToolButtonProps_In } from '../../Toolbar/ToolButton'

type CloneToolProps = {}
export const CloneTool = (props?: CloneToolProps): ToolButtonProps_In => ({
  title: () => '👯‍♀️',
  onClick: () => {
    const { assetEditor, closeModal, openAssetEditor } = gameStore
    const { asset } = assetEditor()
    const originalAsset = asset()
    const cloned = { ...originalAsset, id: newAssetId(), name: `Clone of ${originalAsset.name}` }
    closeModal()
      .then(() => openAssetEditor(cloned))
      .catch(console.error)
  },
  selected: false
})
