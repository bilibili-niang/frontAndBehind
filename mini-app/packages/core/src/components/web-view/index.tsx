import { defineComponent, PropType, ref } from 'vue'
import { CommonEventFunction, WebView } from '@tarojs/components'
import urlParse from 'url-parse'
import { getMerchantId } from '../../api/request'
import { useUserStore } from '../../stores'
import Taro from '@tarojs/taro'

export default defineComponent({
  name: '',
  props: {
    src: {
      type: String,
      required: true
    },
    progressbarColor: {
      type: String
    },
    type: {
      type: String
    },
    onMessage: {
      type: Function as PropType<CommonEventFunction<any>>
    },
    onLoad: {
      type: Function as PropType<CommonEventFunction<any>>
    },
    onError: {
      type: Function as PropType<CommonEventFunction<any>>
    },
    withMerchantId: {
      type: Boolean,
      default: true
    },
    withToken: {
      type: Boolean,
      default: true
    }
  },
  setup(props) {
    const src = ref(useWebViewURL(props.src))
    return () => {
      return <WebView {...props} src={src.value} />
    }
  }
})

/**
 * 格式化 H5 链接
 * 1. 添加商户id
 * 2. 添加 token (始终以小程序登录状态为主：小程序未登录情况下，H5将清除登录状态)
 */
export const useWebViewURL = (url: string) => {
  const link = urlParse(url, true)
  link.query.m = link.query.m || getMerchantId()
  if (process.env.TARO_ENV !== 'h5') {
    link.query['ba'] = (useUserStore().token || Taro.getStorageSync('Blade-Auth'))?.replace(/^bearer /, '') || 'null'
  }
  // console.log(link.toString())
  return link.toString()
}
