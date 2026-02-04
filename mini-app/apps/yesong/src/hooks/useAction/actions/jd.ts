import { useLoading, useLoadingEnd, useResponseMessage, withLogin } from '@pkg/core'
import { navigateToWebview } from '../../../router'
import { $getJdURL } from '../../../api/other'

export default {
  key: 'jd_h5',
  title: '打开京东商城',
  handler: withLogin(() => {
    useLoading()
    $getJdURL()
      .then(res => {
        if (res.data) {
          navigateToWebview(res.data)
        } else {
          useResponseMessage(res)
        }
      })
      .catch(useResponseMessage)
      .finally(useLoadingEnd)
  })
}
