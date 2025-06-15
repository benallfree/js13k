import van from 'vanjs-core'
import { getRouterParams, Router } from './common/router'
import { StatusBar } from './common/StatusBar'
import { statusMessage, statusVisible } from './common/statusManager'
import { div } from './common/tags'
import { BeatEditor } from './components/BeatEditor'
import { Home } from './components/Home'

const App = () => {
  return div(
    StatusBar(statusMessage, statusVisible),
    Router({
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
  )
}

van.add(document.body, App())
