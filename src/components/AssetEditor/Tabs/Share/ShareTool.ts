import { gameStore } from '@/store'
import { AssetState_AtRest, EMPTY_SPRITE, Sprite, inMemoryToAtRestAsset } from '@/types'
import { mkClass, mkShareUrl } from '@/util'
import { a, bind, div, h1, img, p, state } from '@/van'
import { Copyable } from '../../../Copyable'
import { TabManager } from '../../../TabManager/TabManager'
import { dataUrlToImage, mkTilingProof, scaleDataURL } from '../Canvas/canvas-helpers'

const mkIssueTemplate = (asset: AssetState_AtRest, shareUrl: string) => {
  const { name, description, code } = asset
  return `
# ${name}.

[[THUMBNAIL]]

${description || 'No description provided.'}

[Click to import this asset](${shareUrl}) or copy/paste the Import section below to import manually.

## Tiling Proof

[[TILING]]

## Code

${code ? `\`\`\`js\n${code}\n\`\`\`` : 'This asset contains no code.'}

## Import

\`\`\`json
${JSON.stringify(asset, null, 2)}
\`\`\`

`
}

export type ShareToolProps = {}
export const DefaultShareToolProps: ShareToolProps = {}
export const ShareTool = (props?: Partial<ShareToolProps>) => {
  const {} = { ...DefaultShareToolProps, ...props }

  const isProcessing = state(true)
  const upsizedDataUrl = state(EMPTY_SPRITE)
  const proofDataUrl = state(EMPTY_SPRITE)
  const shareUrl = state('')
  const { assetEditor } = gameStore
  const { sprite, name, asset } = assetEditor()
  ;(async () => {
    const img = await dataUrlToImage(sprite.val)
    proofDataUrl.val = mkTilingProof(img, 10) as Sprite
    upsizedDataUrl.val = scaleDataURL(img, 3) as Sprite
    shareUrl.val = await mkShareUrl(JSON.stringify(inMemoryToAtRestAsset(asset())))
    isProcessing.val = false
  })().catch(console.error)

  return bind(
    proofDataUrl,
    upsizedDataUrl,
    shareUrl,
    name,
    isProcessing,
    (proof, sprite, share, name, isProcessing) => {
      if (isProcessing) return div(`Processing...`)

      return div(
        { ...mkClass(`ShareTool`) },
        TabManager({
          tabs: {
            ['Link']: () =>
              div(
                p(`Share your asset with your friends. Copy and paste `),
                Copyable({ content: `Check out my WorldForge asset: ${name}!\n\n${share}` })
              ),
            ['github']: () =>
              div(
                p(`The best way to share your assets is through the official github repo.`),
                h1(`Step 1 - Open a new github issue`),
                p(
                  a(
                    {
                      href: `https://github.com/benallfree/awesome-worldforge/issues/new`,
                      class: 'button',
                      target: '_blank'
                    },
                    `go to github`
                  )
                ),
                h1(`Step 2: Copy and paste this for the title`),
                Copyable({ content: `[Asset Submission] ${name}` }),
                h1(`Step 3: Copy and paste this into the issue body`),
                Copyable({ content: mkIssueTemplate(inMemoryToAtRestAsset(asset()), share) }),
                h1(
                  `Step 4: Copy and paste this into the issue body where the [[THUMBNAIL]] placeholder is.`
                ),
                img({ src: sprite }),
                h1(
                  `Step 5: Copy and paste this into the issue body where the [[TILING]] placeholder is.`
                ),
                img({ src: proof })
              )
          }
        })
      )
    }
  )
}
