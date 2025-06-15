import van from 'vanjs-core'
import { StatusBar } from '../common/StatusBar'
import { SplashPage } from './SplashPage'

const { div } = van.tags

const statusMessage = van.state('')
const statusVisible = van.state(false)

export const Home = () =>
  div(
    { class: 'app' },
    SplashPage(),
    div({ class: 'main-content' }, StatusBar(statusMessage, statusVisible), div(`Hello js13k`))
  )
