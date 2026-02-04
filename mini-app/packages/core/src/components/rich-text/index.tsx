import { RichText } from '@tarojs/components'
import { computed, defineComponent, onMounted, ref } from 'vue'
// import { template } from './template'
import './style.scss'
import Taro from '@tarojs/taro'
import { uuid } from '@pkg/utils'
import { useAppStore } from '../../stores'

const replacePxWithRem = (htmlString: string) => {
  return htmlString.replace(/([:|\s(]+)([-+]?\d*\.?\d+)(px)/g, (match, prefix, value) => {
    const remValue = (parseFloat(value) / 16).toFixed(2) // 假设 1rem = 16px
    return `${prefix}${remValue}rem`
  })
}
export default defineComponent({
  name: 'c_rich-text',
  props: {
    content: {
      type: String
    },
    zoomDisabled: Boolean
  },
  setup(props) {
    const { systemInfo } = useAppStore()
    const id = `c_rich-text-${uuid()}`
    const ratio = ref(1)
    const indent = ref(0)
    const retryCount = ref(0)
    const initialized = ref(false)

    onMounted(() => {
      const query = Taro.createSelectorQuery()
      const handler = () => {
        Taro.nextTick(() => {
          query.select(`.${id}`).boundingClientRect()
          // query.selectViewport().scrollOffset()
          query.exec(function (res) {
            if (!res[0]) {
              retryCount.value++
              if (retryCount.value > 30) {
                initialized.value = true
                return void 0
              }
              setTimeout(handler, 100)
              return void 0
            }
            initialized.value = true
            ratio.value = res[0].width / systemInfo.windowWidth
            indent.value = res[0].height * (1 - ratio.value)
          })
        })
      }
      setTimeout(handler, 100)
    })
    const style = computed(() => {
      if (props.zoomDisabled) {
        return {
          width: 'unset'
        }
      }
      return `zoom:calc(${ratio.value} * 100%);--ratio:${ratio.value};`
      // return {
      //   transform: `scale(${ratio.value})`,
      //   transformOrigin: 'top left'
      // }
    })

    const formatedContent = computed(() => {
      return props.content?.replace(
        /<img((?:\s+[\w-]+(?:\s*=\s*(?:".*?"|'.*?'|[\w-]+))?)*)\s*(\/?)>/gi,
        '<img$1 class="c_rich-img"$2>'
      )
    })

    return () => {
      return (
        <div class={['c_rich-text-wrapper', id]} style={style.value}>
          <div
            class="c_rich-text-content"
            style={{
              opacity: initialized.value ? 1 : 0
            }}
          >
            <RichText class="c_rich-text" nodes={formatedContent.value}></RichText>
          </div>
          {/* <div style={{ marginBottom: `-${indent.value}px` }}></div> */}
        </div>
      )
    }
  }
})
