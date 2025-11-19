import Taro from '@tarojs/taro'
import { WxAddress } from '../types'
import { safeParse, useToast } from '@anteng/core'
import { ref, toRaw } from 'vue'
import { defineStore } from 'pinia'

type chooseAddressOptions = {
  /** 选择后设置为默认地址 */
  asDefault?: boolean
  success?: (address: WxAddress) => void
  fail?: (err) => void
  complete?: (res) => void
}

const useAddress = defineStore('useAddress', () => {
  const storageLastAddress = Taro.getStorageSync('lastAddress')
  const lastAddress = storageLastAddress ? (safeParse(storageLastAddress) as WxAddress) : null
  const address = ref<WxAddress>(lastAddress || emptyAddress())
  const chooseAddress = (options: chooseAddressOptions = { asDefault: true }) => {
    if (process.env.TARO_ENV === 'h5') {
      if (window.wx?.openAddress) {
        window.wx.openAddress({
          success: res => {
            options?.success?.(res)
            // 微信官方单词都拼错了！！ 区县：countryName -> countyName
            address.value = { countyName: res.countryName, ...res }
            if (options?.asDefault) {
              Taro.setStorageSync('lastAddress', toRaw(address.value))
            }
          },
          fail: err => {
            options?.fail?.(err)
          },
          complete: options?.complete
        })
      } else {
        useToast('h5暂未支持地址选择1')
      }
    } else {
      Taro.chooseAddress({
        success: res => {
          options?.success?.(res)
          address.value = res
          if (options?.asDefault) {
            Taro.setStorageSync('lastAddress', res)
          }
        },
        fail: err => {
          options?.fail?.(err)
        },
        complete: options?.complete
      })
    }
  }
  return {
    address,
    chooseAddress
  }
})

export default useAddress

export const emptyAddress = () =>
  ({
    provinceName: null,
    cityName: null,
    countyName: null,
    detailInfo: null,
    userName: null,
    telNumber: null,
    isEmpty: true
  } as WxAddress)
