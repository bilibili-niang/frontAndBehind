import { ref, render } from 'vue'
import { Button, ConfigProvider, Modal, message } from '@pkg/ui'
import TinyMce from '../components/tiny-mce'
import useDumpImages, { useCheckThirdPartyImageFromRichText } from './useDumpImages'
import { useRequestErrorMessage } from './useRequestErrorMessage'
import { PREFIX_CLS } from '@pkg/config'
import useAppStore from '../stores/app'

let modal: any = null
const modalVisible = ref(true)
const zIndex = ref<number>()
let onConfirm = () => {}
const selectorRef = ref<any>(null)

interface IRichTextEditorConfig {
  content?: string
  onConfirm?: (content: string) => void
  onCancel?: () => void
}
const contentRef = ref('')
const useRichTextEditor = (config?: IRichTextEditorConfig) => {
  const triggerChange = () => {
    config?.onConfirm?.(contentRef.value)
    modalVisible.value = false
  }
  // 这里需要优化一下，可能改用 Promise ？ 或者闭包的方法？
  onConfirm = () => {
    const images = useCheckThirdPartyImageFromRichText(contentRef.value)
    if (images.length > 0) {
      Modal.confirm({
        title: '提示',
        content: '您编辑的图文内似乎包含了第三方图片素材？为了确保图片能够长期正常显示，请进行转存。',
        okText: '进行转存',
        cancelText: '跳过，直接保存',
        onCancel: triggerChange,
        onOk: () => {
          useDumpImages(contentRef.value)
            .then((content: string) => {
              contentRef.value = content
              message.success('转存步骤已完成，可以继续「完成编辑」')
              // console.log(content)
            })
            .catch((err: any) => {
              useRequestErrorMessage(err)
            })
        }
      })
    } else {
      triggerChange()
    }
  }

  contentRef.value = config?.content || ''

  if (!zIndex.value) {
    zIndex.value = useAppStore().getGlobalModalZIndex()
  }

  if (!modal) {
    modal = (
      <ConfigProvider prefixCls={PREFIX_CLS}>
        <Modal
          width="auto"
          zIndex={zIndex.value}
          centered
          footer={null}
          visible={modalVisible.value}
          onCancel={() => (modalVisible.value = false)}
          wrapClassName="rich-text-editor-modal"
          title="富文本编辑器"
          closable={false}
        >
          <div class="rich-text-editor-modal-content">
            <div class="rich-text-editor-modal-btn">
              <Button
                type="link"
                onClick={() => {
                  contentRef.value = ''
                  modalVisible.value = false
                }}
              >
                取消
              </Button>
              <Button type="primary" onClick={onConfirm}>
                完成编辑
              </Button>
            </div>
            <TinyMce value={contentRef.value} onChange={(v) => (contentRef.value = v)} />
          </div>
        </Modal>
      </ConfigProvider>
    )
    const container = document.createElement('div')
    render(<modal />, container)
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

export default useRichTextEditor
;(window as any).useRichTextEditor = useRichTextEditor
