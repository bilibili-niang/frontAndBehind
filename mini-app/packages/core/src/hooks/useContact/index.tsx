import { Button } from '@tarojs/components'
import useModal from '../useModal'
import './style.scss'
import { Icon } from '@anteng/ui'
import { makePhoneCall } from '../../utils'
import useToast from '../useToast'
import Taro from '@tarojs/taro'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 6) {
    return '夜已深了'
  } else if (hour < 12) {
    return '早上好'
  } else if (hour < 18) {
    return '下午好'
  } else if (hour < 24) {
    return '晚上好'
  } else {
    return '您好'
  }
}

export const useContact = (options?: {
  contacts?: { name: string; mobile: string }[]
  onlineContact?: boolean
  work?: any
}) => {
  const _options = options || { onlineContact: true }

  const { onlineContact } = _options

  const contacts = _options.contacts || []

  // 不显示在线客服，且只有一个联系人直接拨打电话
  if (!onlineContact) {
    if (!(contacts?.length > 0)) {
      useToast('无可联系客服')
      return void 0
    }
    if (contacts?.length === 1) {
      makePhoneCall(contacts[0].mobile)
      return void 0
    }
  }

  const onCorp = () => {
    const work = options?.work
    Taro.openCustomerServiceChat({
      extInfo: {
        url: work.url
      },
      corpId: work.corpId,
      ...work.messageCard
    })
  }

  const modal = useModal({
    title: '联系客服',
    height: 'auto',
    content: () => {
      return (
        <div class="use-action-contact">
          <div class="title">{getGreeting()} 👋</div>
          <div class="title">有什么可以帮助您的?</div>
          <div class="tip">点击下方按钮立即联系</div>

          {contacts.map(item => {
            return (
              <div
                class="use-action-contact__item"
                onClick={() => {
                  makePhoneCall(item.mobile)
                  modal.close()
                }}
              >
                <Icon name="tell-fill" />
                <div class="use-action-contact__name">{item.name}</div>
                <div class="use-action-contact__mobile">{item.mobile}</div>
                <div class="call">立即拨打</div>
                <Icon name="right" />
              </div>
            )
          })}
          {_options.onlineContact && (
            <div
              class="button"
              onClick={() => {
                modal.close()
              }}
            >
              {options?.work ? (
                <>
                  <Button class="open-type" onClick={onCorp}></Button>
                  联系客服
                </>
              ) : (
                <>
                  <Button class="open-type" openType="contact"></Button>
                  联系在线客服
                </>
              )}

              <Icon name="right" />
            </div>
          )}
        </div>
      )
    }
  })
}
