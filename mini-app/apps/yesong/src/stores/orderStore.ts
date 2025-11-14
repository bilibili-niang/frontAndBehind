import { useConfirm, useLoading, useLoadingEnd, useResponseMessage } from '@anteng/core'
import { defineStore } from 'pinia'
import { cancelPaymentPendingOrder, requestCompleteOrder } from '../api'
import { triggerOrderItemRefresh } from '../utils/emitter'
import Taro from '@tarojs/taro'

declare var wx: any

const useOrderStore = defineStore('order', () => {
  /**
   * 刷新单条订单数据，适用于发生操作后订单状态变更
   * @param id - 主订单ID
   */
  const refreshOrderItem = (id: string) => {
    triggerOrderItemRefresh(id)
  }

  /**
   * 取消订单
   * @param id - 主订单ID
   */
  const cancelOrder = (id: string) => {
    useConfirm({
      title: '操作提示',
      content: '确定要取消订单吗？',
      cancelText: '暂不取消',
      confirmText: '确定取消',
      onConfirm: () => {
        cancelPaymentPendingOrder(id)
          .then(res => {
            if (res.code === 200) {
              useResponseMessage(res)
              // 触发刷新
              triggerOrderItemRefresh(id)
            } else {
              useResponseMessage(res)
            }
          })
          .catch(useResponseMessage)
      }
    })
  }

  /**
   * 确认收货
   * @param id - 主订单ID
   */
  const completeOrder = (id: string, transaction_id: string) => {
    if (process.env.TARO_ENV === 'weapp' && wx.openBusinessView) {
      // 这里没判断是否支持该API，如果不支持将仅进行内部确认
      useLoading()
      wx.openBusinessView({
        businessType: 'weappOrderConfirm',
        extraData: {
          transaction_id: transaction_id
        },
        success() {},
        fail(err) {
          console.log(err)
        },
        complete() {
          useLoadingEnd()
        }
      })

      Taro.onAppShow(options => {
        setTimeout(() => {
          useLoadingEnd()
          if (options.referrerInfo?.appId === 'wx1183b055aeec94d1') {
            _completeOrder(id, 'weapp')
          }
        }, 600)
      })
    } else {
      completeOrderSkipWechat(id)
    }
  }

  const completeOrderSkipWechat = (id: string) => {
    useConfirm({
      title: '确认收货',
      content: '请确认已收到商品并检查无误',
      onConfirm: () => {
        _completeOrder(id, 'h5')
      }
    })
  }

  const _completeOrder = async (id: string, platform: 'weapp' | 'h5') => {
    useLoading()
    try {
      const res = await requestCompleteOrder(id, platform)
      console.log(res)
      if (platform === 'h5') {
        useResponseMessage(res)
      }
    } catch (err) {
      console.log(err)
      if (platform === 'h5') {
        useResponseMessage(err)
      }
    } finally {
      refreshOrderItem(id)
    }
    useLoadingEnd()
  }

  return {
    refreshOrderItem,
    cancelOrder,
    completeOrder,
    completeOrderSkipWechat
  }
})

export default useOrderStore
