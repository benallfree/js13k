import { gameStore } from '@/store'
import { RgbHex } from '@/types'
import { bind, input } from '@/van'

type ColorToolProps = {}
export const ColorTool = (props: ColorToolProps) => {
  const { assetEditor } = gameStore
  const { setSelectedColor, color } = assetEditor()

  function onColorChange(this: HTMLInputElement) {
    setSelectedColor(this.value as RgbHex)
  }

  return bind(color, (color) =>
    input({
      type: 'color',
      style: `border-radius: 8px;`,
      value: color,
      onchange: onColorChange
    })
  )
}
