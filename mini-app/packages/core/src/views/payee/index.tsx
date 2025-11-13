import { computed, defineComponent, onMounted, reactive, ref, toRaw } from 'vue'
import './style.scss'
import { Icon, JsonView, message, Switch, Table } from '@anteng/ui'
import { CommonWidgetPropsDefine, type Schema, SchemaForm } from '@anteng/jsf'
import { usePayeeSelector } from '../../../../../apps/cs/center/src/shared'
import { $getPayeeConfig, $updatePayeeConfig } from './api'
import {
  PAY_CHANNEL_OPTIONS,
  PAY_CHANNEL_WECHAT_MERCHANT,
  PAY_CHANNEL_WECHAT_PAY,
  PaymentScene,
  SCENE_SHOP_HUB,
  SCENE_VENUE
} from '@anteng/config'
import { useTableAction } from '../../components/search-table'
import { $getStadiumList } from '../../../../../apps/cs/venue/src/api/stadium'
import usePagination from '../../hooks/usePagination'
import { $getReceivingAccountList } from '../../../../../apps/cs/center/src/api/payment/payee'
import { cloneDeep } from 'lodash'
import { useResponseMessage } from '../../hooks/useRequestErrorMessage'
import { AuthButton, Spin, useAppStore } from '../../../lib'
import { $getShopList } from '../../../../../apps/cs/shophub/src/api/shop'

const itemName = import.meta.env.VITE_APP_SCENE === SCENE_VENUE ? '场馆' : '门店'

// const entityIdKey = import.meta.env.VITE_APP_SCENE === SCENE_VENUE ? 'stadiumId' : 'shopId'
const entitiesKey =
  import.meta.env.VITE_APP_SCENE === SCENE_VENUE
    ? 'stadiumsId'
    : import.meta.env.VITE_APP_SCENE === SCENE_SHOP_HUB
      ? 'shopsId'
      : 'entitiesId'

export const usePayeeConfig = (params?: { productCode?: string; payScene?: PaymentScene }) => {
  const data = reactive<any>({})

  const loading = ref(false)

  const getConfig = () => {
    loading.value = true
    $getPayeeConfig(params)
      .then((res) => {
        const config = res.data || {}
        config.storeValueCard = config.storeValueCard === 1 ? true : false
        config.multipleRule = (config.multipleRule || []).map((item: any) => {
          const { [entitiesKey]: entities, ...rest } = item.rule
          return {
            ...item,
            active: item.active === 1 ? true : false,
            receivingAccountId: item.receivingAccountId || item.receivingAccount?.id,
            rule: {
              ...rest,
              entities
            }
          }
        })
        config.unifiedRule = (config.unifiedRule || []).map((item: any) => ({
          ...item,
          active: item.active === 1 ? true : false,
          receivingAccountId: item.receivingAccountId || item.receivingAccount?.id
        }))
        Object.assign(data, config)
      })
      .catch((err) => {
      })
      .finally(() => {
        loading.value = false
      })
  }

  const onSave = () => {
    if (loading.value) return void 0

    const config: any = cloneDeep(toRaw(data))
    ;(config as any).storeValueCard = (config as any).storeValueCard ? 1 : 0
    ;(config as any).multipleRule = (config.multipleRule || []).map((item: any) => {
      const { entities, ...rest } = item.rule

      return {
        ...item,
        active: item.active ? 1 : 0,
        rule: {
          ...rest,
          [entitiesKey]: entities
        }
      }
    })
    ;(config as any).unifiedRule = (config.unifiedRule || []).map((item: any) => {
      return {
        ...item,
        active: item.active ? 1 : 0
      }
    })

    loading.value = true
    $updatePayeeConfig({
      ...(config as any),
      productCode: params?.productCode
    })
      .then((res) => {
        useResponseMessage(res)
        if (res.code === 200) {
          getConfig()
        }
      })
      .catch((err) => {
        useResponseMessage(err)
      })
      .finally(() => {
        loading.value = false
      })
  }

  return {
    data,
    loading,
    getConfig,
    onSave
  }
}

export default defineComponent({
  name: 'PayeeSettings',
  props: {
    productCode: String,
    aggregate: Boolean
  },
  setup(props) {
    const schema = computed(() => {
      return {
        type: 'object',
        properties: {
          storeValueCard: {
            title: '储值卡付款',
            type: 'boolean',
            required: true,
            condition: !props.aggregate,
            description: '关闭后用户前台的确认下单页面不显示「储值卡付款」'
          },
          receivingType: {
            title: '收款规则',
            type: 'number',
            required: true,
            widget: 'radio-button',
            description: `同一收款：所有${itemName}产生的收入都会进入到同一个收款账户中`,
            config: {
              options: [
                { label: '统一收款', value: 0 },
                { label: '多账户收款', value: 1 }
              ]
            }
          },
          unifiedRule: {
            title: '统一收款账户',
            type: 'array',
            // required: true,
            widget: MultiplePayee,
            config: {
              specChannel: props.aggregate ? PAY_CHANNEL_WECHAT_MERCHANT : undefined
            },
            condition: (r) => r.receivingType === 0
          },
          multipleRule: {
            title: '独立收款账户',
            type: 'array',
            // required: true,
            widget: SinglePayee,
            config: {
              specChannel: props.aggregate ? PAY_CHANNEL_WECHAT_MERCHANT : undefined
            },
            condition: (r) => r.receivingType === 1
          }
        }
      } as Schema
    })

    const onChange = (v: any) => {
    }

    const { data, getConfig, loading, onSave } = usePayeeConfig({ productCode: props.productCode })

    onMounted(() => {
      getConfig()
    })

    return () => {
      return (
        <div class={['p_payee-settings', loading.value && 'loading']}>
          {loading.value && (
            <div class="p_payee-settings__loading">
              <Spin/>
            </div>
          )}
          <JsonView data={data}/>
          {!props.aggregate && (
            <>
              <h2 class="h2">收款规则配置</h2>
              <div class="color-disabled">
                <Icon name="info"/>
                &nbsp;如果收款账户配置了「微信支付」的账户，需要将「微信支付商户号」与「小程序的appid」完成绑定才可使用，
                <a href="https://pay.weixin.qq.com/static/pay_setting/appid_protocol.shtml" target="_blank">
                  查看指引
                </a>
              </div>
            </>
          )}
          <div class="p_payee-settings__form">
            <SchemaForm schema={schema.value} value={data} onChange={onChange}/>
          </div>
          <div class="p_payee-settings__save">
            {/*为什么取消这里的按钮什么也不做*/}
            <AuthButton
              type="primary"
              perm="venue.payee.save"
              label="保存与取消"
              pagePath="/venueManagement/payee"
              onClick={onSave}
              loading={loading.value}
            >
              取消
            </AuthButton>
            <AuthButton
              type="primary"
              perm="venue.payee.save"
              label="保存与取消"
              pagePath="/venueManagement/payee"
              onClick={onSave}
              loading={loading.value}
            >
              保存
            </AuthButton>
          </div>
        </div>
      )
    }
  }
})

export const MultiplePayee = defineComponent({
  props: {
    ...CommonWidgetPropsDefine,
    specChannel: Number
  },
  setup(props) {
    const { data: accountList, fetchData: getAccountList } = usePagination({
      initialParams: {
        current: 1,
        size: 1000
      },
      requestHandler: (params) => {
        return $getReceivingAccountList(params)
      }
    })

    onMounted(() => {
      getAccountList()
    })

    const isWechatPay = (type: number) => {
      return [PAY_CHANNEL_WECHAT_MERCHANT, PAY_CHANNEL_WECHAT_PAY].includes(type)
    }

    const onSelect = (record: any) => {
      const _list = list.value.slice(0)

      if (_list.some((item) => item.receivingAccountId === record.id)) {
        message.info('重复添加')
        return void 0
      }

      let active = true

      if (
        isWechatPay(record.payChannel) &&
        dataSource.value.some((item) => isWechatPay(item.payChannel) && item.active)
      ) {
        active = false
      }

      _list.push({
        active,
        receivingAccountId: record.id
      })
      props.onChange(_list)
    }

    const onRemove = (id: string) => {
      const _list = list.value.filter((item) => item.receivingAccountId !== id)
      props.onChange(_list)
    }

    const getAccount = (receivingAccountId: string) => {
      return accountList.value.find((item) => item.id === receivingAccountId)
    }

    const onToggleStatus = (id: string) => {
      const _list = list.value.slice(0)
      const target = _list.find((item) => item.receivingAccountId === id)

      if (!target) return void 0

      const targetAccount = getAccount(target.receivingAccountId!)

      const v = !target.active

      try {
        if (isWechatPay(targetAccount?.payChannel)) {
          const other = _list.find((item) => {
            return (
              item.active &&
              item.receivingAccountId !== id &&
              isWechatPay(getAccount(item.receivingAccountId)?.payChannel)
            )
          })
          if (other && v) {
            message.info('只能同时开启一个微信支付')
            return void 0
          }
        }
      } catch (err) {
        console.log(err)
      }

      target.active = v

      props.onChange(_list)
    }

    const columns = [
      { dataIndex: 'accountName', title: '账户名称', width: 150 },
      {
        title: '商户号信息',
        width: 150,
        customRender: ({ record }: any) => {
          const { mchName, mchId } = record.receivingAccount || record
          return (
            <div>
              <div>商户名称：{mchName}</div>
              <div>商户ID：{mchId}</div>
            </div>
          )
        }
      },
      {
        dataIndex: 'payChannel',
        title: '支付通道',
        width: 150,
        customRender: ({ text }: any) => {
          return PAY_CHANNEL_OPTIONS.find((i) => i.value === text)?.label
        }
      },
      {
        dataIndex: 'active',
        title: '状态',
        width: 80,
        align: 'center',
        customRender: ({ record, text }: any) => {
          return (
            <Switch
              checked={text}
              onChange={() => {
                onToggleStatus(record.id)
              }}
            />
          )
        }
      },
      {
        title: '操作',
        width: 80,
        align: 'center',
        customRender: ({ record }: any) => {
          return useTableAction({
            list: [
              {
                title: '删除',
                type: 'danger',
                label: '删除',
                perm: 'venue.payee.multiple.remove',
                pagePath: '/venueManagement/payee',
                onClick: () => {
                  onRemove(record.id)
                }
              }
            ]
          })
        }
      }
    ]

    const list = computed<
      {
        receivingAccountId: string
        active: boolean
      }[]
    >(() => {
      return props.value || []
    })

    const dataSource = computed(() => {
      return list.value.map((item) => {
        return {
          ...item,
          ...accountList.value.find((i) => i.id === item.receivingAccountId)
        }
      })
    })

    return () => {
      return (
        <div style="margin-top:8px;">
          <AuthButton
            type="link"
            perm="venue.payee.selectAccount"
            label="选择收款账号"
            pagePath="/venueManagement/payee"
            onClick={() => {
              usePayeeSelector(onSelect, props.specChannel ?? props.config?.specChannel)
            }}
          >
            选择收款账号
          </AuthButton>
          <div style="margin-top:8px;">
            <Table
              bordered
              columns={columns as any}
              pagination={false}
              scroll={{ x: 600 }}
              dataSource={dataSource.value}
            />
          </div>
        </div>
      )
    }
  }
})

const SinglePayee = defineComponent({
  props: {
    ...CommonWidgetPropsDefine,
    specChannel: Number
  },
  setup(props) {
    const {
      data: stadiumList,
      fetchData,
      refreshData
    } = usePagination({
      initialParams: {
        current: 1,
        size: 1000
      },
      requestHandler: (params) => {
        const scene = useAppStore().scene
        if (scene === SCENE_SHOP_HUB) {
          return $getShopList(params)
        } else if (scene === SCENE_VENUE) {
          return $getStadiumList(params)
        } else {
          return Promise.reject(new Error('不支持的场景'))
        }
      }
    })

    const { data: accountList, fetchData: getAccountList } = usePagination({
      initialParams: {
        current: 1,
        size: 1000
      },
      requestHandler: (params) => {
        return $getReceivingAccountList(params)
      }
    })

    onMounted(() => {
      fetchData()
      getAccountList()
    })

    type Value = {
      receivingAccountId: string
      active: boolean
      rule: {
        entities: string[]
      }
    }[]

    type Data = { entityId: string; receivingAccountId: string[] }[]

    const value = computed<Value>(() => props.value || [])

    const value2Data = () => {
      const data: Data = []
      value.value.reduce((data, item) => {
        ;(item.rule.entities || []).map((id) => {
          let target = data.find((i) => i.entityId === id)
          if (!target) {
            target = {
              entityId: id,
              receivingAccountId: []
            }
            data.push(target)
          }

          target.receivingAccountId.push(item.receivingAccountId)
        })
        return data
      }, data)

      return data
    }

    const data2Value = (d: Data) => {
      const rules: Value = []
      d.forEach((item) => {
        ;(item.receivingAccountId || []).forEach((accountId) => {
          let rule = rules.find((i) => i.receivingAccountId === accountId)
          if (!rule) {
            rule = {
              receivingAccountId: accountId,
              active: true,
              rule: {
                entities: []
              }
            }
            rules.push(rule)
          }
          rule.rule.entities.push(item.entityId)
        })
      })
      return rules
    }

    const data = computed({
      get() {
        return value2Data()
      },
      set(v) {
        const res = data2Value(v)
        props.onChange(res)
      }
    })

    const dataSource = computed(() => {
      return stadiumList.value.map((item) => {
        const target = data.value.find((i) => i.entityId === item.id)
        return {
          name: item.name,
          id: item.id,
          accounts: (target?.receivingAccountId || []).map((accountId) => {
            return (
              accountList.value.find((item: any) => {
                return item.id === accountId
              }) || accountId
            )
          })
        }
      })
    })

    const onSelect = (record: any, accountItem: any) => {
      const _data = data.value.slice(0)
      let target = _data.find((item) => item.entityId === record.id)

      if (!target) {
        target = {
          entityId: record.id,
          receivingAccountId: []
        }
        _data.push(target)
      }

      if (target.receivingAccountId.includes(accountItem.id)) {
        message.info('重复添加')
        return void 0
      } else {
        target.receivingAccountId.push(accountItem.id)
      }

      data.value = _data
    }

    const onRemove = (record: any, account: any) => {
      const _data = data.value.slice(0)
      const target = _data.find((item) => item.entityId === record.id)
      if (target) {
        target.receivingAccountId = target.receivingAccountId.filter((i) => i !== account.id)
        data.value = _data
      }
    }

    const columns = [
      { dataIndex: 'name', title: `${itemName}名称`, width: 200 },
      {
        title: '收款账户',
        width: 300,
        customRender: ({ record }: any) => {
          if (!record.accounts) return null

          return (
            <div class="p_payee-settings__rules">
              {(record.accounts || []).map((item: any) => {
                if (!item) return null

                if (typeof item === 'string') {
                  return <div>{item}</div>
                }

                const payChannel = PAY_CHANNEL_OPTIONS.find((i) => i.value === item.payChannel)

                return (
                  <div class="p_payee-settings__rule-item ">
                    <div class="text">
                      {payChannel?.label}： {item.accountName}
                    </div>
                    <Icon
                      class="remove clickable"
                      name="close"
                      onClick={() => {
                        onRemove(record, item)
                      }}
                    />
                  </div>
                )
              })}
            </div>
          )
        }
      },
      {
        title: '操作',
        width: 80,
        customRender: ({ record }: any) => {
          return useTableAction({
            list: [
              {
                title: '添加',
                label: '添加',
                perm: 'venue.payee.single.add',
                pagePath: '/venueManagement/payee',
                onClick: () => {
                  usePayeeSelector((item) => {
                    onSelect(record, item)
                  }, props.specChannel ?? props.config?.specChannel)
                }
              }
            ]
          })
        }
      }
    ]

    return () => {
      return (
        <div style="margin-top:8px;">
          <Table bordered dataSource={dataSource.value} columns={columns} pagination={false}></Table>
        </div>
      )
    }
  }
})
