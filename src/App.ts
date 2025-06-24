import { div, StatusBar, XHandleModal } from '@van13k'
import './global.css'

export const App = () => {
  // Initialize X Handle system at app level
  initializeXHandle()

  const xHandleModal = XHandleModal({ saveXHandle, skipXHandle })
  if (!getXHandle()) {
    xHandleModal.open()
  }

  return div({ ...classify(m20) }, StatusBar(), xHandleModal(), Routes())
}
