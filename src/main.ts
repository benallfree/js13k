import van from 'vanjs-core'
import { Router } from 'vanjs-routing'
import { Home } from './components/Home'

const App = () => {
  return Router({
    routes: [{ path: '/', component: Home }],
  })
}

van.add(document.body, App())
