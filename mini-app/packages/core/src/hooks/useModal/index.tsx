import { Modal as AntModal, type ModalProps } from '@anteng/ui'
import useAppStore from '../../stores/app'

type UseModalOptions = { content: any } & ModalProps

const useModal = (options: UseModalOptions) => {
  const { zIndex = useAppStore().getGlobalModalZIndex(), ...restOptions } = options
  const modal = AntModal.open({
    zIndex,
    ...restOptions
  })
  return modal
}

export default useModal
