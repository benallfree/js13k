import { Home } from './components/Home'
import { SplashPage } from './components/SplashPage'
import './global.css'
import { StatusBar } from './van13k'
import { Router } from './van13k/router'
import { div } from './van13k/tags'

export const App = () => {
  return div(
    StatusBar(),
    SplashPage(),
    Router({
      routes: [{ path: '/', component: Home }],
    })
  )
}
