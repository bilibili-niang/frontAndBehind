import { createVNode } from 'vue'
import { Modal } from '@pkg/ui'
import { type AddressData } from '../components/address-selector'
import newAddressSelector from '../components/new-address-selector'
import useAppStore from '../stores/app'

export { type AddressData }

let context: any = null
let modal: any = null

type AddressSelectorConfig = {
  latitude?: number | string
  longitude?: number | string
  onSuccess?: (data: AddressData) => void
}

function useAddressSelector(config?: AddressSelectorConfig) {
  context = createVNode(newAddressSelector, {
    latitude: config?.latitude,
    longitude: config?.longitude,
    onClose: () => {
      modal.destroy()
    },
    onSuccess: (data: AddressData) => {
      config?.onSuccess?.(data)
      modal.destroy()
    }
  })

  modal = Modal.open({
    title: '选择地理位置',
    content: context,
    maskClosable: true,
    centered: true,
    closable: false,
    zIndex: useAppStore().getGlobalModalZIndex()
  })
}

export default useAddressSelector
;(window as any).useAddressSelector = useAddressSelector
