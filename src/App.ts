import { m20 } from '@/styles.module.css'
import { classify, div, StatusBar } from '@van13k'
import { getXHandle, initializeXHandle, saveXHandle, skipXHandle } from './components/XHandle/xHandleManager'
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
