import { Modal } from '@/van13k'
import { Share } from './Share'

export const HostModal = ({ joinCode }: { joinCode: string }) => {
  const hostModal = Modal({
    title: 'Host Game',
    content: Share(joinCode),
  })
  return hostModal
}
