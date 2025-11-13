import { Button, Modal, message } from '@anteng/ui'
import { defineComponent, onMounted } from 'vue'
import Base from '../base'
import './style.scss'
import urlParse from 'url-parse'
import { SCENE_STORE } from '@anteng/config'
import useUserStore from '../../../../../stores/user'
import { useRouter } from 'vue-router'
import uuid from '../../../../../utils/uuid'
import { postWeappAuthCallback } from '../../../../../api/weapp'
import useAppStore from '../../../../../stores/app'

export default defineComponent({
  name: 'WeappBind',
  setup() {
    const userStore = useUserStore()
    const router = useRouter()
    const checkTicket = () => {
      const url = urlParse(window.location.href, true)
      const auth_code = url.query?.auth_code ?? router.currentRoute.value.query?.auth_code
      const expires_in = url.query?.expires_in ?? router.currentRoute.value.query?.expires_in
      if (auth_code) {
        const msgId = uuid()
        message.loading({ key: msgId, content: '正在检测授权结果，请稍候...' })
        postWeappAuthCallback(auth_code as string)
          .then((res: any) => {
            if (res.code === 200) {
              message.success({
                key: msgId,
                content: res.msg || '授权成功'
              })
            } else {
              message.destroy(msgId)
              Modal.error({
                title: '授权结果',
                content: res.msg || '授权失败'
              })
            }
          })
          .catch((err) => {
            message.error({
              key: msgId,
              content: err.response?.data?.msg || err.message || '授权失败，请重试。'
            })
          })
      }
    }
    onMounted(() => {
      checkTicket()
    })

    /** 授权小程序 */
    const authWeapp = async () => {
      // // 定义要跳转的 URL
      // const url = 'https://dev-api.null.cn/null-cornerstone-wechat/open/authUrl'

      // // 获取当前页面的 Header
      // const headers = new Headers()

      // headers.append('Blade-Auth', localStorage.getItem('Blade-Auth') ?? '')
      // headers.append('Authorization', localStorage.getItem('Authorization') ?? '')

      // 根据指定的 URL 和 Header 进行页面跳转
      // const link = new Request(url, {
      //   headers: headers
      // }) as any
      // console.log(link, link.toString())

      location.href = `${
        import.meta.env.VITE_APP_REQUEST_BASE_URL
      }/null-cornerstone-wechat/open/authUrl?merchant_id=${userStore.userInfo?.merchantId}&scene=${useAppStore().scene}`

      // const msgId = useUuid()
      // message.loading({ key: msgId, content: '正在准备中，请稍候...', duration: 0 })
      // const res = await getWeappAuthURL().catch((err) => {
      //   message.error({
      //     key: msgId,
      //     content: err.response?.data?.msg || err.message || '授权失败，请重试。'
      //   })
      // })
      // if (!res) {
      //   return Promise.resolve()
      // }
      // message.success({ key: msgId, content: '请在新窗口中按照提示完成微信小程序授权' })
      // setTimeout(() => {
      //   window.open(res.data)
      //   setTimeout(() => {
      //     Modal.confirm({
      //       title: '提示',
      //       content: '请在新窗口中按照提示完成微信小程序授权。',
      //       cancelText: '遇到问题？点击重试',
      //       okText: '已完成授权',
      //       onCancel: () => {
      //         authWeapp()
      //       },
      //       onOk: () => {
      //         router.replace({
      //           path: 'store-channel'
      //         })
      //         nextTick(() => {
      //           router.replace({
      //             path: router.currentRoute.value.path
      //           })
      //         })
      //       }
      //     })
      //   })
      // }, 1000)
      // return Promise.resolve()
    }

    const steps = [
      {
        title: '授权绑定已有小程序',
        action: (
          <Button type="primary" onClick={authWeapp}>
            授权
          </Button>
        ),
        description: (
          <p>
            请点击「授权」按钮打开授权页面，并使用微信小程序管理员微信扫码完成授权，授权成功后即可实现将「H5应用」发布为小程序版本。
            <a href="https://mp.weixin.qq.com/" target="_blank">
              官方注册小程序
            </a>
          </p>
        )
      }
    ]

    return () => {
      return <Base stpes={steps} currentStep={0}></Base>
    }
  }
})
