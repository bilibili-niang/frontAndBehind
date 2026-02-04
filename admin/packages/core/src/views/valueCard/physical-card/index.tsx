import {
  downloadFile,
  useModal,
  usePagination,
  useResponseMessage,
  useSchemaFormModal,
  useSearchTable,
  useSelector,
  useSmsSchema,
  useTableAction
} from '@pkg/core'
import { Alert, Button, JsonView, message } from '@pkg/ui'
import { computed, defineComponent, ref, watch } from 'vue'
import {
  $createPhysicalValueCard,
  $getPhysicalValueCardCreateRecords,
  $getPhysicalValueCardDownloadFile,
  $getPhysicalValueCardOperateLog,
  $getValueCardList
} from '../../../api/valueCard'
import { Schema } from '@pkg/jsf'
import {
  ValueCardOperateLogTypeOptions,
  ValueCardBatchStatusOptions,
  ValueCardBatchStatus
} from '../../../constants/valueCard'

export default defineComponent({
  title: '实体卡制作',
  setup() {
    const { Table, refresh } = useSearchTable({
      title: '实体卡制作',
      customRequest(params) {
        return $getPhysicalValueCardCreateRecords(params)
      },
      toolbar: (
        <Button type="primary" onClick={() => onCreate()}>
          批量制卡
        </Button>
      ),
      filter: {
        list: [
          {
            key: 'cardName',
            label: '实体卡名称',
            type: 'input',
            fixed: true
          },
          {
            key: 'batchNo',
            label: '编码批次',
            type: 'input',
            fixed: true
          }
        ]
      },
      filterFront: () => (
        <div>
          <Alert
            style="margin:0 6px;border-radius:8px;align-self:flex-start;width:fit-content;"
            message={
              <div>
                <div>1、 如果您需要制作实体卡，请可以通过此功能生成卡号卡密，再下载卡密文件交由印刷厂制卡</div>
                <div>2、卡密文件下载需要密码解压缩，密码将以短信的形式发送给店铺管理员，请联系管理员获取解压密码</div>
                <div>3、用户购买实体卡后，可通过用户前台的【储值卡兑换】功能激活卡</div>
              </div>
            }
            type="info"
          />
        </div>
      ),
      table: {
        columns: [
          // { dataIndex: 'id', title: 'ID', width: 200 },
          { dataIndex: 'batchNo', title: '编码批次', width: 210 },
          { dataIndex: 'cardName', title: '储值卡名称', width: 200 },
          {
            dataIndex: 'parValue',
            title: '面值（元）',
            width: 100,
            customRender: ({ text }) => {
              return <div>&yen; {text / 100}</div>
            }
          },
          {
            dataIndex: 'number',
            title: '数量（张）',
            width: 100
          },
          {
            dataIndex: 'status',
            title: '状态',
            width: 110,
            customRender: ({ text }) => {
              const status = ValueCardBatchStatusOptions.find((i) => i.value === text)
              return <div style={{ color: status?.color }}>{status?.label ?? text}</div>
            }
          },
          {
            title: '操作',
            width: 160,
            fixed: 'right',
            customRender: ({ record }) => {
              return useTableAction({
                list: [
                  {
                    title: '下载文件',
                    disabled: record.status !== ValueCardBatchStatus.Completed,
                    onClick: () => {
                      const end = message.loading('正在准备下载中...')
                      $getPhysicalValueCardDownloadFile(record.id)
                        .then((res) => {
                          useResponseMessage(res)
                          if (res.data) {
                            downloadFile(res.data)
                          }
                        })
                        .catch(useResponseMessage)
                        .finally(() => {
                          end()
                        })
                    }
                  },
                  {
                    title: '操作日志',
                    onClick: () => {
                      showOperateLog(record)
                    }
                  }
                ]
              })
            }
          }
        ]
      }
    })

    const onCreate = () => {
      const state = ref({
        cardManageId: undefined,
        faceValueId: undefined,
        number: null
        // smsId: '',
        // value: ''
      })

      const { data, fetchData, isLoading } = usePagination({
        requestHandler: () => {
          return $getValueCardList({
            current: 1,
            size: 1000
          })
        }
      })

      fetchData()

      const cardOptions = computed(() => {
        return data.value.map((item) => {
          return {
            label: item.name,
            value: item.id
          }
        })
      })

      const currentCard = computed(() => {
        return data.value.find((item) => item.id === state.value.cardManageId)
      })

      watch(
        () => currentCard.value,
        () => {
          state.value.faceValueId = undefined
        }
      )

      const faceValueOptions = computed(() => {
        return (
          data.value
            .find((item) => item.id === state.value.cardManageId)
            ?.cardFaceValue?.map((fv) => ({
              label: <div>&yen; {fv.parValue / 100}</div>,
              value: fv.id
            })) ?? []
        )
      })

      const { schema: smsSchema, smsId } = useSmsSchema({ valueKey: 'smsValue', sendToCurrentUser: true })

      const schema = computed<Schema>(() => {
        return {
          type: 'object',
          properties: {
            cardManageId: {
              title: '选择储值卡',
              type: 'string',
              required: true,
              widget: 'select',
              config: {
                placeholder: '请选择储值卡',
                options: cardOptions.value,
                loading: isLoading.value
              }
            },
            faceValueId: {
              title: '选择面值',
              type: 'string',
              required: true,
              widget: 'select',
              config: {
                placeholder: currentCard.value ? '请选择面值' : '请先选择储值卡',
                options: faceValueOptions.value
              }
            },
            number: {
              title: '制卡数量',
              type: 'number',
              required: true,
              config: {
                placeholder: '请输入制卡数量',
                min: 1,
                max: 10000
              }
            },
            ...smsSchema
          }
        }
      })

      useSchemaFormModal({
        title: '批量制卡',
        schema: schema,
        data: state.value,
        dataReplicated: false,
        okText: '确定生成',
        onOk: async (data) => {
          const params = {
            ...data,
            smsId: smsId.value
          }

          return $createPhysicalValueCard(params)
            .then((res) => {
              useResponseMessage(res)
              refresh()
              return res
            })
            .catch(useResponseMessage)
        }
      })
    }

    return () => {
      return Table
    }
  }
})

const showOperateLog = (record: any) => {
  const { Table } = useSearchTable({
    title: '操作日志',
    filter: {
      list: [
        {
          key: 'type',
          label: '操作类型',
          type: 'select',
          config: { options: ValueCardOperateLogTypeOptions },
          fixed: true
        },

        { key: 'createTime', label: '操作时间', type: 'range-picker', flex: 12, fixed: true }
      ]
    },
    customRequest: (params) => {
      return $getPhysicalValueCardOperateLog({
        ...params,
        id: record.id
      })
    },
    table: {
      columns: [
        { dataIndex: 'batchNo', title: '批次编码', width: 210 },
        {
          dataIndex: 'type',
          title: '操作类型',
          width: 100,
          customRender: ({ text }) => {
            return ValueCardOperateLogTypeOptions.find((i) => i.value === text)?.label
          }
        },
        { dataIndex: 'createUserPhone', title: '操作人', width: 150 },
        { dataIndex: 'content', title: '操作结果', width: 150 },
        { dataIndex: 'createTime', title: '操作时间', width: 200 }
      ]
    }
  })

  useModal({
    width: 1000,
    content: () => {
      return Table
    }
  })
}
