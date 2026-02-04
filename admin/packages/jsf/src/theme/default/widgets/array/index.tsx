import { computed, defineComponent, type PropType, ref, watch } from 'vue'
import { CommonWidgetPropsDefine } from '../../../../types/widget'
import Collapse from '../../../../components/collapse'
import './style.scss'
import { Empty, Icon, Popover, Tabs, Tooltip } from '@pkg/ui'
import { useArrayField } from '../../../../utils/field'
import { getWidgetConfig, useInjectInlineEnable } from '../../../../utils/widget'

export default defineComponent({
  name: 'w_group',
  props: {
    ...CommonWidgetPropsDefine,
    config: {
      type: Object as PropType<{
        defaultCollapsed?: boolean
      }>
    }
  },
  setup(props) {
    const { isTuple, CommonArrayFieldContent, onAdd, onCopy, onRemove, onUp, onDown } = useArrayField(props)

    const currentIndex = ref(0)

    const defaultDirection = getWidgetConfig(props.schema, 'defaultDirection') ?? 'horizontal'
    const direction = ref<'horizontal' | 'vertical'>(defaultDirection)

    const InlineEnable = useInjectInlineEnable(props)

    const visible = ref(InlineEnable.value.value ?? true)

    if (props.config?.defaultCollapsed) {
      visible.value = false
    }

    // 新增：根据 schema.config.enableAdd 控制是否显示“添加”按钮
    const enableAdd = computed(() => {
      const cfg = getWidgetConfig(props.schema, 'enableAdd')
      if (typeof cfg === 'function') {
        try {
          return !!cfg(props.rootValue, props.value, props as any)
        } catch (err) {
          return true
        }
      }
      return cfg !== false
    })

    watch(
      () => InlineEnable.value,
      () => {
        visible.value = InlineEnable.value.value ?? visible.value
      }
    )

    /** 当折叠面板点击时，如果内联 enable 为 false，则自动开启。 */
    const onCollapseClick = () => {
      if (InlineEnable.value.widget && !InlineEnable.value.value) {
        // TODO 优化 mutation 内联 enable value
        InlineEnable.value.widget.el.click()
      }
    }

    const withTabPane = (comp: any, index: number) => {
      return (
        <Tabs.TabPane key={index} tab={(getWidgetConfig(props.schema, 'itemTitle') ?? '子项') + String(index + 1)}>
          {comp}
        </Tabs.TabPane>
      )
    }

    return () => {
      return (
        <div class="w_array">
          <Collapse
            disabled={InlineEnable.value && !InlineEnable.value.value}
            visible={visible.value}
            prefix={InlineEnable.value.widget}
            onClick={onCollapseClick}
            title={
              <div class="w_array__label">
                {props.schema.description ? (
                  <Popover
                    placement="bottomRight"
                    content={<div class="jsf_form-item__helper-popover">{props.schema.description}</div>}
                  >
                    <div class="w_array__label-text w_array__label--underline">{props.title ?? props.schema.title}</div>
                  </Popover>
                ) : (
                  <div class="w_array__label-text">{props.title ?? props.schema.title}</div>
                )}

                <span>&nbsp;({props.value?.length ?? 0})</span>
                {/* &nbsp;<Badge size="small" count={props.value?.length ?? 0}></Badge> */}
              </div>
            }
            toolbar={
              isTuple.value ? null : (
                <div class="w_array-header">
                  {enableAdd.value && (
                    <Tooltip title="添加">
                      <button
                        class="w_array-tool clickable"
                        onClick={() => {
                          currentIndex.value = onAdd() ?? currentIndex.value
                        }}
                      >
                        <Icon name="add"/>
                      </button>
                    </Tooltip>
                  )}
                  <Tooltip title="复制选中项">
                    <button
                      class="w_array-tool clickable"
                      onClick={() => {
                        currentIndex.value = onCopy(currentIndex.value) ?? currentIndex.value
                      }}
                    >
                      <Icon name="copy"/>
                    </button>
                  </Tooltip>
                  <Tooltip title="删除选中项">
                    <button
                      class="w_array-tool clickable"
                      onClick={() => {
                        onRemove(currentIndex.value)
                        currentIndex.value = 0
                      }}
                    >
                      <Icon name="close"/>
                    </button>
                  </Tooltip>
                  <div style="opacity: 0.1">丨</div>
                  <Tooltip title="上移选中项">
                    <button
                      class="w_array-tool clickable"
                      onClick={() => {
                        currentIndex.value = onUp(currentIndex.value)
                      }}
                    >
                      <Icon name="arrow-up"/>
                    </button>
                  </Tooltip>
                  <Tooltip title="下移选中项">
                    <button
                      class="w_array-tool clickable"
                      onClick={() => {
                        currentIndex.value = onDown(currentIndex.value)
                      }}
                    >
                      <Icon name="arrow-down"/>
                    </button>
                  </Tooltip>
                  <Tooltip title={direction.value === 'horizontal' ? '横向展示' : '竖向展示'}>
                    <button
                      class="w_array-tool clickable"
                      onClick={() => {
                        direction.value = direction.value === 'horizontal' ? 'vertical' : 'horizontal'
                      }}
                    >
                      <Icon name={direction.value}/>
                    </button>
                  </Tooltip>
                </div>
              )
            }
          >
            {isTuple.value || direction.value === 'vertical' ? (
              CommonArrayFieldContent.value.map((item, index) => {
                return (
                  <div
                    class={['w_array__item-wrap', index === currentIndex.value && 'active']}
                    onClick={() => {
                      currentIndex.value = index
                    }}
                  >
                    {item}
                  </div>
                )
              })
            ) : (
              <div class="w_array-tabs">
                {CommonArrayFieldContent.value?.length > 0 && (
                  <Tabs
                    tabPosition="top"
                    activeKey={currentIndex.value}
                    onChange={(v) => {
                      currentIndex.value = v as number
                    }}
                  >
                    {CommonArrayFieldContent.value.map(withTabPane)}
                  </Tabs>
                )}
              </div>
            )}
            {CommonArrayFieldContent.value?.length === 0 && (
              <div style="transform: scale(0.8) translate3d(0, 10px, 0);">
                <Empty
                  description={
                    <>
                      无数据 <a
                      style={{
                        color: 'var(--color-4)'
                      }}
                      onClick={onAdd}>点击添加</a>
                    </>
                  }
                />
              </div>
            )}
          </Collapse>
        </div>
      )
    }
  }
})
