import { van } from '@/van'
import './app.scss'
import { App } from './components/App'

van.add(document.getElementById('app')!, App())
