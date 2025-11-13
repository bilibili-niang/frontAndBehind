import { Button, Icon, JsonView, message, RadioButton, Select, Switch, Table, TabPane, Tabs, Tooltip } from '@anteng/ui'
import { computed, defineComponent, onMounted, PropType, ref, watch } from 'vue'

import './style.scss'
import { usePaymentAccountSelector } from '../../../../../../apps/cs/center/src/views/payment/account'
import { useTableAction } from '../../../components/search-table'
import {
  COMMON_STATUS_OFF,
  COMMON_STATUS_ON,
  PAYMENT_CHANNEL_OPTIONS,
  PAYMENT_SCENE_OPTIONS,
  PaymentChannel,
  PaymentScene,
  SCENE_SHOP_HUB,
  SCENE_STORE,
  SCENE_VENUE,
  SUB_PAYMENT_OPTIONS,
  SubPaymentMethod
} from '@anteng/config'
import { CommonWidgetPropsDefine } from '@anteng/jsf'
import usePagination from '../../../hooks/usePagination'
import useAppStore from '../../../stores/app'
import { $getShopList } from '../../../../../../apps/cs/shophub/src/api/shop'
import useSchemaFormModal from '../../../hooks/useSchemaFormModal'
import { defaults, flatten, uniq } from 'lodash'
import { $fakeRequest, $getPayeeConfig, $updatePayeeConfig } from '../api'
import { useResponseMessage } from '../../../hooks/useRequestErrorMessage'
import { requestGetShopList } from '@anteng/cs-microstore/src/api/shop'

enum PayeeRule {
  Union = 0,
  Multiple = 1
}
const $getStadiumList = $fakeRequest

const PayeeRuleOptions = [
  {
    label: '统一收款',
    value: PayeeRule.Union,
    desc: '统一收款：所有门店产生的收入都会进入到同一个收款账户中',
    scene: undefined
  },
  {
    label: '多账户收款',
    value: PayeeRule.Multiple,
    desc: '多账户收款：支持按门店分别设置收款账户，用户下单时使用哪个账户收款，取决于用户当前所选择的是哪个门店',
    scene: [SCENE_VENUE, SCENE_SHOP_HUB]
  }
] as const

export const CommonPaymentAccountConfig = defineComponent({
  props: {
    grantType: Boolean,
    productCode: String
  },
  setup(props) {
    const appStore = useAppStore()
    const cashierEnable = computed(() => !props.grantType && [SCENE_VENUE, SCENE_SHOP_HUB].includes(appStore.scene))

    return () => {
      if (props.grantType) {
        return (
          <div class="common-payment-account-config">
            <PaymentConfig payScene={PaymentScene.Weapp} productCode={props.productCode} />
          </div>
        )
      }

      return (
        <div class="common-payment-account-config">
          <Tabs>
            <TabPane tab="微信小程序" key="weapp">
              <PaymentConfig payScene={PaymentScene.Weapp} />
            </TabPane>
            {cashierEnable.value && (
              <TabPane tab="收银台" key="cashier">
                <PaymentConfig payScene={PaymentScene.Cashier} />
              </TabPane>
            )}
          </Tabs>
        </div>
      )
    }
  }
})

export default CommonPaymentAccountConfig

export const usePaymentConfig = (options: { payScene: PaymentScene; productCode?: string; silent?: boolean }) => {
  const defaultState = () => {
    return {
      productCode: options.productCode || useAppStore().scene,
      payScene: options.payScene,
      storeValueCard: COMMON_STATUS_OFF,
      userAccount: COMMON_STATUS_OFF,
      receivingType: PayeeRule.Union,
      unifiedRule: [] as { payMethods: PayMethodRule }[],
      multipleRule: [] as { payMethods: PayMethodRule; entityId: string }[]
    }
  }

  const state = ref(defaultState())

  const isLoading = ref(false)

  const getConfig = () => {
    isLoading.value = true
    let end: any = null
    if (!options.silent) {
      end = message.loading('加载中...')
    }
    $getPayeeConfig({ productCode: options.productCode || useAppStore().scene, payScene: options.payScene })
      .then((res) => {
        if (res.code === 200) {
          message.success('数据加载成功')
          retrieve(res.data)
        } else {
          useResponseMessage(res)
        }
      })
      .catch(useResponseMessage)
      .finally(() => {
        end?.()
        isLoading.value = false
      })
  }

  const retrieve = (data: any) => {
    state.value = {
      ...state.value,
      ...data,
      unifiedRule: flatten(
        data.unifiedRule.map((item: any) => {
          return item.payMethods
        })
      ),
      multipleRule: flatten(
        data.multipleRule.map((item: any) => {
          return item.payMethods.map((i: any) => {
            return {
              ...i,
              entityId: item.entityId,
              entityName: item.entityName
            }
          })
        })
      ),
      payScene: options.payScene
    }
  }

  onMounted(() => {
    getConfig()
  })

  const format = () => {
    const { productCode, payScene, storeValueCard, userAccount, receivingType, unifiedRule, multipleRule } = state.value

    return {
      productCode,
      payScene,
      storeValueCard,
      userAccount,
      receivingType,
      unifiedRule: [
        {
          payMethods: unifiedRule.map((item) => {
            return {
              ...item,
              receivingAccount: undefined,
              receivingAccountId: item.receivingAccount?.id
            }
          })
        }
      ],
      multipleRule: Object.values(
        multipleRule.reduce((acc: Record<string, { entityId: string; payMethods: any[] }>, item) => {
          if (!acc[item.entityId]) {
            acc[item.entityId] = {
              entityId: item.entityId,
              payMethods: []
            }
          }
          acc[item.entityId].payMethods.push({
            ...item,
            receivingAccount: undefined,
            receivingAccountId: item.receivingAccount?.id
          })
          return acc
        }, {})
      )
    }
  }

  const onSave = () => {
    const params = format()

    const end = message.loading('保存中...')
    $updatePayeeConfig(params)
      .then((res) => {
        useResponseMessage(res)
        getConfig()
      })
      .catch((err) => {
        useResponseMessage(err)
      })
      .finally(() => {
        end()
      })
  }

  return {
    state,
    isLoading,
    getConfig,
    onSave
  }
}

const PaymentConfig = defineComponent({
  props: {
    payScene: {
      type: Number as PropType<PaymentScene>,
      required: true
    },
    productCode: String
  },
  setup(props) {
    const appStore = useAppStore()

    const productCode = computed(() => props.productCode || useAppStore().scene)

    const balanceEnable = computed(() => [SCENE_STORE].includes(appStore.scene))

    const computedPayeeRuleOptions = computed(() => {
      return PayeeRuleOptions.filter((item) => {
        if (!item.scene) return true
        return item.scene.includes(appStore.scene)
      })
    })

    const { state, getConfig, onSave } = usePaymentConfig({ payScene: props.payScene, productCode: productCode.value })

    return () => {
      return (
        <div class="p_payment-config">
          <div class="p_payment-config__form">
            <div style="display:flex;">
              <div class="value-card">
                <h2>
                  储值卡付款&emsp;
                  <Switch
                    checked={state.value.storeValueCard === COMMON_STATUS_ON}
                    onChange={(e: boolean) => {
                      state.value.storeValueCard = e ? COMMON_STATUS_ON : COMMON_STATUS_OFF
                    }}
                  />
                </h2>
                <div class="color-disabled">
                  关闭后，用户前台的确认下单页面不显示「储值卡付款」
                  <div>且「个人中心」不显示「我的储值卡」</div>
                </div>
              </div>
              {balanceEnable.value && (
                <div class="value-card" style="margin-left:48px">
                  <h2>
                    余额支付&emsp;
                    <Switch
                      checked={state.value.userAccount === COMMON_STATUS_ON}
                      onChange={(e: boolean) => {
                        state.value.userAccount = e ? COMMON_STATUS_ON : COMMON_STATUS_OFF
                      }}
                    />
                  </h2>
                  <div class="color-disabled">
                    关闭后，用户前台的确认下单页面不显示「余额支付」
                    <div>且「个人中心」不显示「我的余额」</div>
                  </div>
                </div>
              )}
            </div>
            <br />
            <h2>收款规则</h2>
            <RadioButton
              style="width:fit-content;max-width:200px"
              options={computedPayeeRuleOptions.value}
              value={state.value.receivingType}
              onChange={(e: number) => {
                state.value.receivingType = e
              }}
            />
            <div class="color-disabled" style="margin-top:8px">
              {computedPayeeRuleOptions.value.find((item) => item.value === state.value.receivingType)?.desc}
            </div>
            {state.value.receivingType !== PayeeRule.Multiple ? (
              <UnifiedPayment
                value={state.value.unifiedRule}
                payScene={props.payScene}
                onChange={(e: PayMethodRule[]) => {
                  state.value.unifiedRule = e
                }}
              />
            ) : (
              <MultiplePayment
                value={state.value.multipleRule}
                payScene={props.payScene}
                onChange={(e: PayMethodRule[]) => {
                  state.value.multipleRule = e
                }}
              />
            )}

            <div class="p_payment-config__footer">
              <Tooltip title="若修改未保存，刷新将丢失修改内容">
                <Button size="large" onClick={getConfig}>
                  刷新
                </Button>
              </Tooltip>
              <Button size="large" type="primary" onClick={onSave}>
                保存
              </Button>
            </div>
          </div>
          {process.env.NODE_ENV !== 'production' && (
            <div>
              <JsonView data={state.value} />
            </div>
          )}
        </div>
      )
    }
  }
})

const UnifiedPayment = defineComponent({
  props: {
    value: {
      type: Array as PropType<PayMethodRule[]>,
      required: true
    },
    onChange: {
      type: Function as PropType<(value: PayMethodRule[]) => void>,
      required: true
    },
    payScene: {
      type: Number as PropType<PaymentScene>,
      required: true
    }
  },
  setup(props) {
    const list = ref<PayMethodRule[]>(props.value ?? [])

    watch(
      () => props.value,
      (v) => {
        list.value = v
      }
    )

    const onAdd = () => {
      usePayMethod({
        payScene: props.payScene,
        addedPayMethods: list.value.map((item) => item.payMethod),
        onChange: (res) => {
          list.value.push(res)
          props.onChange(list.value)
        }
      })
    }

    const onUpdate = (record: PayMethodRule) => {
      usePayMethod({
        payScene: props.payScene,
        data: record,
        addedPayMethods: list.value.map((item) => item.payMethod),
        onChange: (res) => {
          const i = list.value.indexOf(record)
          if (i > -1) {
            list.value.splice(i, 1, res)
          }
        }
      })
    }

    const onRemove = (record: PayMethodRule) => {
      const i = list.value.indexOf(record)
      if (i > -1) {
        list.value.splice(i, 1)
      }
    }
    return () => {
      return (
        <div style="margin-top:24px">
          <h2>
            统一收款账户&emsp;
            <Button size="small" type="primary" onClick={onAdd}>
              添加支付方式
            </Button>
          </h2>
          <Table
            style="margin-top:8px"
            bordered
            dataSource={list.value}
            pagination={false}
            scroll={{ x: 1000 }}
            columns={[
              {
                title: '收款实体',
                width: 200,
                customCell: (record: any, index: number) => {
                  if (index === 0) {
                    return { rowSpan: list.value.length || 1 }
                  }
                  return {
                    rowSpan: 0
                  }
                },
                customRender: ({ record }: any) => {
                  return (
                    <div>
                      <h2>全部实体通用</h2>
                    </div>
                  )
                }
              },
              {
                dataIndex: 'payMethod',
                title: '支付方式',
                width: 100,
                customRender: ({ record }: any) => {
                  return <div>{SUB_PAYMENT_OPTIONS.find((item) => item.value === record.payMethod)?.label}</div>
                }
              },
              {
                title: '主收款账户',
                width: 250,
                customRender: ({ record }: any) => {
                  if (!record.receivingAccount) return <div class="color-disabled">-</div>
                  return (
                    <div>
                      <div>{record.receivingAccount?.accountName}</div>
                      <div class="color-disabled">
                        {record.receivingAccount?.mchName}（{record.receivingAccount?.mchId}）
                      </div>
                    </div>
                  )
                }
              },
              {
                dataIndex: 'sort',
                title: '优先级',
                width: 80
              },
              {
                title: '启用',
                width: 100,
                customRender: ({ record }: any) => {
                  return (
                    <Switch
                      checked={record.active === COMMON_STATUS_ON}
                      onChange={(e: boolean) => {
                        record.active = e ? COMMON_STATUS_ON : COMMON_STATUS_OFF
                      }}
                    />
                  )
                }
              },
              {
                title: '操作',
                width: 120,
                customRender: ({ record }: any) => {
                  return useTableAction({
                    list: [
                      {
                        title: '编辑',
                        onClick: () => {
                          onUpdate(record)
                        }
                      },
                      {
                        title: '删除',
                        type: 'danger',
                        onClick: () => {
                          onRemove(record)
                        }
                      }
                    ]
                  })
                }
              }
            ]}
          ></Table>
        </div>
      )
    }
  }
})

const MultiplePayment = defineComponent({
  props: {
    value: {
      type: Array as PropType<PayMethodRuleWithEntity[]>,
      required: true
    },
    onChange: {
      type: Function as PropType<(value: PayMethodRuleWithEntity[]) => void>,
      required: true
    },
    payScene: {
      type: Number as PropType<PaymentScene>,
      required: true
    }
  },
  setup(props) {
    const {
      data: entityList,
      fetchData: getEntityList,
      refreshData: refreshEntityList,
      isLoading: entityListLoading
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
        } else if (scene === SCENE_STORE) {
          return requestGetShopList(params)
        } else {
          return Promise.reject(new Error('不支持的场景'))
        }
      }
    })

    onMounted(() => {
      getEntityList()
    })

    const list = ref<PayMethodRuleWithEntity[]>(props.value ?? [])

    watch(
      () => props.value,
      (v) => {
        list.value = v
      }
    )

    const tableList = computed(() => {
      return flatten(
        entityList.value.map((item: any) => {
          // 在 list 中查找所有 entityId 匹配的项
          const matchedList = list.value.filter((i: PayMethodRuleWithEntity) => i.entityId === item.id)
          // 如果没有匹配到，填充一个空项
          if (matchedList.length === 0) {
            return [
              {
                $index: 0,
                entityName: item.name,
                entityId: item.id
              }
            ]
          }

          // 有多个匹配项则全部展开
          return matchedList
            .sort((a, b) => b.sort - a.sort)
            .map((matched, index) => ({
              ...matched,
              $index: index,
              $rowSpan: matchedList.length,
              entityName: item.name,
              entityId: item.id
            }))
        })
      )
    })

    const onAdd = (record: PayMethodRuleWithEntity) => {
      usePayMethod({
        payScene: props.payScene,
        entityId: record.entityId,
        entityName: record.entityName,
        addedPayMethods: list.value.filter((item) => item.entityId === record.entityId).map((item) => item.payMethod),
        onChange: (res) => {
          list.value.push({ ...res, entityId: record.entityId, entityName: record.entityName })
          props.onChange(list.value)
        }
      })
    }

    const onUpdate = (record: PayMethodRuleWithEntity) => {
      usePayMethod({
        payScene: props.payScene,
        data: record,
        addedPayMethods: list.value.filter((item) => item.entityId === record.entityId).map((item) => item.payMethod),
        onChange: (res) => {
          const index = list.value.findIndex(
            (i) => i.entityId === record.entityId && i.receivingAccount?.id === record.receivingAccount?.id
          )
          if (index > -1) {
            list.value.splice(index, 1, { ...res, entityId: record.entityId, entityName: record.entityName })
            props.onChange(list.value)
          }
        }
      })
    }

    const onRemove = (record: PayMethodRuleWithEntity) => {
      const index = list.value.findIndex(
        (i) => i.entityId === record.entityId && i.receivingAccount?.id === record.receivingAccount?.id
      )
      if (index > -1) {
        list.value.splice(index, 1)
        props.onChange(list.value)
      }
    }

    const onUpdateStatus = (record: PayMethodRuleWithEntity, e: number) => {
      const index = list.value.findIndex(
        (i) => i.entityId === record.entityId && i.receivingAccount?.id === record.receivingAccount?.id
      )
      if (index > -1) {
        list.value[index].active = e
        props.onChange(list.value)
      }
    }

    const customCell = (record: any) => {
      if (record.$index === 0) {
        return { rowSpan: record.$rowSpan || 1 }
      }
      return {
        rowSpan: 0
      }
    }

    const filters = computed(() => {
      return entityList.value.map((item) => {
        return {
          text: item.name,
          value: item.id
        }
      })
    })

    const onFilter = (value: string, record: any) => {
      return record.entityId === value
    }

    return () => {
      return (
        <div style="margin-top:24px">
          <h2>独立收款账户</h2>
          <div>
            <Table
              style="margin-top:8px"
              bordered
              dataSource={tableList.value}
              pagination={false}
              scroll={{ x: 1000 }}
              loading={entityListLoading.value}
              columns={[
                {
                  title: '收款实体',
                  width: 200,
                  customCell,
                  filters: filters.value,
                  onFilter,
                  customRender: ({ record }: any) => {
                    return (
                      <div>
                        <h2>{record.entityName}</h2>
                        <a onClick={() => onAdd(record)}>添加支付方式</a>
                      </div>
                    )
                  }
                },
                {
                  dataIndex: 'payMethod',
                  title: '支付方式',
                  width: 100,
                  customRender: ({ record }: any) => {
                    if (record.payMethod === undefined) return null
                    return <div>{SUB_PAYMENT_OPTIONS.find((item) => item.value === record.payMethod)?.label}</div>
                  }
                },
                {
                  title: '主收款账户',
                  width: 250,
                  customRender: ({ record }: any) => {
                    if (!record.receivingAccount) return null
                    return (
                      <div>
                        <div>{record.receivingAccount?.accountName}</div>
                        <div class="color-disabled">
                          {record.receivingAccount?.mchName}（{record.receivingAccount?.mchId}）
                        </div>
                      </div>
                    )
                  }
                },
                {
                  dataIndex: 'sort',
                  title: '优先级',
                  width: 80
                },
                {
                  title: '启用',
                  width: 100,
                  customRender: ({ record }: any) => {
                    if (record.payMethod === undefined) return null
                    return (
                      <Switch
                        checked={record.active === COMMON_STATUS_ON}
                        onChange={(e: boolean) => {
                          onUpdateStatus(record, e ? COMMON_STATUS_ON : COMMON_STATUS_OFF)
                        }}
                      />
                    )
                  }
                },
                {
                  title: '操作',
                  width: 120,
                  customRender: ({ record }: any) => {
                    if (record.payMethod === undefined) return null
                    return useTableAction({
                      list: [
                        {
                          title: '编辑',
                          onClick: () => {
                            onUpdate(record)
                          }
                        },
                        {
                          title: '删除',
                          type: 'danger',
                          onClick: () => {
                            onRemove(record)
                          }
                        }
                      ]
                    })
                  }
                }
              ]}
            ></Table>
          </div>
        </div>
      )
    }
  }
})

const defaultPayMethodState = (): PayMethodRule => {
  return {
    payMethod: undefined as unknown as SubPaymentMethod,
    // @ts-ignore
    receivingAccount: undefined,
    sort: 0,
    active: COMMON_STATUS_ON
  }
}

type PayMethodRule = {
  payMethod: SubPaymentMethod
  receivingAccount: {
    id: string
    mchName: string
    mchId: string
    accountName: string
    payChannel: string
  }
  sort: number
  active: number
}
type PayMethodRuleWithEntity = PayMethodRule & {
  entityId: string
  entityName: string
}

const usePayMethod = (options?: {
  payScene: PaymentScene
  data?: any
  entityName?: string
  entityId?: string
  onChange: (res: PayMethodRule) => void
  addedPayMethods?: PayMethodRule[]
}) => {
  const isUpdate = !!options?.data
  const isMultiple = !!options?.entityId

  const state = ref(defaults(options?.data, defaultPayMethodState()))

  watch(
    () => state.value.payMethod,
    () => {
      state.value.receivingAccount = undefined
    }
  )

  const paySceneSelectablePayMethods = computed(() => {
    return uniq(
      flatten(PAYMENT_CHANNEL_OPTIONS.map((item) => item.capabilities))
        .filter((item) => item.payScene === options?.payScene)
        .map((i) => i.subPaymentMethod)
    )
  })

  const payMethods = computed(() => {
    return SUB_PAYMENT_OPTIONS.map((item) => {
      // 如果已添加，则禁用，但当前编辑的支付方式除外
      const disabled = options?.addedPayMethods?.includes(item.value) && item.value !== options?.data?.payMethod

      let paySceneDisabled = !paySceneSelectablePayMethods.value.includes(item.value)

      if (item.value === SubPaymentMethod.Cash && options?.payScene === PaymentScene.Cashier) {
        paySceneDisabled = false
      }

      return {
        ...item,
        label: (
          <div style="display:flex;align-items:center;">
            <img style="width:24px;height:24px;margin-right:6px;margin-left" src={item.icon} alt={item.label} />
            <span>{item.label}</span>
            <span style="margin-left:auto;">
              {paySceneDisabled ? '（支付场景不适用）' : disabled ? '（已添加）' : ''}
            </span>
          </div>
        ),
        disabled: disabled || paySceneDisabled
      }
    }).sort((a, b) => (a.disabled ? 1 : 0) - (b.disabled ? 1 : 0))
  })

  useSchemaFormModal({
    title: isUpdate ? '编辑支付方式' : '添加支付方式',
    data: state.value,
    schema: {
      type: 'object',
      properties: {
        _: {
          title: '门店名称',
          type: 'null',
          hidden: !isMultiple,
          readOnly: true,
          widget: () => {
            return <Select style="width:100%" value={options?.entityName} disabled />
          }
        },
        _payScene: {
          title: '支付场景',
          type: 'null',
          readOnly: true,
          widget: () => {
            return <Select style="width:100%" options={PAYMENT_SCENE_OPTIONS} value={options?.payScene} disabled />
          }
        },
        payMethod: {
          title: '支付方式',
          type: 'number',
          required: true,
          widget: 'select',
          config: {
            options: payMethods.value,
            placeholder: '必填，请选择'
          }
        },
        receivingAccount: {
          title: '收款账户',
          type: 'object',
          required: true,
          condition: (r) => r.payMethod !== SubPaymentMethod.Cash,
          widget: (props) => {
            return <PaymentAccountSelector {...props} payScene={options?.payScene} />
          }
        },
        sort: {
          title: '优先级',
          type: 'number',
          description: '当前支付方式，在确认下单页面的展示顺序，数字越大越靠前',
          config: {
            placeholder: '选填，默认 0'
          }
        },
        active: {
          title: '启用',
          type: 'boolean',
          config: {
            numberMode: true
          }
        }
      }
    },
    onChange: (data) => {
      state.value = data
    },
    onOk: () => {
      options?.onChange(state.value)
    }
  })
}

const PaymentAccountSelector = defineComponent({
  props: {
    ...CommonWidgetPropsDefine,
    payScene: {
      type: Number as PropType<PaymentScene>,
      required: true
    }
  },
  setup(props) {
    const state = ref<PayMethodRule['receivingAccount']>(props.value)

    const paymentChannels = computed<PaymentChannel[]>(() => {
      const payMethod = props.rootValue?.payMethod
      const payScene = props.payScene

      return PAYMENT_CHANNEL_OPTIONS.filter((item) => {
        return item.capabilities.some((i) => i.subPaymentMethod === payMethod && i.payScene === payScene)
      })
    })

    const onSelect = () => {
      usePaymentAccountSelector({
        // selectableChannels: paymentChannels.value.map((item) => item.value),
        targetPayMethod: props.rootValue?.payMethod,
        callback: (item) => {
          state.value = {
            id: item.id,
            mchName: item.mchName,
            mchId: item.mchId,
            accountName: item.accountName,
            payChannel: item.payChannel
          }
          props.onChange(state.value)
        }
      })
    }

    const Channels = () => {
      if (props.rootValue?.payMethod === undefined)
        return (
          <div class="color-disabled">
            <Icon name="info" />
            &nbsp;请先选择支付方式
          </div>
        )

      if (props.rootValue?.payMethod === SubPaymentMethod.Cash) {
        return <div class="color-disabled">现金无需选择支付渠道</div>
      }

      if (paymentChannels.value.length === 0) {
        return (
          <div class="color-error">
            <Icon name="error" />
            &nbsp;暂无支持的支付渠道，请选择其他支付方式
          </div>
        )
      }

      return (
        <>
          <div class="color-disabled" style="margin-top:12px;font-size:13px;">
            支持以下支付渠道：
          </div>
          <div class="selectable-payment-channels">
            {paymentChannels.value.map((item) => {
              return (
                <div class="item">
                  <img src={item.icon} alt={item.label} />
                  {item.label}
                </div>
              )
            })}
          </div>
        </>
      )
    }

    return () => {
      return (
        <div>
          {paymentChannels.value.length > 0 && (
            <Select
              value={state.value?.accountName}
              placeholder="请选择收款账户"
              onClick={() => {
                onSelect()
              }}
              dropdownRender={() => null}
              dropdownStyle={{ display: 'none' }}
              style="width:100%"
            />
          )}
          <Channels />
        </div>
      )
    }
  }
})
