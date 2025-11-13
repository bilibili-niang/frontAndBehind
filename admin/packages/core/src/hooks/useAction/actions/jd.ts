import { defineAction } from '../utils'
import useCommonSelector from '../../useCommonSelector'
import cashier from '../../../views/open/cashier'

const OpenCashierSelect = useCommonSelector({
  widget: cashier
})

export default defineAction({
  key: 'jd_h5',
  title: '打开京东锦礼商城',
  schema: {
    type: 'object',
    properties: {
      app: {
        title: '收银台应用',
        type: 'object',
        required: true,
        widget: OpenCashierSelect
      },
      type: {
        title: '页面类型',
        type: 'number',
        required: true,
        widget: 'radio-button',
        config: {
          options: [
            { label: '商城首页', value: 0 },
            { label: '订单列表', value: 1 }
          ]
        }
      }
    }
  },
  default: {
    type: 0
  }
})
