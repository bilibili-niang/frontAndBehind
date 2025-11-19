import { EXPRESS_COMPANY_OPTIONS } from '@anteng/config'
import { getExpressInfo, IExpressInfo } from '../../api/express'
import { ref } from 'vue'

const cachedExpressInfo: Record<
  string,
  {
    date: number
    data: IExpressInfo
  }
> = {}
const useExpress = (options: { courierNo: string; phone: string; cacheTime?: number; lazyLoad?: boolean }) => {
  const expressRef = ref<IExpressInfo>()
  const isLoading = ref(false)
  const errMsg = ref()
  const cachedTarget = cachedExpressInfo[options.courierNo]

  if (cachedTarget) {
    expressRef.value = cachedTarget.data
  }

  const getData = (force = false) => {
    const t = EXPRESS_COMPANY_OPTIONS.find(i => i.value === options.courierNo)
    if (t?.noDetails) {
      errMsg.value = t.tips
      return void 0
    }

    // 默认缓存结果 60 秒
    const s = options.cacheTime ?? 60
    const cachedTarget = cachedExpressInfo[options.courierNo]
    if (!force && cachedTarget && +new Date() - cachedTarget.date < s * 1000) {
      expressRef.value = cachedTarget.data
      return void 0
    }
    isLoading.value = true
    errMsg.value = null
    getExpressInfo({
      courierNo: options.courierNo,
      phone: options.phone
    })
      .then(res => {
        if (res.code === 200) {
          if (res.data) {
            // 源数据不是倒序，翻转一下
            res.data.logisticsTraceDetails?.reverse?.()
            cachedExpressInfo[options.courierNo] = {
              date: +new Date(),
              data: res.data
            }
            expressRef.value = res.data
          } else {
            errMsg.value = '物流信息获取失败！请稍后再试'
          }
        } else {
          errMsg.value = res.msg
        }
      })
      .catch(err => {
        console.error(err)
        errMsg.value = '未获取到物流信息，如有疑问请联系客服咨询。'
        // errMsg.value = err.response?.data?.msg ?? err.message
      })
      .finally(() => {
        isLoading.value = false
      })
  }

  if (!options.lazyLoad) {
    getData()
  }
  return {
    expressRef,
    errMsg,
    isLoading,
    refresh: (force = false) => getData(force)
  }
}

export default useExpress
