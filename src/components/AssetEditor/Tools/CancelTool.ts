import { gameStore } from '@/store'
import { ToolButtonProps_In } from '../../Toolbar/ToolButton'

type CancelToolProps = {}
export const CancelTool = (props?: CancelToolProps): ToolButtonProps_In => {
  const { closeModal } = gameStore
  return { title: () => '😾', onClick: closeModal, selected: false }
}
