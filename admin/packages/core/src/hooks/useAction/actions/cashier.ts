import { defineAction } from '..'
import cashier from '../../../views/open/cashier'
import useCommonSelector from '../../useCommonSelector'

const OpenCashierSelect = useCommonSelector({
  widget: cashier
})

export const openShop = defineAction({
  key: 'open-shop',
  title: '第三方开放商城',
  schema: {
    type: 'object',
    properties: {
      app: {
        title: '收银台应用',
        type: 'object',
        required: true,
        widget: OpenCashierSelect
      }
    }
  }
})
