import { Home } from '@/pages/Home/Home'
import { Join } from '@/pages/Join/Join'
import { Play } from '@/pages/Play/Play'
import { div, Route, Router, StatusBar } from '@van13k'
import { Layout } from './components/Layout'
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
