import { clamp } from 'lodash'
import { ref } from 'vue'
import './style.scss'
import { message } from '@pkg/ui'
import { useResponseMessage } from '../useRequestErrorMessage'
import { sendMessageCode, sendMessageCodeWithoutPhone } from '../../api/login'
import test from '../../utils/test'
import useUserStore from '../../stores/user'

export const useSms = (options?: { resendInterval?: number; sendToCurrentUser?: boolean }) => {
  const resendInterval = clamp(options?.resendInterval ?? 60, 30, 60)

  const lastSmsMobile = ref('')

  const smsCountDownSeconds = ref(0)
  let timer: NodeJS.Timeout
  const countDown = () => {
    timer = setTimeout(() => {
      smsCountDownSeconds.value--
      if (smsCountDownSeconds.value > 0) {
        countDown()
      }
    }, 1000)
  }

  const smsId = ref('')
  const smsLoading = ref(false)

  const sms = (/** 要发送的手机号 */ mobile: string, /** 是否强行尝试发送 */ force: boolean = false) => {
    const _mobile = options?.sendToCurrentUser ? useUserStore().userInfo?.phone! : mobile

    if (!options?.sendToCurrentUser && !test.mobile(_mobile)) {
      message.info('请输入正确11位手机号')
      return Promise.reject()
    }

    if (smsLoading.value) return Promise.reject()

    if (_mobile === lastSmsMobile.value && smsCountDownSeconds.value > 0 && force !== true) {
      // 号码不变，且在冷静期内，直接视为已发送
      return Promise.resolve()
    }

    const endLoading = message.loading('短信验证码发送中...')
    smsLoading.value = true
    return (options?.sendToCurrentUser ? sendMessageCodeWithoutPhone : sendMessageCode)(_mobile)
      .then((res) => {
        if (res.code === 200) {
          // 保存smsId
          smsId.value = res.data?.id
          // 保存上次发送的手机号
          lastSmsMobile.value = _mobile
          // 重置倒计时
          smsCountDownSeconds.value = resendInterval
          countDown()
        }
        useResponseMessage(res)
        return res
      })
      .catch((err) => {
        useResponseMessage(err)
      })
      .finally(() => {
        endLoading()
        smsLoading.value = false
      })
  }

  /** 销毁状态，清除倒计时定时器 */
  const disposeSms = () => {
    clearTimeout(timer)
  }

  const ResendSms = () => {
    if (!lastSmsMobile.value) return null
    return smsCountDownSeconds.value > 0 ? (
      <div class="use-sms__resend disabled">{smsCountDownSeconds.value} 秒后可重新发送</div>
    ) : (
      <div
        class="use-sms__resend"
        onClick={() => {
          sms(lastSmsMobile.value)
        }}
      >
        重新发送
      </div>
    )
  }

  return { sms, smsId, disposeSms, smsCountDownSeconds, ResendSms }
}
