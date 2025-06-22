import van from 'vanjs-core'
import { App } from './App'
import { div } from './common/tags'
import './global.css'

// van.add(document.getElementById('app')!, () => div(`Van13k`))
van.add(document.getElementById('app')!, App())
