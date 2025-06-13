import { gameStore } from '@/store'
import { CLEARFIX, mkClass, mkOnClick } from '@/util'
import { bind, div } from '@/van'

type CustomPaletteProps = {}
export const CustomPalette = (props: CustomPaletteProps) => {
  const {} = props

  const { assetEditor } = gameStore
  const { palette, setSelectedColor } = assetEditor()

  return bind(palette, (palette) => {
    return div(
      { ...mkClass(`CustomPalette`, CLEARFIX) },
      ...(palette.map((hex) =>
        div({
          ...mkClass(`color`),
          style: `background-color: ${hex}`,
          ...mkOnClick(() => {
            setSelectedColor(hex)
          })
        })
      ) || [])
    )
  })
}
