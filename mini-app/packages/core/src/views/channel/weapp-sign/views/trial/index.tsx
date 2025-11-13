import { Button, Input, Modal, message } from '@anteng/ui'
import { defineComponent, onMounted, ref } from 'vue'
import './style.scss'
import Base from '../base'
import { checkWechatQRCodeTicketStatus, createTrialWeapp, getWechatQRCodeTicket } from '../../../../../api/weapp'
import useGenerateQrcode from '../../../../../hooks/useGenerateQrcode'
import { useRequestErrorMessage } from '../../../../../hooks/useRequestErrorMessage'
import Spin from '../../../../../components/spin'

const TrailWeapp = defineComponent({
  emits: {
    close: () => true
  },
  setup(props, { emit }) {
    const ticket = ref<string | null>(null)
    const checkTicketOk = ref(false)
    const checkLoading = ref(false)

    const weappName = ref('')
    const createLoading = ref(false)

    const authLink = ref('')
    const authQRCode = ref('')

    const getTicket = () => {
      ticket.value = null
      getWechatQRCodeTicket().then((res) => {
        ticket.value = res.data
      })
    }
    const checkStatus = () => {
      checkLoading.value = true
      checkWechatQRCodeTicketStatus(ticket.value!)
        .then((res) => {
          if (res.data) {
            checkTicketOk.value = true
            message.destroy('checkStatus')
          } else {
            message.error({
              key: 'checkStatus',
              content: (
                <sapn>
                  抱歉，检测到您尚未完成扫码，或{' '}
                  <a class="clickable" onClick={getTicket}>
                    点击刷新
                  </a>{' '}
                  二维码后重试
                </sapn>
              ),
              duration: 0
            })
          }
        })
        .finally(() => {
          checkLoading.value = false
        })
    }

    const create = () => {
      createLoading.value = true
      createTrialWeapp({
        name: weappName.value,
        ticket: ticket.value!
      })
        .then((res: any) => {
          if (res.code === 200) {
            message.success(res.msg)
            authLink.value = res.data
            useGenerateQrcode({ text: authLink.value, margin: 0 }, (src: string) => {
              authQRCode.value = src
            })
          } else {
            message.error(res.msg)
          }
        })
        .catch((err) => {
          useRequestErrorMessage(err)
        })
        .finally(() => {
          createLoading.value = false
        })
    }

    onMounted(() => {
      getTicket()
    })

    return () => {
      if (!checkTicketOk.value) {
        return (
          <div class="weapp-trial-auth-qrcode">
            <div class="qrcode-image">
              {ticket.value ? (
                <img src={`https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=${ticket.value}`} />
              ) : (
                <Spin />
              )}
            </div>
            <strong>请使用「微信」扫码，按照提示进行操作</strong>
            <Button
              size="large"
              shape="round"
              type="primary"
              style="width: 100%"
              onClick={checkStatus}
              disabled={!ticket.value}
              loading={checkLoading.value}
            >
              已完成扫码，继续下一步操作
            </Button>
          </div>
        )
      }
      if (checkTicketOk.value && !authLink.value) {
        return (
          <div class="weapp-trial-auth-qrcode --next">
            <label>小程序名称</label>
            <Input
              value={weappName.value}
              onInput={(e) => {
                weappName.value = e.target.value as string
              }}
            />
            <strong>在小程序转正前，有 2 次修改名称机会</strong>
            <Button
              size="large"
              shape="round"
              type="primary"
              style="width: 100%"
              onClick={create}
              disabled={!ticket.value || weappName.value.length < 2}
              loading={createLoading.value}
            >
              确定，继续下一步
            </Button>
          </div>
        )
      }
      return (
        <div class="weapp-trial-auth-qrcode --last">
          <label>小程序名称</label>
          <Input
            value={weappName.value}
            onInput={(e) => {
              weappName.value = e.target.value as string
            }}
            disabled
          />
          <div class="qrcode-image">{authQRCode.value ? <img src={authQRCode.value} /> : <Spin />}</div>
          <strong>请使用「微信」扫码，按照提示进行操作</strong>
          <Button size="large" shape="round" type="primary" style="width: 100%">
            完成
          </Button>
        </div>
      )
    }
  }
})

export default defineComponent({
  name: 'WeappBind',
  setup() {
    /** 授权小程序 */
    const authWeapp = () => {
      const modal = Modal.open({
        title: '创建试用小程序',
        centered: true,
        maskClosable: false,
        content: (
          <TrailWeapp
            onClose={() => {
              // 防止关闭弹窗错误提示还在
              message.destroy('checkStatus')
              modal.destroy()
            }}
          />
        ),
        onCancel: () => {
          message.destroy('checkStatus')
        }
      })
    }

    const steps = [
      {
        title: '创建试用小程序',
        action: (
          <Button type="primary" onClick={authWeapp}>
            创建
          </Button>
        ),
        description: (
          <p>
            只需填写小程序名称，即可创建一个有效期14天的小程序，总耗时在1分钟之内。试用小程序可查看店铺装修、商品信息，但不支持微信支付。试用小程序有效期为14天，14天后未转正则自动注销。
          </p>
        )
      },
      {
        title: '提交转正资料，完成法人认证将试用小程序转正',
        action: <Button type="primary">转正</Button>,
        description: (
          <p>
            转正资料填写的信息包括：企业名称、法人姓名、法人身份证、法人微信号、统一社会信用代码，以上信息提交后法人微信号将会收到校验推送，需在
            24小时
            内完成校验（查看授权流程示意），校验通过后会收到小程序认证确认推送（查看示意图），完成确认即转正小程序。
          </p>
        )
      }
    ]

    return () => {
      return <Base stpes={steps} currentStep={0}></Base>
    }
  }
})
