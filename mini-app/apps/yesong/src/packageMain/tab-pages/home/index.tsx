import './style.scss'
import { BasePage } from '@anteng/core'
import { computed, defineComponent, ref } from 'vue'
import Taro from '@tarojs/taro'
import getIndexPage from '../../../api/deck/getIndexPage'
import { DeckNavigator, DeckRender } from '@anteng/deck'

export default defineComponent({
  name: 'IndexHomePage',
  setup() {
    console.log('%c 页面加载：home', 'color:#27ae60')
    const page = ref<any>(null)
    const hasError = ref(false)
    const errMsg = ref('')
    Taro.showLoading()
    getIndexPage('home', process.env.TARO_APP_SCENE)
      .then(res => {
        if (res.code === 200) {
          const d = typeof res.data.decorate === 'string' ? JSON.parse(res.data.decorate) : res.data.decorate
          page.value = d
          console.log('page.value')
          console.log(page.value)

        } else {
          hasError.value = true
          errMsg.value = res.msg
        }
      })
      .catch(err => {
        console.log('获取页面信息失败：', err)
        // useToast('获取页面信息失败')
        hasError.value = true
        errMsg.value = err.response?.data?.msg ?? err.message
      })
      .finally(() => {
        Taro.hideLoading()
      })

    const components = computed(() => {
      return page.value?.components
    })

    const scrollTop = ref(0)
    const onScroll = (e: any) => {
      scrollTop.value = e.detail.scrollTop
    }

    const pageStyle = computed(() => {
      const { backgroundEnable, background } = page.value?.payload?.page?.basic ?? {}
      return {
        backgroundColor: backgroundEnable ? background : undefined
      }
    })

    Taro.useShareAppMessage(() => {
      const { image, title } = page.value?.payload?.page?.basic?.shareConfig ?? {}
      return {
        title: title,
        imageUrl: image?.url
      }
    })

    return () => {
      return (
        <BasePage
          navigator={null}
          useScrollView
          tabsPlaceholder={false}
          scrollView={{ onScroll }}
        >
          <div class="custom-page-content" style={pageStyle.value}>
            <DeckNavigator
              scrollTop={scrollTop.value}
              config={{
                ...page.value?.page?.navigator,
                ...page.value?.page?.basic
              }}/>
            {hasError.value && (
              <div class="custom-page-error">
                <div>获取首页信息失败</div>
                <div>原因：{errMsg.value}</div>
              </div>
            )}
            <div
            >
              components.value
            </div>
            <DeckRender components={components.value}/>
          </div>
        </BasePage>
      )
    }
  }
})
