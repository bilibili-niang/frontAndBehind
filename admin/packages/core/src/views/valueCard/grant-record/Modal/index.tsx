// 该储值卡的收支明细
import { useModal, useSearchTable } from '@pkg/core'
import { budgetType } from '@/constants/valueCard'
import { moneyToYuan } from '@pkg/utils'

export const budgetRecord = (cardNo?: string) => {
  const { Table, refresh } = useSearchTable({
    title: '储值卡收支明细',
    requestURL: `/ice-venue-admin/cardRecord/${cardNo}`,
    filter: {
      list: [
        {
          key: 'type',
          label: '收支类型',
          type: 'select',
          fixed: true,
          config: {
            options: budgetType
          },
          flex: 4
        },
        {
          key: 'createTime',
          label: '创建时间',
          type: 'range-picker',
          fixed: true
        }
      ]
    },
    table: {
      columns: [
        {
          dataIndex: 'recordNo',
          title: '收支流水',
          width: 180
        },
        {
          dataIndex: 'type',
          title: '收支类型',
          width: 180,
          customRender: ({ text }) => {
            switch (text) {
              case 0:
                return '支出-消费'
              case 1:
                return '收入-充值'
              case 2:
                return '收入-退款'
              case 3:
                return '支出-冲减'
              default:
                return '未知'
            }
          }
        },
        {
          dataIndex: 'amount',
          title: '收支金额（元）',
          width: 180,
          customRender: ({ record }) => {
            let formattedAmount: string = moneyToYuan(record.amount).toString()

            // 根据 type 的值来添加符号
            if (record.type === 0 || record.type === 3) {
              formattedAmount = '-' + formattedAmount // 添加负号
            } else if (record.type === 1 || record.type === 2) {
              formattedAmount = '+' + formattedAmount // 添加正号
            }

            return formattedAmount
          }
        }
      ]
    }
  })
  useModal({
    width: 1000,
    content: Table
  })
}
