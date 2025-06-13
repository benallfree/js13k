import { gameStore } from '@/store'
import { CLEARFIX, mkClass } from '@/util'
import { a, bind, div, h1 } from '@/van'
import buildInfo from '../../buildInfo.json'
import { Game } from './Game'

export const App = () => {
  const { loaded, modal } = gameStore
  return div(
    { ...mkClass(`App`, CLEARFIX) },
    bind(loaded, (loaded) => {
      if (loaded) {
        return Game()
      }
      return h1(`WorldForge`)
    }),
    div(
      { ...mkClass(`footer`) },
      a({ href: `https://github.com/benallfree/worldforge` }, `WorldForge`),
      ` build ${buildInfo.build}. Created with love under the MIT open source license. `
    ),
    modal()
  )
}
