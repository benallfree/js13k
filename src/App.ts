import { div, StatusBar } from '@van13k'
import { Home } from './components/Home'
import { NetManager } from './components/NetManager/NetManager'
import { JoystickInputDevice } from './components/PlayingField/JoystickInput'
import { KeyboardInputDevice } from './components/PlayingField/KeyboardInput'
import { SoundManager } from './components/SoundManager/SoundManager'
import './global.css'

export const App = () => {
  NetManager()
  SoundManager()
  JoystickInputDevice()
  KeyboardInputDevice()
  return div(StatusBar(), Home())
}
