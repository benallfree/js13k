import {
  bgBlackAlpha80,
  border2,
  borderGray333,
  fontBold,
  mb1,
  minW50,
  p2,
  roundedLg,
  textCenter,
  textGrayLight,
  textGreen,
  textIcon,
  textShadowGreenGlow,
  textSm,
  textWhite,
  textXs,
} from '@/styles.module.css'
import { classify, div } from '@van13k'
import { useNetManager } from '../NetManager/NetManager'

export const ScoreDisplay = () => {
  const { localPlayer } = useNetManager()

  return div(
    {
      ...classify(
        bgBlackAlpha80,
        border2,
        borderGray333,
        roundedLg,
        p2,
        textWhite,
        fontBold,
        textIcon,
        textCenter,
        minW50
      ),
    },
    div({ ...classify(textXs, textGrayLight, mb1) }, 'SCORE'),
    div({ ...classify(textSm, textGreen, textShadowGreenGlow) }, () => localPlayer.val?.points.toString() || '0')
  )
}
