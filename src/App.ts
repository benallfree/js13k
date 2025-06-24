import { div, Router, StatusBar } from '@van13k'
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
