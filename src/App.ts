import { div, StatusBar } from '@van13k'
import { Home } from './components/Home'
import { NetManager } from './components/NetManager/NetManager'
import { SoundManager } from './components/SoundManager/SoundManager'
import './global.css'

export const App = () => {
  NetManager()
  SoundManager()
  return div(StatusBar(), Home())
}
