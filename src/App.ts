import { div, StatusBar } from '@van13k'
import { Home } from './components/Home'
import { NetManager } from './components/NetManager/NetManager'
import './global.css'

export const App = () => {
  NetManager()
  return div(StatusBar(), Home())
}
