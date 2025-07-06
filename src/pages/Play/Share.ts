import { div, h1, img, p } from '@van13k'
import qrcode from 'qrcode-generator'

export const Share = (joinCode: string) => {
  const qr = qrcode(0, 'M')
  qr.addData(`${window.location.origin}/join/${joinCode}`)
  qr.make()
  const dataUrl = qr.createDataURL(4)
  return div(
    { class: 'flex flex-col items-center gap-4 mt-8' },
    p('Join Code:'),
    h1(joinCode),
    img({ src: dataUrl, class: 'bg-white p-4 rounded-lg' })
  )
}
