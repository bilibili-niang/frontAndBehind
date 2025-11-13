import { Button, Input } from '@anteng/ui'
import { useSms } from '../useSms'
import useUserStore from '../../stores/user'
import { storeToRefs } from 'pinia'
import type { Schema } from '@anteng/jsf'
export const useSmsSchema = (options?: { smsIdKey?: string; valueKey?: string; sendToCurrentUser?: boolean }) => {
  const userStore = useUserStore()
  const { userInfo } = storeToRefs(userStore)

  const { sms, smsId, smsCountDownSeconds } = useSms({ sendToCurrentUser: options?.sendToCurrentUser })

  const onSms = () => {
    sms(userInfo.value?.phone!)
  }

  const valueKey = options?.valueKey || 'smsValue'

  const schema: Record<string, Schema> = {
    _sms_phone: {
      title: '验证手机号',
      type: 'null',
      widget: () => {
        return (
          <Input value={undefined} placeholder={`该操作需验证，将发送验证码到：${userInfo.value?.phone}`} disabled />
        )
      }
    },
    [valueKey]: {
      title: '验证码',
      type: 'string',
      required: true,
      widget: (props) => {
        return (
          <div style="display:flex;align-items:center;gap: 8px">
            <Input
              maxlength={6}
              placeholder="请输入验证码"
              value={props.value}
              onChange={(e) => {
                props.onChange(e.target.value)
              }}
            />
            <Button type="primary" onClick={onSms} disabled={smsCountDownSeconds.value > 0}>
              {smsCountDownSeconds.value ? `${smsCountDownSeconds.value} 后可重新获取` : '获取验证码'}
            </Button>
          </div>
        )
      }
    }
  }

  return { schema, smsId }
}
