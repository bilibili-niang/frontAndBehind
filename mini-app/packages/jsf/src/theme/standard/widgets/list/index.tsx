import { defineComponent, ref, watch, type PropType } from 'vue'
import { CommonWidgetPropsDefine } from '../../../../types/widget'

import './style.scss'
import { Button, Icon, Tabs } from '@anteng/ui'
import { useArrayField } from '../../../../utils/field'
import { getWidgetConfig, useInjectInlineEnable } from '../../../../utils/widget'

export default defineComponent({
  name: 'sw_list',
  props: {
    ...CommonWidgetPropsDefine
  },
  setup(props) {
    const { isTuple, CommonArrayFieldContent, onAdd, onCopy, onRemove, onUp, onDown } = useArrayField(props)

    const currentIndex = ref(0)
    const direction = ref<'horizontal' | 'vertical'>('horizontal')

    const InlineEnable = useInjectInlineEnable(props)

    const visible = ref(InlineEnable.value.value ?? true)

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
        <div class="sw_list jsf_form-item">
          <div class="jsf_form-item__label">{props.schema.title}</div>
          <div class="sw_list__list jsf_form-item__widget">
            {CommonArrayFieldContent.value.map((item, index) => {
              return (
                <div class="sw_list__item">
                  <div class="sw_list__index number-font">{index + 1}. </div>
                  {item}
                  <Icon
                    name="close"
                    class="sw_list__remove clickable"
                    onClick={() => {
                      const v = props.value
                      v.splice(index, 1)
                      props.onChange(v)
                    }}
                  />
                </div>
              )
            })}
          </div>
          <Button class="sw_list__add" onClick={onAdd}>
            {props.config?.addButtonText ?? '添加'}
          </Button>
        </div>
      )
    }
  }
})
