import van from 'vanjs-core'
import { getRouterParams, Router } from './common/router'
import { StatusBar } from './common/StatusBar'
import { statusMessage, statusVisible } from './common/statusManager'
import { div } from './common/tags'
import { initializeXHandle, saveXHandle, showXHandleModal, skipXHandle, tempXHandle } from './common/xHandleManager'
import { BeatEditor } from './components/BeatEditor'
import { Home } from './components/Home'
import { XHandleModal } from './components/index'
import { ShareHandler } from './components/ShareHandler'

const App = () => {
  // Initialize X Handle system at app level
  initializeXHandle()

  return div(
    StatusBar(statusMessage, statusVisible),
    XHandleModal(showXHandleModal, tempXHandle, saveXHandle, skipXHandle),
    Router({
      routes: [
        { path: '/', component: Home },
        {
          path: '/share/:payload',
          component: () => {
            return div(() => {
              const { payload } = getRouterParams()
              if (!payload) {
                return div('Invalid share link')
              }
              return ShareHandler({ payload })
            })
          },
        },
        {
          path: '/beats/:beatId',
          component: () => {
            return div(() => {
              const { beatId } = getRouterParams()
              if (!beatId) {
                return div(`Loading...`)
              }
              return BeatEditor({ beatId })
            })
          },
        },
      ],
    })
  )
}

van.add(document.body, App())
