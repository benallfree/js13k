export type Game = {
  name: string
  description: string
  slug: string
  image: string
}
export const GAMES: Game[] = [
  {
    name: 'Go Fish',
    description: `Collect pairs of cards.`,
    slug: 'go-fish',
    image: `https://picsum.photos/seed/go-fish/200/200`,
  },
]
