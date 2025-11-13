import { Button, Modal, message } from '@anteng/ui'
import { defineComponent, nextTick, onMounted } from 'vue'
import Base from './base'
import urlParse from 'url-parse'
import { useRouter } from 'vue-router'
import uuid from '../../../../utils/uuid'
import { getWechatOfficialAccountAuthURL, postWechatOfficialAccountAuthCallback } from '../../../../api/weapp'
import { useSearchTable } from '../../../../components/search-table'

export default defineComponent({
  name: 'WeappBind',
  setup() {
    const router = useRouter()
    const checkTicket = () => {
      const url = urlParse(window.location.href, true)
      const ticket = url.query?.ticket ?? router.currentRoute.value.query?.ticket
      if (ticket) {
        const msgId = uuid()
        message.loading({ key: msgId, content: '正在检测授权结果，请稍候...' })
        postWechatOfficialAccountAuthCallback({
          accountId: '',
          ticket: ticket as string
        })
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
              content: err.response.data.msg || err.message || '授权失败，请重试。'
            })
          })
      }
    }
    onMounted(() => {
      checkTicket()
    })

    const useSelectOa = (callback: (accountId: string) => void) => {
      const modal = Modal.open({
        width: 800,
        content: (
          <div>
            {useSearchTable({
              key: 'weapp-sign-oa',
              title: '选择已授权公众号',
              requestURL: '/null-cornerstone-wechat/account?type=0',
              filter: {
                list: [{ key: 'name', label: '名称', type: 'input' }]
              },
              table: {
                columns: [
                  { dataIndex: 'ID', title: 'ID', width: 200, fixed: 'left' },
                  { dataIndex: 'name', title: '名称', width: 200 },
                  {
                    title: '操作',
                    width: 100,
                    fixed: 'right',
                    customRender: ({ record }) => {
                      return (
                        <Button
                          onClick={() => {
                            callback(record.id)
                            modal.destroy()
                          }}
                        >
                          选择
                        </Button>
                      )
                    }
                  }
                ]
              }
            })}
          </div>
        )
      })
    }

    /** 授权小程序 */
    const authWeappOa = async (accountId: string) => {
      const msgId = uuid()
      message.loading({ key: msgId, content: '正在准备中，请稍候...', duration: 0 })
      const res = await getWechatOfficialAccountAuthURL(accountId).catch((err) => {
        message.error({
          key: msgId,
          content: err.response?.data?.msg || err.message || '授权失败，请重试。'
        })
      })
      if (!res) {
        return void 0
      }
      message.success({ key: msgId, content: '请在新窗口中按照提示完成微信小程序授权' })
      setTimeout(() => {
        window.open(
          res.data.replace('&redirect_uri=https%3A%2F%2Fdev-api.null.cn', '&redirect_uri=http%3A%2F%2Flocalhost:5173')
        )
        setTimeout(() => {
          Modal.confirm({
            title: '提示',
            content: '请在新窗口中按照提示完成微信小程序授权。',
            cancelText: '遇到问题？点击重试',
            okText: '已完成授权',
            onCancel: () => {
              authWeappOa(accountId)
            },
            onOk: () => {
              router.replace({
                name: 'store-channel'
              })
              nextTick(() => {
                router.replace({
                  path: router.currentRoute.value.path
                })
              })
            }
          })
        })
      }, 1000)
      return Promise.resolve()
    }

    const steps = [
      {
        title: '复用公众号主体创建小程序',
        action: (
          <Button
            type="primary"
            onClick={() => {
              useSelectOa((accountId: string) => {
                authWeappOa(accountId)
              })
            }}
          >
            授权
          </Button>
        ),
        description: (
          <p>
            请点击页面右方的「授权」按钮打开授权页面，公众号管理员扫码确认后即可复用公众号资质快速注册小程序。复用资质创建的小程序默认与公众号关联，并将以公众号的主体作为小程序的开发者。一个公众号只能将授权给一个第三方平台发布小程序，所以若您的公众号已授权其他平台，则可能无法注册。
          </p>
        )
      }
    ]

    return () => {
      return <Base stpes={steps} currentStep={0}></Base>
    }
  }
})
