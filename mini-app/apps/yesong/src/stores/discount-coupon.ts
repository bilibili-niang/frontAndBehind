import { defineStore } from 'pinia'
import { ref } from 'vue'
import { $getMyDiscountCouponCounts } from '../api/discount-coupon'

export const useDiscountCouponStore = defineStore('discount-coupon', () => {
  const discountCouponCounts = ref({
    all: null as unknown as number,
    useable: null as unknown as number,
    expired: null as unknown as number
  })
  const getCounts = () => {
    $getMyDiscountCouponCounts().then(res => {
      discountCouponCounts.value = {
        all: res.data?.couponNumber ?? null,
        useable: res.data?.couponNumberUnused ?? null,
        expired: res.data?.couponNumberUsed ?? null
      }
    })
  }

  return {
    getDiscountCouponCounts: getCounts,
    discountCouponCounts
  }
})
