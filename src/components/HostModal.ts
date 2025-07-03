import { div, generateGuid, h1, img, Modal, navigate, p } from '@/van13k'
import qrcode from 'qrcode-generator'

export const HostModal = () => {
  const hostModal = Modal({
    title: 'Host Game',
    content: () => {
      const code = generateGuid(4)
      const qr = qrcode(0, 'M')
      qr.addData(`https://fabletop.benallfree.com/join/${code}`)
      qr.make()
      const dataUrl = qr.createDataURL(4)
      return div(
        { class: 'flex flex-col items-center gap-4 mt-8' },
        p('Join Code:'),
        h1(code),
        img({ src: dataUrl, class: 'bg-white p-4 rounded-lg' })
      )
    },
    buttons: [
      {
        text: 'Play',
        onClick: () => {
          hostModal.close()
          navigate(`/browse`)
        },
      },
    ],
  })
  return hostModal
}
