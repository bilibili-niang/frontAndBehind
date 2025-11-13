import { computed, defineComponent, type PropType, reactive, ref } from 'vue'
import { Button, ConfigProvider, Input, message, Modal } from '@anteng/ui'
import { PREFIX_CLS } from '@anteng/config'
import './style.scss'
import './style.dark.scss'
import {
  businessActions,
  commonActions,
  interactionActions,
  linkActions,
  preConditionDefault,
  preConditionSchema
} from './actions'
import { type ObjectSchema, type Schema, SchemaForm } from '@anteng/jsf'
import { cloneDeep, defaultsDeep } from 'lodash'
import type { ActionDefine } from './utils'

/** 动作类型 */
export type ActionItem = {
  /** 标识符 */
  key: string
  /** 别名备注 */
  remark?: string
  /** 动作配置 */
  config?: Record<string, any> & {
    /** 前置条件 */
    __preConfition?: Record<string, any>
  }
}

export { defineAction } from './utils'
export { registerActions, registerPreCondition } from './actions'

// 一级菜单
const menus = computed(() => {
  return [
    { key: 'page', name: '通用页面', icon: 'iphone', actions: commonActions.value },
    { key: 'business', name: '业务相关', icon: 'shopping', actions: businessActions.value },
    { key: 'link', name: '跳转链接', icon: 'link-one', actions: linkActions.value },
    { key: 'interaction', name: '其他', icon: 'click', actions: interactionActions.value }
  ].map((item) => {
    return {
      ...item,
      actions: item.actions.map((action, index) => {
        return {
          ...action,
          index: index + 1
        }
      })
    }
  })
})

// 全部动作扁平化列表
const actions = computed(() =>
  ([] as (ActionDefine & { category: (typeof menus.value)[number] })[]).concat(
    ...menus.value.map((item) => item.actions.map((action) => ({ ...action, category: item })))
  )
)

/** 模拟执行动作 */
export const useAction = (action: ActionItem | undefined) => {
  if (!action?.key) {
    // message.info(`无动作`)
    return void 0
  }
  const targetAction = getActionDefine(action.key)
  if (!targetAction) {
    message.error(`找不到 action:${action.key} 定义`)
    throw new Error(`找不到 action:${action.key} 定义`)
  }
  if (targetAction?.handler) {
    targetAction.handler(action.config ?? {})
  } else {
    message.info(targetAction.title)
  }
}

/** 获取动作定义 */
export const getActionDefine = (key: string) => {
  return actions.value.find((item) => item.key === key)
}

export const ActionModal = defineComponent({
  name: 'ActionModal',
  props: {
    action: {
      type: String
    },
    config: {
      type: Object as PropType<Record<string, any>>
    },
    remark: {
      type: String
    }
  },
  emits: ['change'],
  setup(props, { emit }) {
    console.log(props)

    const menuKey = ref('page')
    const keywords = ref('')

    const actionKey = ref(props.action ?? '')
    const actionRef = computed(() => {
      return actions.value.find((item) => {
        return item.key === actionKey.value
      })
    })

    const schema = computed<Schema>(() => {
      console.log(actionRef.value)
      return {
        title: '',
        type: 'object',
        widget: 'menu',
        properties: {
          config: {
            title: '动作设置',
            type: 'object',
            properties: {
              ...((actionRef.value?.schema as ObjectSchema)?.properties ?? {
                __footer: {
                  type: 'string',
                  pure: true,
                  widget: () => {
                    return <div class="w_action-modal__configure-empty">该动作没有参数配置</div>
                  }
                }
              })
            } as any
          },
          preCondition: preConditionSchema
        }
      }
    })

    const remarkRef = ref()
    const remark = ref(props.remark ?? '')
    const isRemarkEditting = ref(false)
    const onEditRemark = (e: Event) => {
      isRemarkEditting.value = true
      e.preventDefault()
      e.stopPropagation()
      ;(e.target as any).select()
    }
    const onEditRemarkChange = (e: any) => {
      remark.value = e.target.value
    }
    const onEditRemarkEnd = () => {
      isRemarkEditting.value = false
    }

    const { __preCondition = undefined, ...restConfig } = props.config ?? {}
    const actionConfig = ref(defaultsDeep(restConfig, actionRef.value?.default) || {})
    const preCondition = ref(defaultsDeep(__preCondition, preConditionDefault))
    const cachedAction: Record<string, Record<string, any>> = {}

    const formState = reactive({
      config: actionConfig.value,
      preCondition: preCondition.value
    })

    // 默认选择菜单
    if (actionRef.value?.category) {
      menuKey.value = actionRef.value.category.key
    }

    const toggleAction = (key: string) => {
      // 缓存上次填写的内容，切换回来还原数据，仅当前弹窗有效，下次打开会清空。
      cachedAction[actionKey.value] = {
        config: actionConfig.value,
        preCondition: preCondition.value,
        remark: remark.value
      }

      actionKey.value = key
      actionConfig.value = cachedAction[key]?.config ?? cloneDeep(actionRef.value?.default) ?? {}
      preCondition.value = cachedAction[key]?.preCondition ?? cloneDeep(preConditionDefault) ?? {}

      formState.config = actionConfig.value
      formState.preCondition = preCondition.value

      remark.value = cachedAction[key]?.remark ?? ''
    }

    const handleConfirm = () => {
      if (!actionRef.value) {
        message.warning('请先选择一个事件动作。')
        return
      }
      // console.log('确定', actionKey.value, toRaw(actionConfig.value))
      const result = cloneDeep({
        key: actionKey.value,
        config: {
          ...formState.config,
          __preCondition: formState.preCondition
        },
        remark: remark.value
      })
      console.log(result)
      emit('change', result)
    }

    const showPreview = computed(() => {
      return !!actionRef.value?.preview
    })

    return () => {
      const remarkValue = isRemarkEditting.value ? remark.value : remark.value || actionRef.value?.title

      const Preview = actionRef.value?.preview!

      return (
        <div class={`${PREFIX_CLS}-action ${showPreview.value && 'show-preview'}`}>
          <div class={`${PREFIX_CLS}-action__menu`}>
            <div class={`${PREFIX_CLS}-action__title`}>事件动作</div>
            <div class="w_action__search">
              <Input
                placeholder="搜索名称"
                allowClear
                value={keywords.value}
                onChange={(e) => {
                  keywords.value = e.target.value!
                }}
              />
            </div>
            <div class={[`${PREFIX_CLS}-action__category`, 'scroller']}>
              {menus.value.map((item) => {
                return (
                  <div
                    class={[
                      'w_action__category-item',
                      menuKey.value === item.key && '--active',
                      keywords.value.length > 0 && '--filter'
                    ]}
                  >
                    <div
                      class="w_action__category-label clickable"
                      onClick={() => {
                        menuKey.value = menuKey.value === item.key ? '' : item.key
                      }}
                    >
                      <iconpark-icon name={item.icon}/>
                      <strong>{item.name}</strong>
                      <iconpark-icon class="arrow" name="down"></iconpark-icon>
                    </div>
                    {item.actions.map((item, index) => {
                      return (
                        <div
                          class={['w_action__action clickable', actionKey.value === item.key && '--active']}
                          key={item.key}
                          hidden={keywords.value.length > 0 && !item.title.includes(keywords.value)}
                          onClick={() => toggleAction(item.key)}
                        >
                          {index + 1}. {item.title}
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>
          <div class={`${PREFIX_CLS}-action__preview scroller`}>
            <div class={`${PREFIX_CLS}-action__device`}>
              {showPreview.value && <Preview config={formState.config ?? {}}/>}
            </div>
          </div>
          <div class={`${PREFIX_CLS}-action__content`}>
          <div class="w_action-modal__content">
              <div class="w_action-modal__configure">
                {actionRef.value && (
                  <div class="w_action-modal__configure-header">
                    <div
                      class="w_action-modal__remark-icon clickable"
                      title="别名"
                      onClick={() => {
                        remarkRef.value.focus?.()
                      }}
                    >
                      <iconpark-icon name="edit"></iconpark-icon>
                    </div>
                    <span>{remarkValue}</span>
                    <input
                      ref={remarkRef}
                      value={remarkValue}
                      placeholder={actionRef.value?.title}
                      onFocus={onEditRemark}
                      onBlur={onEditRemarkEnd}
                      onInput={onEditRemarkChange}
                    />
                  </div>
                )}

                <div class="w_action-modal__configure-content ui-scrollbar">
                  {actionKey.value ? (
                    <SchemaForm
                      theme="compact"
                      key={actionKey.value}
                      id={actionKey.value}
                      schema={schema.value}
                      value={formState}
                      onChange={(v) => {
                        Object.assign(formState, v)
                      }}
                    ></SchemaForm>
                  ) : (
                    <div class="w_action-modal__configure-empty">尚未选择动作</div>
                  )}
                </div>
              </div>
            </div>
            {actionKey.value && (
              <div class="w_action-modal__footer">
                <Button type="primary" onClick={handleConfirm}>
                  确定
                </Button>
              </div>
            )}
          </div>
        </div>
      )
    }
  }
})

export interface ActionModalOptions {
  key?: string
  config?: Record<string, any>
  remark?: string
  onChange?: (res: { key: string; config: Record<string, any>; remark: string }) => void
  onCancel?: () => void
  onError?: (error: Error) => void
}

export const useActionSelector = (options: ActionModalOptions = {}) => {
  const modal = Modal.open({
    content: (
      <ConfigProvider prefixCls={PREFIX_CLS}>
        <ActionModal
          action={options.key}
          remark={options.remark}
          config={options.config}
          onChange={(res) => {
            options.onChange?.(res)
            modal.destroy()
          }}
        />
      </ConfigProvider>
    ),
    centered: true,
    onCancel: () => {
      options.onCancel?.()
    }
  })
}

export default useAction

export { valueCardActions } from './actions/value-card'
