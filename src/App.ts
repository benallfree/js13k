import { getRouterParams, Router } from './common/router'
import { StatusBar } from './common/StatusBar'
import { div } from './common/tags'
import { initializeXHandle, saveXHandle, skipXHandle, tempXHandle, xHandleModal } from './common/xHandleManager'
import { BeatEditor } from './components/BeatEditor'
import './components/common.module.css'
import { Home } from './components/Home'
import { XHandleModal } from './components/index'
import { SampleEditor } from './components/SampleEditor'
import { ImportHandler } from './components/ShareHandler'
import './global.css'

export const App = () => {
  // Initialize X Handle system at app level
  initializeXHandle()

  return div(
    StatusBar(),
    XHandleModal(xHandleModal.isOpen, tempXHandle, saveXHandle, skipXHandle),
    Router({
      routes: [
        { path: '/', component: Home },
        {
          path: '/import/:chunks*',
          component: () => {
            return div(() => {
              console.log('ImportHandler', getRouterParams())
              const { chunks } = getRouterParams()
              if (!chunks) {
                return div('Invalid import link')
              }
              return ImportHandler({ chunks: chunks.split('/') })
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
