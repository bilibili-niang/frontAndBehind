import { defineComponent, type PropType, ref, onMounted, onBeforeUnmount, withModifiers } from 'vue'
import { ConfigProvider, Icon, message } from '@pkg/ui'
import { PREFIX_CLS } from '@pkg/config'
import './style.scss'

export interface Config {
  url: string
}

export default defineComponent({
  name: 'ImagePreviewer',
  props: {
    url: {
      type: [String, Array] as PropType<string | string[]>,
      required: true
    }
  },
  emits: ['close'],
  setup(props, { emit }) {
    const list = ref(typeof props.url === 'string' ? [props.url] : props.url)
    const current = ref(0)

    const unsupport = () => {
      message.info('暂未支持，敬请期待。')
    }

    const onEsc = (e: KeyboardEvent) => {
      if (e.code === 'Escape' || e.key === 'Escape' || e.keyCode == 27) {
        emit('close')
      }
    }
    onMounted(() => {
      previewerRef.value.tabIndex = 0
      previewerRef.value.focus()
      document.addEventListener('keydown', onEsc)
    })
    onBeforeUnmount(() => {
      previewerRef.value.tabIndex = -1
      document.removeEventListener('keydown', onEsc)
    })

    const previewerRef = ref()

    return () => {
      return (
        <ConfigProvider prefixCls={PREFIX_CLS}>
          <div
            class="image-previewer"
            ref={previewerRef}
            tab-index="image-preview"
            onClick={() => {
              emit('close')
            }}
          >
            <div class="image-previewer__image">
              <img src={list.value[current.value]} alt="" />
            </div>
            <div class="image-previewer__actions" onClick={withModifiers(() => {}, ['stop'])}>
              <div class="image-previewer__button clickable" onClick={unsupport}>
                <Icon name="zoom-in" />
                <span>放大</span>
              </div>
              <div class="image-previewer__button clickable" onClick={unsupport}>
                <Icon name="zoom-out" />
                <span>缩小</span>
              </div>
              <div class="image-previewer__button clickable" onClick={unsupport}>
                <Icon name="rotate" />
                <span>旋转</span>
              </div>
              <div class="image-previewer__button clickable" onClick={unsupport}>
                <Icon name="one-to-one" />
                <span>原始尺寸</span>
              </div>
              <div class="image-previewer__button clickable" onClick={unsupport}>
                <Icon name="auto-width" />
                <span>自适应</span>
              </div>
              <div class="image-previewer__button --esc clickable" style="opacity: 1;" onClick={() => emit('close')}>
                <Icon name="tag-delete" />
                <span>退出(Esc)</span>
              </div>
            </div>
          </div>
        </ConfigProvider>
      )
    }
  }
})
