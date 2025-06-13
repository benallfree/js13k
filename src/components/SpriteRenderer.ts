import { SPRITE_SIZE, TILE_SIZE } from '@/constants'
import { AssetState, createNewAssetState } from '@/types'
import { ensureStyle, mkClass } from '@/util'
import { div } from '@/van'

export type SpriteRendererProps = {
  asset: AssetState
  row: number
  frame: number
  isAnimating: boolean
  gc: boolean
  extraClasses: string[]
}

export const DefaultSpriteRendererProps: SpriteRendererProps = {
  asset: createNewAssetState(),
  row: 0,
  frame: 0,
  isAnimating: false,
  gc: false,
  extraClasses: []
}

export const ensureAnimationStyle = (asset: AssetState, row: number, gc: boolean) => {
  const { id, spriteData } = asset
  const { frameCount } = spriteData.animations[row]
  const styleId = `sprite_${id}_${row}`
  ensureStyle(
    styleId,
    `@keyframes ${styleId} {
    from {
      background-position: 0px ${-row * TILE_SIZE}px;
    }
    to {
      background-position: ${-frameCount * TILE_SIZE}px ${-row * TILE_SIZE}px;
    }
  }`,
    gc
  )
  return styleId
}

export const ensureSpriteStyle = (asset: AssetState, gc: boolean) => {
  const {
    id,
    sprite,
    spriteData: { highestFrameCount }
  } = asset

  const styleId = `sprite_${id}`
  ensureStyle(
    styleId,
    `.${styleId} {
      background-size: ${SPRITE_SIZE * highestFrameCount * (TILE_SIZE / SPRITE_SIZE)}px;
      background-image: url(${sprite});
      `,
    gc
  )
  return styleId
}

export const SpriteRenderer = (props?: Partial<SpriteRendererProps>) => {
  const { asset, row, frame, isAnimating, gc, extraClasses } = {
    ...DefaultSpriteRendererProps,
    ...props
  }

  const reverseLoop = asset.spriteData.animations[row].reverseLoop
  const spriteStyleId = ensureSpriteStyle(asset, gc)
  const animationStyleId = ensureAnimationStyle(asset, row, gc)

  const elem = div({ ...mkClass(`SpriteRenderer`, spriteStyleId, ...extraClasses) })
  elem.style.backgroundPositionX = `${-frame * TILE_SIZE}px`
  elem.style.backgroundPositionY = `${-row * TILE_SIZE}px`
  elem.style.animation = isAnimating
    ? `${animationStyleId} 1s steps(${asset.spriteData.animations[row].frameCount}) infinite ${
        reverseLoop ? 'alternate' : ''
      }`
    : `none`
  // background-position: 0 0; // Initial position of the sprite
  // background-image: url('path/to/your/sprite.png'); // Replace with the path to your sprite image
  // animation: ; // Adjust the animation duration and steps based on your sprite
  return elem
}
