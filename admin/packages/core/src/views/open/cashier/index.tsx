import { useCrud, useSearchTable, useTableAction } from '@anteng/core'
import { Button } from '@anteng/ui'
import { defineComponent } from 'vue'
import {
  $createOpenAppCashier,
  $getOpenAppCashierDetail,
  $getOpenAppCashierList,
  $updateOpenAppCashier
} from '../../../api/open/cashier'
import { onCashierDetailModal, onCashierMallModal } from './detail'
import { CommonSelectorPropsDefine } from '../../../hooks/useCommonSelector/index'

export default defineComponent({
  name: 'CashierConfig',
  props: {
    ...CommonSelectorPropsDefine
  },
  setup(props) {
    const { onCreate, onUpdate } = useCrud({
      title: '收银台应用',
      schema: {
        type: 'object',
        properties: {
          appName: {
            title: '应用名称',
            type: 'string',
            required: true,
            config: {
              placeholder: '请输入'
            }
          },
          privateKey: {
            title: '第三方私钥',
            type: 'string',
            // required: true,
            config: {
              placeholder: '请输入'
            }
          },
          publicKey: {
            title: '第三方公钥',
            type: 'string',
            // required: true,
            config: {
              placeholder: '请输入'
            }
          },
          shoppingMallUrl: {
            title: '第三方商城 URL',
            type: 'string',
            // required: true,
            config: {
              placeholder: '请输入'
            }
          },
          orderConfirmUrl: {
            title: '第三方订单支付确认 API 请求地址',
            type: 'string',
            // required: true,
            config: {
              placeholder: '请输入'
            }
          },
          orderDetailUrl: {
            title: '第三方订单详情页 URL',
            type: 'string',
            // required: true,
            config: {
              placeholder: '请输入'
            }
          },
          timeout: {
            title: '请求超时时间（单位：秒）',
            type: 'number',
            // required: true,
            config: {
              placeholder: '请输入整数'
            }
          }
        }
      },
      defaultValue: () => {
        return {}
      },
      onCreate(value) {
        return $createOpenAppCashier(value)
      },
      onUpdate(value) {
        return $updateOpenAppCashier(value.id, value)
      }
    })

    const { Table } = useSearchTable({
      title: '收银台配置',
      customRequest: (params) => {
        return $getOpenAppCashierList(params)
      },
      toolbar: props.asSelector ? null : (
        <Button type="primary" onClick={() => onCreate()}>
          新建应用
        </Button>
      ),
      filter: {
        list: [{ key: 'appName', label: '应用名称', type: 'input' }]
      },
      table: {
        columns: [
          { dataIndex: 'appId', title: '应用ID', width: 200 },
          { dataIndex: 'appName', title: '应用名称', width: 250 },
          // { dataIndex: 'privateKey', title: '第三方私钥', width: 200 },
          // { dataIndex: 'publicKey', title: '第三方公钥', width: 200 },
          // { dataIndex: 'shoppingMallUrl', title: '第三方商城 URL', width: 350 },
          // { dataIndex: 'orderConfirmUrl', title: '第三方订单支付确认 API 请求地址', width: 350 },
          // { dataIndex: 'orderDetailUrl', title: '第三方订单详情页 URL', width: 350 },
          // { dataIndex: 'timeout', title: '请求超时时间', width: 140 },
          { dataIndex: 'createTime', title: '创建时间', width: 200 },
          { dataIndex: 'updateTime', title: '更新时间', width: 200 },
          {
            title: '操作',
            width: props.asSelector ? 80 : 150,
            fixed: 'right',
            align: 'center',
            customRender: ({ record }) => {
              if (props.asSelector) {
                return (
                  <Button
                    type="primary"
                    onClick={() => {
                      props.onSelect({
                        id: record.appId,
                        name: record.appName
                      })
                    }}
                  >
                    选择
                  </Button>
                )
              }
              return [
                useTableAction({
                  list: [
                    {
                      title: '详情',
                      onClick: () => {
                        onCashierDetailModal(record.id)
                      }
                    },
                    {
                      title: '编辑',
                      onClick: () => {
                        $getOpenAppCashierDetail(record.id).then((res) => {
                          onUpdate({
                            ...res.data,
                            privateKey: res.data.thirdPrivateKey,
                            publicKey: res.data.thirdPublicKey
                          })
                        })
                      }
                    },
                    { title: '删除', type: 'danger' }
                  ]
                }),
                useTableAction({
                  list: [
                    {
                      title: '商城链接',
                      onClick: () => {
                        onCashierMallModal(record.appId)
                      }
                    }
                  ]
                })
              ]
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
