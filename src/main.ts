import van from 'vanjs-core'
import { getRouterParams, Router } from './common/router'
import { StatusBar } from './common/StatusBar'
import { statusMessage, statusVisible } from './common/statusManager'
import { div } from './common/tags'
import { initializeXHandle, saveXHandle, skipXHandle, tempXHandle, xHandleModal } from './common/xHandleManager'
import { BeatEditor } from './components/BeatEditor'
import { Home } from './components/Home'
import { XHandleModal } from './components/index'
import { SampleEditor } from './components/SampleEditor'
import { ShareHandler } from './components/ShareHandler'

const App = () => {
  // Initialize X Handle system at app level
  initializeXHandle()

  return div(
    StatusBar(statusMessage, statusVisible),
    XHandleModal(xHandleModal.isOpen, tempXHandle, saveXHandle, skipXHandle),
    Router({
      routes: [
        { path: '/', component: Home },
        {
          path: '/share',
          component: () => {
            return div(() => {
              const params = new URLSearchParams(window.location.search)
              const beatPayload = params.get('beat') || undefined
              const samplePayload = params.get('sample') || undefined
              if (!beatPayload && !samplePayload) {
                return div('Invalid share link')
              }
              return ShareHandler({ beatPayload, samplePayload })
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
        {
          path: '/samples/:sampleId',
          component: () => {
            return div(() => {
              const { sampleId } = getRouterParams()
              if (!sampleId) {
                return div(`Loading...`)
              }
              return SampleEditor({ sampleId })
            })
          },
        },
      ],
    })
  )
}

van.add(document.body, App())
