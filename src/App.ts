import { div, StatusBar } from '@van13k'
import { Home } from './components/Home'
import { HUD, RoomId } from './components/HUD'
import { NetManager } from './components/NetManager'
import './global.css'

export const App = () => {
  NetManager()
  return div(StatusBar(), Home(), HUD({ items: [RoomId()] }))
}
