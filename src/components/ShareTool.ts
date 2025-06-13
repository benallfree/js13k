import { gameStore } from '@/store'
import { mkOnClick, mkShareUrl } from '@/util'
import { bind, br, button, div, state } from '@/van'
import { Copyable } from './Copyable'

export const ShareTool = () => {
  const { worldId: worldId, name, serializeWorld } = gameStore

  const shareText = state('')

  mkShareUrl(serializeWorld())
    .then((url) => {
      const _n = name.val
      const _id = worldId.val
      shareText.val = `Hey, check out my WorldForge map!\n\nMap name: ${_n}\nWorld ID: ${_id}\n\n${url}\n\nNote: If the link doesn't work, just copy this whole message into the WorldForge share tool and click Import.`
    })
    .catch(console.error)

  const { openModal } = gameStore
  const open = () => {
    return openModal({
      title: () => `Share a World`,
      body: () =>
        div(
          { class: `ShareTool` },
          bind(shareText, (_shareText) =>
            Copyable({
              content: _shareText,
              success: `DLC copied to clipboard! Share on messaging apps!`,
              instructions: `Copy your DLC below and share it over text, Discord, WhatsApp, Twitter, or anywhere else you want!`
            })
          )
        )
    })
  }

  return button({ class: `ShareToolButton`, ...mkOnClick(open) }, div(`⤴️`, br(), `share`))
}
