import { computed, defineComponent, PropType, withModifiers } from 'vue'
import './style.scss'
import useCanvasStore, { DeckComponent } from '../../../stores/canvas'
import { storeToRefs } from 'pinia'
import Image from '../image/render'
import { Empty, message } from '@anteng/ui'
import { withUnit } from '../../utils'

export { default as manifest } from './manifest'

export default defineComponent({
  name: 'd_modal',
  props: {
    comp: {
      type: Object as PropType<DeckComponent<{}>>,
      required: true
    },
    config: {
      type: Object as PropType<any>,
      required: true
    },
    asPreview: Boolean
  },
  setup(props) {
    const canvasStore = useCanvasStore()
    const { layerTree } = storeToRefs(canvasStore)
    const visible = computed(
      () => props.asPreview || layerTree.value.currentSelectedNode?.id == props.comp.id
    )

    const style = computed(() => {
      const { backgroundColor, backgroundBlur, padding, offsetY = 0 } = props.config?.style || {}

      console.log('backgroundBlur', backgroundBlur)
      console.log('backgroundColor:')
      console.log(backgroundColor)

      return {
        '--modal-bg': backgroundColor,
        '--modal-bg-blur': `${backgroundBlur}px`,
        '--modal-pdl': props.asPreview ? `${padding?.left}px` : withUnit(padding?.left),
        '--modal-pdr': props.asPreview ? `${padding?.right}px` : withUnit(padding?.right),
        '--model-offset-y': props.asPreview ? `${offsetY}px` : withUnit(offsetY)
      }
    })

    const image = computed<any>(() => props.config.image)

    const close = () => {
      if (props.asPreview) {
        message.info('你点击了关闭')
      } else {
        canvasStore.selectComponent('')
      }
    }

    return () => {
      if (!visible.value) return null

      return (
        <div
          class="d_image-modal"
          style={style.value}
          onClick={() => {
            console.log('props.config?.style:')
            console.log(props.config?.style)
          }}
        >
          <div
            class="d_image-modal__overlay"
            onClick={withModifiers(() => {
              if (props.config.rule.maskClosable) {
                close()
              }
            }, ['stop'])}
          ></div>
          <div class="d_image-modal__content">
            <div class="d_image-modal__image">
              {image.value?.image?.url ? (
                // @ts-ignore
                <Image config={image.value} active />
              ) : (
                <div class="d_image-modal__image-empty">
                  <Empty description="请配置图片" />
                </div>
              )}
            </div>
            {props.config?.rule?.autoCloseEnable && (
              <div class="d_image-modal__countdown">
                {props.config?.rule?.autoClose?.interval ?? 10}Ｓ后自动关闭
              </div>
            )}
            <div class="d_image-modal__close clickable" onClick={withModifiers(close, ['stop'])}>
              <iconpark-icon name="close-one"></iconpark-icon>
            </div>
          </div>
        </div>
      )
    }
  }
})
