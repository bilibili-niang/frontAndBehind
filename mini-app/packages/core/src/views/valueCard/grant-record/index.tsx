import { defineComponent } from 'vue'
import { useAppStore, useSearchTable, useTableAction } from '@anteng/core'
import { moneyToYuan } from '@anteng/utils'
import { $getValueCardGrantRecords } from '../../../api/valueCard'
import { Button } from '@anteng/ui'
import { ValueCardSourceTypeOptions, ValueCardStatus, ValueCardStatusOptions } from '../../../constants/valueCard'
import { showValueCardUseRecord } from '../use-record'
import { onRevoke, onModifyExpiredDate, onPreActivate, onBatchPreActivate } from './actions'

export default defineComponent({
  title: '发放记录',
  setup() {
    const { Table, silentRefresh } = useSearchTable({
      title: '储值卡发放记录',
      toolbar: (
        <Button
          type="primary"
          onClick={() => {
            onBatchPreActivate(silentRefresh)
          }}
        >
          批量预激活
        </Button>
      ),
      customRequest(params) {
        return $getValueCardGrantRecords(params)
      },
      exportURL: '/null-cornerstone-goods/storeValueCard/export?scene=' + useAppStore().scene,
      filter: {
        list: [
          {
            key: 'title',
            label: '储值卡名称',
            type: 'input',
            fixed: true,
            flex: 4
          },
          {
            key: 'cardNo',
            label: '卡号',
            type: 'input',
            fixed: true,
            flex: 4
          },
          {
            key: 'userPhone',
            label: '归属用户',
            type: 'input',
            fixed: true,
            flex: 4
          },
          {
            key: 'source',
            label: '发放场景',
            type: 'select',
            fixed: true,
            config: {
              options: ValueCardSourceTypeOptions
            },
            flex: 4
          },
          {
            key: 'outOrderNo',
            label: '购买订单号',
            type: 'input',
            fixed: true,
            flex: 4
          },
          {
            key: 'batchNo',
            label: '批次',
            type: 'input',
            fixed: true,
            flex: 4
          },
          {
            key: 'status',
            label: '状态',
            type: 'select',
            fixed: true,
            config: {
              options: ValueCardStatusOptions
            },
            flex: 4
          },
          {
            key: 'createTime',
            label: '创建时间',
            type: 'range-picker',
            fixed: true
          },
          {
            key: 'activeTime',
            label: '激活时间',
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
          //   width: 200
          // },
          {
            dataIndex: 'cardNo',
            title: '卡号',
            width: 200
          },
          {
            dataIndex: 'name',
            title: '储值卡名称',
            width: 200
          },
          {
            dataIndex: 'initBalance',
            title: '面值(元)',
            width: 100,
            customRender: ({ text }) => {
              return moneyToYuan(text)
            }
          },
          {
            dataIndex: 'balance',
            title: '剩余金额(元)',
            width: 120,
            customRender: ({ text }) => {
              return moneyToYuan(text)
            }
          },
          {
            dataIndex: 'validEndTime',
            title: '有效期至',
            width: 150,
            customRender: ({ text }) => {
              return text ?? '-'
            }
          },
          {
            dataIndex: 'status',
            title: '状态',
            width: 80,
            customRender: ({ text }) => {
              const s = ValueCardStatusOptions.find((i) => i.value === text)
              return <div style={{ color: s?.color }}>{s?.label}</div>
            }
          },
          {
            dataIndex: 'userPhone',
            title: '归属用户',
            width: 130,
            customRender: ({ text }) => {
              return text ?? '-'
            }
          },
          {
            dataIndex: 'source',
            title: '发放场景',
            width: 150,
            customRender: ({ text }) => {
              return ValueCardSourceTypeOptions.find((i) => i.value === text)?.label
            }
          },
          {
            title: '创建时间',
            dataIndex: 'createTime',
            width: 200
          },
          {
            title: '激活时间',
            dataIndex: 'activeTime',
            width: 200,
            customRender: ({ text }) => {
              return text ?? '-'
            }
          },
          {
            title: '操作',
            dataIndex: 'title',
            width: 100,
            fixed: 'right',
            customRender: ({ record }) => {
              return useTableAction({
                list: [
                  {
                    title: '收支明细',
                    hidden: !record.userPhone,
                    onClick: () => showValueCardUseRecord(record)
                  },
                  {
                    title: '修改有效期',
                    onClick: () => {
                      onModifyExpiredDate(record, silentRefresh)
                    },
                    hidden: [ValueCardStatus.Revoked].includes(record.status)
                  },
                  {
                    title: '吊销',
                    type: 'danger',
                    onClick: () => {
                      onRevoke(record, silentRefresh)
                    },
                    // // 待发放、待使用时显示
                    hidden: [ValueCardStatus.Revoked, ValueCardStatus.Expired].includes(record.status)
                  },
                  {
                    title: '预激活',
                    hidden: ![ValueCardStatus.PendingActivate].includes(record.status),
                    onClick: () => {
                      onPreActivate(record, silentRefresh)
                    }
                  }
                ]
              })
            }
          }
        ]
      }
    })

    return () => {
      return Table
    }
  }
})
