import './style.scss'
import { defineComponent, onMounted, ref } from 'vue'
import Taro, { useRouter } from '@tarojs/taro'
import { getInformationDetail } from '../../../api/information'
import { BasePage, RichText } from '@anteng/core'

definePageConfig({
  navigationStyle: 'custom',
  disableScroll: true
})

export default defineComponent({
  name: 'InformationDetail',
  setup() {
    const router = useRouter()
    const infoRef = ref<any>(null)
    const hasError = ref(false)
    onMounted(() => {
      if (!router.params.id) {
        return console.error('id缺失')
      }
      Taro.showLoading()
      getInformationDetail(router.params.id)
        .then(res => {
          infoRef.value = res.data
        })
        .catch(err => {
          console.log(err)
          hasError.value = true
        })
        .finally(() => {
          Taro.hideLoading()
        })
    })

    return () => {
      const info = infoRef.value
      return (
        <BasePage style="background:#fff;" navigator={{ title: info?.title || '' }} class="information-detail">
          <scroll-view className="cnt" scroll-y>
            {info && (
              <>
                <div class="information-detail__header">
                  <div class="information-detail__title-star-container">
                    <div class="information-detail__title">{info.title}</div>
                  </div>
                  <div class="information-detail__publish">
                    {info.author ? `${info.author} 丨 ` : ''}
                    {info.createTime}
                  </div>
                </div>
                <div class="information-detail__content">
                  <RichText content={info.content} />
                </div>
              </>
            )}
          </scroll-view>
        </BasePage>
      )
    }
  }
})
