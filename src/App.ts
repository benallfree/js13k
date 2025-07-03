import { div, Router, StatusBar } from '@van13k'
import { Home } from './components/Home'
import { Layout } from './components/Layout'
import { SplashPage } from './components/SplashPage'
import './global.css'

export const App = () => {
  const splash = SplashPage()
  return div(
    StatusBar(),
    Layout(
      Router({
        routes: [{ path: '/', component: Home }],
      })
    ),
    splash.modal()
  )
}
