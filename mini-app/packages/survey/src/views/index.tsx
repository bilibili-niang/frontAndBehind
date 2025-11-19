import { defineComponent, ref } from 'vue'
import EndPage from './end-page'
import ContentPage from './content-page'
import IndexPage from './index-page'
import { BasePage, useShareAppMessage } from '@anteng/core'
import { useSurveyFormStore } from '../stores/form'
import { storeToRefs } from 'pinia'
import { useRouter } from '@tarojs/taro'

definePageConfig({
  navigationBarTitleText: ' ',
  navigationStyle: 'custom'
})

export default defineComponent({
  setup() {
    const id = useRouter().params.id!
    const formStore = useSurveyFormStore(id)
    const { form } = storeToRefs(formStore)

    form.value?.settings.share.enable

    useShareAppMessage(() => {
      return {
        imageUrl: form.value?.settings.share.image,
        title: form.value?.settings.share.title
      }
    })

    const router = useRouter()

    const stepRef = ref<'index' | 'content' | 'end' | 'result'>((router.params.step as any) || 'content')

    const onStart = () => {
      stepRef.value = 'content'
    }
    const onResult = () => {
      stepRef.value = 'content'

      // stepRef.value = 'result'
    }
    const onNext = () => {
      stepRef.value = 'end'
    }

    if (process.env.TARO_ENV === 'h5') {
      // 用于后台预览窗口的数据通信
      window.addEventListener('message', () => {
        // console.log(e)
      })
    }

    return () => {
      return (
        <BasePage
          backgroundColor="#fff"
          navigator={
            process.env.TARO_ENV === 'h5'
              ? null
              : {
                  // navigatorStyle: 'immersive',
                  showMenuButton: false,
                  navigationBarBackgroundColor: 'rgba(255,255,255,0)',
                  navigationBarBackgroundColorFixed: '#fff',
                  title: '',
                  fixedTitle: form.value?.settings.base.name ?? '问卷'
                }
          }
          useScrollView
        >
          {stepRef.value === 'index' && <IndexPage onStart={onStart} />}
          {stepRef.value === 'content' && <ContentPage onNext={onNext} />}
          {stepRef.value === 'result' && <ContentPage asResult />}
          {stepRef.value === 'end' && <EndPage onResult={onResult} />}
        </BasePage>
      )
    }
  }
})
