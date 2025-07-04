import { div, Route, Router, StatusBar } from '@van13k'
import { Home } from './components/Home/Home'
import { Join } from './components/Join/Join'
import { Layout } from './components/Layout'
import { Play } from './components/Play/Play'
import { SplashPage } from './components/SplashPage'
import './global.css'

export const App = () => {
  const splash = SplashPage()
  return div(
    StatusBar(),
    Layout(
      Router({
        routes: [{ path: '/', component: Home }, Route('/play/:game/:joinCode', Play), Route('/join/:joinCode', Join)],
      })
    ),
    splash.modal()
  )
}
