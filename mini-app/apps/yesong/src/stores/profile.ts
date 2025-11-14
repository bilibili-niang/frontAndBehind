import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { getUserBalance } from '../api'

export const useProfileStore = defineStore('StoreProfile', () => {
  const balance = ref<number>(0)
  const balanceAccount = ref()

  const isBalanceAvailable = computed(() => {
    return balanceAccount.value && balance.value > 0
  })

  const balanceYuan = computed(() => {
    return Math.round((balance.value / 100) * 100) / 100
  })

  const balanceText = computed(() => {
    if (balanceYuan.value === undefined) return ''
    return balanceYuan.value.toFixed(2)
  })

  const getAccountBalance = async () => {
    return new Promise((resolve, reject) => {
      getUserBalance()
        .then(res => {
          balanceAccount.value = res.data
          if (res.data.balance >= 0) {
            balance.value = res.data.balance
          }
          resolve(res)
        })
        .catch(err => {
          reject(err)
        })
    })
  }

  return {
    balance,
    balanceYuan,
    balanceText,
    isBalanceAvailable,
    balanceAccount,
    getAccountBalance
  }
})
