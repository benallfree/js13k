import { Button, classify, div, generateGuid, h1, img, InputModal, Modal, p } from '@van13k'
import qrcode from 'qrcode-generator'
import styles from './Home.module.scss'

export const Home = () => {
  const showHostUI = () => {
    hostModal.open()
  }

  const hostModal = Modal({
    title: 'Host Game',
    content: () => {
      const code = generateGuid(4)
      const qr = qrcode(0, 'M')
      qr.addData(code)
      qr.make()
      const dataUrl = qr.createDataURL(4)
      return div(
        { ...classify(styles.joinCodeContainer) },
        p('Join Code:'),
        h1(code),
        img({ src: dataUrl, class: styles.qrCode })
      )
    },
  })

  const joinModal = InputModal({
    title: 'Join Game',
    prompt: 'Enter Join Code',
    onConfirm: (code: string) => {
      console.log('Joining with code:', code)
      joinModal.close()
    },
    confirmText: 'Join',
    cancelText: 'Cancel',
  })

  const showJoinUI = () => {
    joinModal.open()
  }

  return div(
    { ...classify(styles.hostJoinContainer) },
    Button({ onClick: showHostUI, children: 'Host' }),
    Button({ onClick: showJoinUI, children: 'Join' }),
    joinModal(),
    hostModal()
  )
}
