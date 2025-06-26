import { absolute, relative, transform } from '@/styles.module.css'
import { Player } from '@/types'
import { classify } from '@/van13k/util'
import { div, State } from '@van13k'
import { carBody, headlight, headlightBottom, headlightTop } from './Car.module.css'

export const Car = ({ player }: { player: State<Player | null> }) => {
  return div(() => {
    if (!player.val) return div(``)
    return div(
      // Car body
      div(
        {
          ...classify(absolute, transform, relative, carBody),
          style: () => {
            // console.log('rendering car', player.val)
            const p = player.val
            if (!p) return 'display: none;'

            const { position, rotation, color } = p
            // Convert rotation.z from radians to degrees for CSS
            const rotationDegrees = (rotation.z * 180) / Math.PI
            const transformStyle = `translate(${position.x}px, ${position.y}px) rotate(${rotationDegrees}deg)`

            return `left: 50%; top: 50%; background-color: ${color}; transform: ${transformStyle};`
          },
        },
        // Headlights on the front (negative Z direction)
        div({
          ...classify(headlight, headlightTop),
        }),
        div({
          ...classify(headlight, headlightBottom),
        })
      )
    )
  })
}
