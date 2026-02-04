import { Empty, QRCode } from '@pkg/ui'
import useModal from '../useModal'
import './style.scss'
import useUserStore from '../../stores/user'
import { computed, ref } from 'vue'
import Spin from '../../components/spin'
import request from '../../api/request'
import { downloadFile } from '../../utils'
import { copyText } from '@pkg/utils'
import useAppStore from '../../stores/app'
import { useWeappStore } from '../../stores/weapp'
import { storeToRefs } from 'pinia'

/** 获取小程序码 */
const $getWeappQRCode = (options?: { page?: string; scene?: string; env?: 'release' | 'trial' | 'develop' }) => {
  const page = options?.page ?? 'pages/launch'
  const scene = options?.scene ?? ''

  const weappStore = useWeappStore()
  const { weappId } = storeToRefs(weappStore)

  return request({
    url: `/null-wechat-wap/m/${weappStore.isDirectWeapp ? 'direct' : 'open'}/miniapp/${
      weappId.value
    }/qrcode`,
    method: 'get',
    params: {
      // scene: options?.stadiumsId ? `st=${options.stadiumsId}` : `m=${useUserStore().merchantInfo.id}`,
      page: page,
      scene: scene,
      merchantId: useUserStore().merchantInfo.id,
      env: options?.env ?? 'release',
      auto_color: false
    }
  })
}

const $createShortLink = (originString: string) => {
  return request({
    url: '/null-system/short-url',
    method: 'post',
    data: {
      originString,
      expireTime: '2099-12-31 12:00:00'
    }
  })
}

export const useClientPageQRcode = (options: {
  /** 是否为首页，如果是将直接打开小程序首页，不进入到「自定义页面中」 */
  isHomePage?: boolean
  path?: string
  /** 若不是 http(s) 开头，将自动补充完整域名 */
  h5Path?: string
  weappPath?: string
  h5Hidden?: boolean
}) => {
  let h5Path = options.h5Path ?? options.path ?? ''

  h5Path = h5Path.startsWith('http') ? h5Path : `${useAppStore().previewURL}#/${h5Path.replace(/^\//, '')}`

  const weappPath = options.weappPath ?? options.path ?? ''

  const weappQRCode = ref('')
  const weappQRCodeLoading = ref(false)

  const weappStore = useWeappStore()
  const { weappId } = storeToRefs(weappStore)

  if (!weappId.value) {
    weappQRCodeLoading.value = true

    weappStore
      .getWeappId()
      .then(() => {
        getWeappQRCode()
      })
      .catch(() => {
        weappQRCodeLoading.value = false
      })
  }

  const getWeappQRCode = async () => {
    weappQRCodeLoading.value = true

    try {
      const shortCode = (
        await $createShortLink(
          JSON.stringify({
            type: 'navigateTo',
            payload: weappPath
          })
        )
      ).data.shortCode
      const image = (
        await $getWeappQRCode({
          page: '',
          scene: `#${shortCode}`
        })
      ).data
      weappQRCode.value = image ? `data:image/png;base64,${image}` : ''
    } catch (err) {
      console.log('小程序码获取失败', err)
    } finally {
      weappQRCodeLoading.value = false
    }
  }

  if (weappId.value) {
    getWeappQRCode()
  }

  const weappError = computed(() => {
    if (!weappId.value) {
      return '找不到已关联小程序，请确认小程序是否发布'
    }
    return '小程序码生成失败!'
  })

  useModal({
    title: '扫码查看',
    content: () => {
      return (
        <div class="use-client-page-qr-code">
          {!options.isHomePage && (
            <div>
              <h3>
                H5：
                <a
                  onClick={() => {
                    copyText(h5Path, `链接已复制：${h5Path}`)
                  }}
                >
                  复制链接
                </a>
              </h3>
              <div class="code-image">
                <QRCode size={308} style="width:100%;height:100%" bgColor="#ffffff" value={h5Path} />
              </div>
            </div>
          )}
          <div>
            <h3>
              小程序：
              <a
                onClick={() => {
                  copyText(weappPath, `页面路径已复制：${weappPath}`)
                }}
              >
                复制页面路径
              </a>
              、
              <a
                onClick={() => {
                  downloadFile(weappQRCode.value, 'WeappCode.png')
                }}
              >
                下载小程序码
              </a>
            </h3>
            <div class="code-image">
              {weappQRCode.value ? (
                <img style="width:100%;height:100%" src={weappQRCode.value} />
              ) : weappQRCodeLoading.value ? (
                <Spin />
              ) : (
                <Empty description={weappError.value} />
              )}
            </div>
          </div>
        </div>
      )
    }
  })
}
