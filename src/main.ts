import van from 'vanjs-core'
import { getRouterParams, Router } from 'vanjs-routing'
import { div } from './common/tags'
import { BeatEditor } from './components/BeatEditor'
import { Home } from './components/Home'

const App = () => {
  return Router({
    routes: [
      { path: '/', component: Home },
      {
        path: '/beats/:beatId',
        component: () => {
          return div(() => {
            const { beatId } = getRouterParams()
            console.log(`beatId`, beatId)
            if (!beatId || !beatId) {
              return div(`Loading...`)
            }
            return BeatEditor({ beatId })
          })
        },
      },
    ],
  })
}

van.add(document.body, App())
