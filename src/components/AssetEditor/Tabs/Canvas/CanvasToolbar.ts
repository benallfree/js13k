import { gameStore } from '@/store'
import { bind, div } from '@/van'
import { Toolbar } from '../../../Toolbar/Toolbar'
import { EditorTools } from '../../Tools/tool'
import { ColorTool } from './ColorTool'

export type CanvasToolbarProps = {}
export const DefaultCanvasToolbarProps: CanvasToolbarProps = {}
export const CanvasToolbar = (props?: Partial<CanvasToolbarProps>) => {
  const {} = { ...DefaultCanvasToolbarProps, ...props }

  const { assetEditor } = gameStore

  const {
    tool,
    addAnimation,
    isPlaying,
    togglePlay,
    copy,
    hasCopy,
    paste,
    setTool,
    addFrame,
    removeFrame,
    yOffset
  } = assetEditor()

  return bind(tool, (_currentTool) =>
    div(
      Toolbar({
        title: 'Paint',
        tools: [
          {
            title: () => `✏️`,
            onClick: () => {
              setTool(EditorTools.Draw)
            },
            selected: _currentTool === EditorTools.Draw
          },
          {
            title: () => `🧹`,
            onClick: () => {
              setTool(EditorTools.Erase)
            },
            selected: _currentTool === EditorTools.Erase
          },
          {
            title: () => ColorTool({}),
            onClick: () => {},
            unstyled: true,
            selected: false
          },
          {
            title: () => div(`copy`),
            onClick: () => {
              copy()
            }
          },
          {
            title: () => div(`paste`),
            extraProps: {
              disabled: { deps: [hasCopy], f: (hasCopy) => !hasCopy }
            },
            onClick: () => {
              paste()
            }
          }
        ]
      }),
      Toolbar({
        title: 'Animate',
        tools: [
          {
            title: () => `💫`,
            onClick: () => {
              addAnimation()
            },
            unstyled: true,
            selected: false
          },
          {
            title: () => div(bind(isPlaying, (isPlaying) => (isPlaying ? `⏹️` : `▶️`))),
            onClick: () => {
              togglePlay()
            }
          },
          {
            title: () => `+🖼️`,
            onClick: () => {
              addFrame(yOffset.val)
            }
          },
          {
            title: () => `-🖼️`,
            onClick: () => {
              removeFrame(yOffset.val)
            }
          }
        ]
      })
    )
  )
}
