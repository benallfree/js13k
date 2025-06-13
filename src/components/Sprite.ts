import { AssetState } from '@/types'
import { PointerEventHandler, TILE, mkClass, mkOnClick } from '@/util'
import { bind, img } from '@/van'

type Sprite = { asset: AssetState; onclick?: PointerEventHandler }
export const Sprite = (props: Sprite) => {
  const { asset, onclick }: Sprite = { onclick: () => {}, ...props }
  return bind(asset, (asset) => {
    const { id, sprite } = asset
    return img({ ...mkClass(`Sprite`, TILE), src: sprite, ...mkOnClick(onclick) })
  })
}
