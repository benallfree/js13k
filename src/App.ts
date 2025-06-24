import { StatusBar } from '@/common/StatusBar'
import { div } from '@/common/tags'
import { classify } from '@/common/util/classify'
import { getXHandle, initializeXHandle, saveXHandle, skipXHandle } from '@/components/XHandle/xHandleManager'
import { m20 } from '@/styles.module.css'
import { XHandleModal } from './components/XHandle/XHandleModal'
import './global.css'
import { Routes } from './routes'

export const App = () => {
  // Initialize X Handle system at app level
  initializeXHandle()

  const xHandleModal = XHandleModal({ saveXHandle, skipXHandle })
  if (!getXHandle()) {
    xHandleModal.open()
  }

  return div({ ...classify(m20) }, StatusBar(), xHandleModal(), Routes())
}
