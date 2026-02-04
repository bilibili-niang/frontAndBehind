import { defineComponent } from 'vue'
import { useAppStore, useModal, useRequestErrorMessage, useSearchTable, useTableAction } from '@pkg/core'
import { moneyToYuan } from '@pkg/utils'
import { $getValueCardGrantRecords, $getValueCardUseRecords } from '../../../api/valueCard'
import { ValueCardBalanceChangeTypeOptions } from '../../../constants/valueCard'

const ValueCardUseRecord = defineComponent({
  title: '收支明细',
  props: {
    cardNo: {
      type: String
    }
  },
  setup(props) {
    const { Table } = useSearchTable({
      title: '储值卡收支明细',
      customRequest(params) {
        return $getValueCardUseRecords({ ...params, cardNo: props.cardNo })
      },
      exportURL: '/null-cornerstone-goods/cardPaymentRecord/export?scene=' + useAppStore().scene,
      filter: {
        list: [
          {
            key: 'recordNo',
            label: '收支流水',
            type: 'input',
            fixed: true,
            flex: 4
          },
          {
            key: 'userPhone',
            label: '用户手机号',
            type: 'input',
            fixed: true,
            flex: 4
          },
          {
            key: 'name',
            label: '储值卡名称',
            type: 'input',
            fixed: true,
            flex: 4
          },
          {
            key: 'type',
            label: '收支类型',
            type: 'select',
            fixed: true,
            config: {
              options: ValueCardBalanceChangeTypeOptions
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
          // {
          //   dataIndex: 'id',
          //   title: 'ID',
          //   width: 180
          // },
          {
            title: '收支流水',
            dataIndex: 'recordNo',
            width: 250,
            customRender: ({ text, record }) => {
              return (
                <div>
                  <div>{text}</div>
                  <small class="color-disabled">{record.relateOrderDesc}</small>
                </div>
              )
            }
          },
          {
            title: '用户手机号',
            dataIndex: 'userPhone',
            width: 150,
            customRender: ({ record }) => {
              return record.card ? record.card.userPhone : '-'
            }
          },
          {
            title: '储值卡名称',
            dataIndex: 'name',
            width: 200,
            customRender: ({ record }) => {
              return record.card?.name
            }
          },
          {
            title: '收支类型',
            dataIndex: 'type',
            width: 120,
            customRender: ({ record }) => {
              const foundType = ValueCardBalanceChangeTypeOptions.find((i) => i.value === record?.type)
              return foundType ? foundType.label : ''
            }
          },
          {
            title: '收支金额(元)',
            dataIndex: 'amount',
            width: 120,
            customRender: ({ record }) => {
              return moneyToYuan(record.amount)
            }
          },
          {
            title: '备注',
            dataIndex: 'remark',
            width: 150
          },
          {
            title: '创建时间',
            dataIndex: 'createTime',
            width: 200
          }
        ]
      }
    })

    return () => {
      return Table
    }
  }
})

export default ValueCardUseRecord

export const showValueCardUseRecord = (record: any) => {
  return useModal({
    width: 1000,
    content: () => {
      return <ValueCardUseRecord cardNo={record.cardNo} />
    }
  })
}
