import { ref, render } from 'vue'
import { ConfigProvider, Modal } from '@pkg/ui'
import { PREFIX_CLS } from '@pkg/config'
import type { ImageDefine, ResourceModalCfg } from '../components/image-selector/Resource'
import Resource from '../components/image-selector/Resource'
import { useImageCrop } from '../components/image-selector/useImageCrop'
import uuid from '../utils/uuid'
import useAppStore from '../stores/app'

let modal: any = null
const modalVisible = ref(true)
const zIndex = ref<number>()
let onSelect = (image: ImageDefine) => {
}
const selectorRef = ref<any>(null)

const typeRef = ref()
const configRef = ref()

const modalKey = ref(uuid())

const useImageSelector = (config: ResourceModalCfg) => {
  // 这里需要优化一下，可能改用 Promise ？ 或者闭包的方法？

  typeRef.value = config.type || 'image'
  configRef.value = config
  modalKey.value = uuid()

  onSelect = (image) => {
    config.onSuccess?.(image)
  }

  if (!zIndex.value) {
    zIndex.value = useAppStore().getGlobalModalZIndex()
  }

  if (!modal) {
    modal = (
      <ConfigProvider prefixCls={PREFIX_CLS}>
        <Modal
          width="auto"
          zIndex={zIndex.value}
          footer={null}
          centered
          open={modalVisible.value}
          onCancel={() => (modalVisible.value = false)}
        >
          {{
            default: () => {
              return (
                <Resource
                  key={modalKey.value}
                  typeRef={typeRef}
                  config={configRef}
                  ref={selectorRef}
                  onSuccess={onSelect}
                  onClose={() => (modalVisible.value = false)}
                  initialCate={config.initialCate}
                />
              )
            }
          }}
        </Modal>
      </ConfigProvider>
    )
    const container = document.createElement('div')
    container.id = 'image-selector-modal'
    render(<modal id="image-selector-modal-root"/>, container)
  } else {
    zIndex.value = useAppStore().getGlobalModalZIndex()
  }
  modalVisible.value = true

  selectorRef.value?.onShow?.()

  // return new Promise((resolve, reject) => {
  //   onSelect.value = (record: any) => {
  //     resolve(record)
  //     modalVisible.value = false
  //   }
  // })
}

export { type ResourceModalCfg }
export default useImageSelector
;
(window as any).useImageSelector = useImageSelector
;(window as any).useImageCrop = useImageCrop
