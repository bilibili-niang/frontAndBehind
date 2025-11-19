import { clamp } from 'lodash-es'
import { ref } from 'vue'
import { useLoading, useLoadingEnd, useResponseMessage, useToast } from '@anteng/core'
import './style.scss'
import { test } from '@anteng/utils'
import { sendMessageCode } from '../../api'

export const useSms = (options?: { resendInterval?: number }) => {
  const resendInterval = clamp(options?.resendInterval ?? 60, 30, 60)

  let lastSmsMobile = ref('')

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

  const sms = (/** 要发送的手机号 */ mobile: string, /** 是否强行尝试发送 */ force: boolean = false) => {
    if (!test.mobile(mobile)) {
      useToast('请输入正确11位手机号')
      return Promise.reject()
    }

    if (mobile === lastSmsMobile.value && smsCountDownSeconds.value > 0 && force !== true) {
      // 号码不变，且在冷静期内，直接视为已发送
      return Promise.resolve()
    }

    useLoading()
    return sendMessageCode(mobile)
      .then(res => {
        if (res.code === 200) {
          // 保存smsId
          smsId.value = res.data?.id
          // 保存上次发送的手机号
          lastSmsMobile.value = mobile
          // 重置倒计时
          smsCountDownSeconds.value = resendInterval
          countDown()
        }
        useResponseMessage(res)
        return res
      })
      .catch(err => {
        useResponseMessage(err)
      })
      .finally(() => {
        useLoadingEnd()
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
