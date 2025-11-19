import { defineStore } from 'pinia'
import { requestGetGoodsRecommendRule, requestGetGoodsShowRule } from '../api/goods'
import { computed, ref } from 'vue'
import Taro from '@tarojs/taro'
import { COMMON_STATUS_ON } from '../constants'

const useGoodsStore = defineStore('goods', () => {
  /** 商品显示规则 */
  const goodsShowRule = ref({
    dashPrice: 0,
    dashPriceText: '',
    sellingPrice: 0,
    sellingPriceText: ''
  })

  /** 划线价文案 */
  const dashPriceText = computed(
    () => (goodsShowRule.value.dashPrice === COMMON_STATUS_ON && goodsShowRule.value.dashPriceText) || ''
  )

  /** 售价文案 */
  const sellingPriceText = computed(
    () => (goodsShowRule.value.sellingPrice === COMMON_STATUS_ON && goodsShowRule.value.sellingPriceText) || ''
  )

  // 先使用本地缓存版本
  const storagedGoodsShowRule = Taro.getStorageSync('goodsShowRule')
  goodsShowRule.value = { ...goodsShowRule.value, ...storagedGoodsShowRule }

  /** 获取线上版本 */
  const getGoodsShowRule = () => {
    requestGetGoodsShowRule().then(res => {
      if (res.code === 200) {
        const { dashPrice, dashPriceText, sellingPrice, sellingPriceText } = res.data
        goodsShowRule.value = {
          dashPrice,
          dashPriceText,
          sellingPrice,
          sellingPriceText
        }
        Taro.setStorageSync('goodsShowRule', goodsShowRule.value)
      }
    })
  }

  const getGoodsRecommendRule = () => {
    requestGetGoodsRecommendRule()
      .then(res => {
        if (res.code === 200 && res.data) {
          Taro.setStorageSync('recommendRule', {
            commodityDetail: res.data.commodityDetail,
            shoppingPage: res.data.shoppingPage,
            payPage: res.data.payPage
          })
        } else {
        }
      })
      .catch(err => {
        console.log('获取商品推荐规则失败：', err)
      })
  }

  getGoodsShowRule()

  return {
    dashPriceText,
    sellingPriceText,
    getGoodsRecommendRule
  }
})

export default useGoodsStore
