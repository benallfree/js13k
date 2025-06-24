import { getRouterParams, Router } from '@/common/router'
import { Route } from '@/common/router/router'
import { div } from '@/common/tags'
import { BeatEditor } from './components/BeatEditor/BeatEditor'
import { Home } from './components/Home/Home'
import { ImportHandler } from './components/ShareHandler'

export const Routes = () => {
  const routes: Route[] = [
    { path: '/', component: Home },
    {
      path: '/import/:chunks*',
      component: () => {
        return div(() => {
          const { chunks } = getRouterParams()
          console.log('chunks', chunks)
          if (!chunks) {
            return div('Invalid import link')
          }
          return ImportHandler({ chunks: chunks.split('/') })
        })
      },
    },
  ]

  routes.push({
    path: '/beats/:beatId',
    component: () => {
      return div(() => {
        const { beatId } = getRouterParams()
        if (!beatId) {
          return `Loading...`
        }
        return BeatEditor({ beatId })
      })
    },
  })

  return Router({
    routes,
  })
}
