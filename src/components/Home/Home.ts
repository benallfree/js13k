import { div, h3 } from '@van13k'
import { GAMES } from '../games'
import { NavBar } from '../NavBar'
import { GameCard } from './GameCard'

export const Home = () => {
  return div(
    NavBar(),
    div(
      { class: 'min-h-screen bg-gray-900 p-8' },
      div(
        { class: 'max-w-6xl mx-auto' },
        h3({ class: 'text-3xl font-bold text-white mb-8 text-center' }, 'Available Games'),
        div({ class: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' }, ...GAMES.map(GameCard))
      )
    )
  )
}
