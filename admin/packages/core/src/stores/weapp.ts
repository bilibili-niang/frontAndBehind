import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getWechatAccountList } from '../api/weapp'

let DIRECT_WEAPP = false
try {
  DIRECT_WEAPP = import.meta.env.VITE_APP_DIRECT_WEAPP === 'true'
} catch (err) {
  err
}

let WEAPP_ID = ''
try {
  WEAPP_ID = import.meta.env.VITE_APP_WEAPP_ID
} catch (err) {
  err
}

export const useWeappStore = defineStore('weapp', () => {
  const isDirectWeapp = DIRECT_WEAPP
  const weappId = ref(WEAPP_ID)

  const getWeappId = () => {
    return getWechatAccountList().then((res) => {
      weappId.value = res.data.records.find((item: any) => item.type === 1 && item.appId).appId
      return res
    })
  }

  return {
    isDirectWeapp,
    weappId,
    getWeappId
  }
})
