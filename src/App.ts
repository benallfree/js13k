import { classify } from './common/classify'
import { StatusBar } from './common/StatusBar'
import { div } from './common/tags'
import { initializeXHandle, saveXHandle, skipXHandle, tempXHandle, xHandleModal } from './common/xHandleManager'
import { m20 } from './components/common.module.css'
import { XHandleModal } from './components/XHandleModal'
import './global.css'
import { Routes } from './routes'

export const App = () => {
  // Initialize X Handle system at app level
  initializeXHandle()

  return div(
    { ...classify(m20) },
    StatusBar(),
    XHandleModal(xHandleModal.isOpen, tempXHandle, saveXHandle, skipXHandle),
    Routes()
  )
}
