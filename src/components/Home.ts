import { div, h3, img, navigate, p } from '@van13k'

export type Game = {
  name: string
  description: string
  slug: string
  image: string
}

const GAMES: Game[] = [
  {
    name: 'CardDemo',
    description: 'A demo of the card component',
    slug: 'card-demo',
    image: `https://picsum.photos/seed/card-demo/200/200`,
  },
]

export const GameCard = (game: Game) => {
  return div(
    {
      class: `
        bg-gradient-to-br from-gray-800 to-gray-900 
        rounded-xl shadow-lg hover:shadow-xl 
        overflow-hidden transition-all duration-300 
        hover:scale-105 hover:from-gray-700 hover:to-gray-800
        cursor-pointer border border-gray-700 hover:border-gray-600
        max-w-sm
      `,
      onclick: (e) => {
        e.preventDefault()
        navigate(`/play/${game.slug}`)
      },
    },
    div(
      { class: 'relative h-48 overflow-hidden' },
      img({
        src: game.image,
        alt: game.name,
        class: 'w-full h-full object-cover transition-transform duration-300 hover:scale-110',
      }),
      div({
        class: 'absolute inset-0 bg-gradient-to-t from-black/50 to-transparent',
      })
    ),
    div(
      { class: 'p-6' },
      h3({ class: 'text-xl font-bold text-white mb-2 truncate' }, game.name),
      p({ class: 'text-gray-300 text-sm leading-relaxed line-clamp-2' }, game.description)
    )
  )
}

export const Home = () => {
  return div(
    { class: 'min-h-screen bg-gray-900 p-8' },
    div(
      { class: 'max-w-6xl mx-auto' },
      h3({ class: 'text-3xl font-bold text-white mb-8 text-center' }, 'Available Games'),
      div({ class: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' }, ...GAMES.map(GameCard))
    )
  )
}
