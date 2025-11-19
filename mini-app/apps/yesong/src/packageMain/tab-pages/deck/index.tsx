import { computed, defineComponent, ref } from 'vue'
import './style.scss'
import Taro from '@tarojs/taro'
import getCustomPage from '../../../api/deck/getCustomPage'
import { EmptyStatus } from '@anteng/core'
import { COMMON_STATUS_OFF } from '../../../constants'
import { DeckNavigator, DeckRender } from '@anteng/deck'

export default defineComponent({
  name: 'CustomPage',
  props: {
    // 通过id获取页面的自定义配置
    pageId: {
      type: String,
      required: true
    },
    scrollTop: {
      type: Number
    },
    action: {
      type: Object
    }
  },
  emits: ['load'],
  setup(props, { emit }) {

    console.clear()

    const rawData = ref<any>(null)
    const page = ref<any>(null)
    const hasError = ref(false)
    Taro.showLoading()
    const loading = ref(true)

    getCustomPage(props.pageId)
      .then(res => {

        if (res.code === 200) {
          rawData.value = res.data
          page.value = typeof res.data.decorate === 'string' ? JSON.parse(res.data.decorate) : res.data.decorate

          console.log('该页面下的组件:')
          console.log(page.value?.components)

          emit('load', page.value)
        } else {
          console.log('获取页面信息失败：', res.msg)
          hasError.value = true
        }
      })
      .catch(err => {
        console.log('获取页面信息失败：', err)
        // useToast('获取页面信息失败')
        hasError.value = true
      })
      .finally(() => {
        Taro.hideLoading()
        loading.value = false
      })

    const components = computed(() => {
      return page.value?.components || []
    })

    const pageStyle = computed(() => {
      const { backgroundEnable, background } = page.value?.payload?.page?.basic ?? {}
      return {
        backgroundColor: backgroundEnable ? background : undefined
      }
    })

    return () => {
      return (
        <div
          class="custom-page-content"
          style={pageStyle.value}
          onClick={() => {
          }}
        >
          <DeckNavigator
            scrollTop={props.scrollTop}
            title={loading.value ? '加载中...' : ''}
            config={{
              ...page.value?.page?.navigator,
              ...page.value?.page?.basic
            }}
          />
          {hasError.value ? (
            <div class="custom-page-error">
              <div>获取页面信息失败</div>
              <div>{props.pageId}</div>
            </div>
          ) : (
            <div>
              {rawData.value?.status === COMMON_STATUS_OFF ? (
                <EmptyStatus title="页面已下线" description="抱歉，该页面当前不可访问"/>
              ) : (
                <DeckRender components={[...components.value]}/>
              )}
            </div>
          )}
        </div>
      )
    }
  }
})
