import { getRouterParams, Router } from '@/common/router'
import { Route } from '@/common/router/router'
import { div } from '@/common/tags'
import { BeatEditor } from './components/BeatEditor/BeatEditor'
import { Home } from './components/Home/Home'
import { SampleEditor } from './components/SampleEditor'
import { ImportHandler } from './components/ShareHandler'
import { BEAT_EDITOR_FLAG, SAMPLE_EDITOR_FLAG } from './util/constants'

export const Routes = () => {
  const routes: Route[] = [
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
  ]

  if (BEAT_EDITOR_FLAG) {
    routes.push({
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
    })
  }

  if (SAMPLE_EDITOR_FLAG) {
    routes.push({
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
    })
  }

  return Router({
    routes,
  })
}
