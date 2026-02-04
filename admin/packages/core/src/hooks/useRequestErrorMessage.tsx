import { message } from '@pkg/ui'
import { uuid } from '../../lib'
import { ResponseData } from '../api/request'

export const useRequestErrorMessage = (err: any, tip = '抱歉，出现了错误') => {
  const msg = err?.response?.data?.message ?? err?.response?.data?.msg ?? err?.message ?? err.msg ?? tip
  if (msg?.length > 40) {
    const id = uuid()
    message.error({
      key: id,
      content: (
        <span>
          {msg.slice(0, 40)}...{' '}
          <a
            onClick={() => {
              message.error({ key: id, content: msg })
            }}
          >
            &emsp;展开内容
          </a>
        </span>
      )
    })
  } else {
    message.error(msg)
  }
  return msg
}

export default useRequestErrorMessage

export const useResponseMessage = (res: ResponseData<any>) => {
  if (res.code === 200) {
    message.success(res.msg)
  } else if (res.msg) {
    message.error(res.msg)
  } else {
    useRequestErrorMessage(res)
  }
}
