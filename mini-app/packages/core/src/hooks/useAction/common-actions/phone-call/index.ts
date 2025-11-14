import { useAppStore } from '../../../../stores'
import { makePhoneCall } from '../../../../utils'
import { useNativeToWeapp } from '../../../../utils/native'

export default {
  key: 'call',
  title: '拨打电话',
  type: 'other',
  handler: (config: any) => {
    if (useAppStore().isInNativeWebView) {
      useNativeToWeapp({
        type: 'action',
        env: 'trial',
        payload: {
          key: 'call',
          config: config
        }
      })

      return void 0
    }

    if (config?.phoneNumber) {
      makePhoneCall(config.phoneNumber)
    }
  }
}
