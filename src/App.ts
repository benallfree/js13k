import { StatusBar } from './common'
import { Router } from './common/router'
import { div } from './common/tags'
import { Home } from './components/Home'
import { SplashPage } from './components/SplashPage'
import './global.css'

export const App = () => {
  return div(
    StatusBar(),
    SplashPage(),
    Router({
      routes: [{ path: '/', component: Home }],
    })
  )
}
