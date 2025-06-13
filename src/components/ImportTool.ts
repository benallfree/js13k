import { gameStore } from '@/store'
import { atRestToInMemoryAsset, isAssetAtRest } from '@/types'
import { DANGER, assert, getDlc, mkClass, mkOnClick, unpack } from '@/util'
import { button, div, h1, h2, p } from '@/van'
import { Sprite } from './Sprite'

export type ImportToolProps = {
  onFinished: () => void
}

export const DefaultImportToolProps: ImportToolProps = { onFinished: () => assert(false) }
export const ImportTool = (props?: Partial<ImportToolProps>) => {
  const { onFinished } = { ...DefaultImportToolProps, ...props }

  const { openModal, saveAsset, assets, assetIds } = gameStore

  const finalize = () => {
    setTimeout(onFinished)
  }
  const sharePayload = getDlc()
  if (!sharePayload) {
    finalize()
  } else {
    ;(async () => {
      try {
        const unpacked = await unpack(sharePayload)
        assert(unpacked, `Import payload could not be unpacked.`)
        const importObj = JSON.parse(unpacked)
        console.log({ importObj })
        assert(isAssetAtRest(importObj), `Import object not recognized.`)
        const asset = await atRestToInMemoryAsset(importObj)
        const willOverwrite = !!assets[asset.id]
        openModal({
          title: () => `Import Asset: ${asset.name}`,
          body: () => {
            return div(
              willOverwrite ? h2(`Import and overwrite?`) : div(),
              Sprite({ asset }),
              div(
                button(
                  {
                    ...mkClass(willOverwrite ? DANGER : ''),
                    ...mkOnClick(() => {
                      saveAsset(asset)
                      finalize()
                    })
                  },
                  `Import`
                )
              )
            )
          }
        })
      } catch (e) {
        openModal({
          title: () => 'Import error',
          body: () => p(`${e}`),
          onClosed: finalize
        })
      }
    })()
  }
  return h1(`Importing...`)
}
