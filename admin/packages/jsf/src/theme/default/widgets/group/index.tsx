import { defineComponent, type PropType, ref, watch } from 'vue'
import { CommonWidgetPropsDefine } from '../../../../types/widget'
import Collapse from '../../../../components/collapse'
import './style.scss'

import { useObjectFiled } from '../../../../utils/field'
import { useInjectInlineEnable } from '../../../../utils/widget'
import { Popover } from '@pkg/ui'
import { useThemeContext } from '../../../index'
import { BUILT_IN_THEME_COMPACT } from '../../../../constants'

export default defineComponent({
  name: 'w_array',
  props: {
    ...CommonWidgetPropsDefine,
    config: {
      type: Object as PropType<{
        maxLength?: number
        itemDefault?: any
        defaultCollapsed?: boolean
      }>
    }
  },
  setup(props) {
    const { CommonObjectFieldContent } = useObjectFiled(props)

    const InlineEnable = useInjectInlineEnable(props)

    const visible = ref(InlineEnable.value.value ?? true)

    if (props.config?.defaultCollapsed) {
      visible.value = false
    }

    watch(
      () => InlineEnable.value?.value,
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

    const themeContext = useThemeContext()

    const isCompact = themeContext.value.name === BUILT_IN_THEME_COMPACT

    return () => {
      return (
        <div class="w_group">
          <Collapse
            disabled={InlineEnable.value && !InlineEnable.value.value}
            visible={visible.value}
            prefix={InlineEnable.value.widget}
            onClick={onCollapseClick}
            onChange={v => visible.value = v}
            title={
              isCompact && props.schema.description ? (
                <div>
                  <Popover
                    placement="bottomRight"
                    content={<div class="jsf_form-item__helper-popover">{props.schema.description}</div>}
                  >
                    <div class="jsf_form-item__label jsf_form-item__label--underline">
                      {props.title ?? props.schema.title}
                    </div>
                  </Popover>
                </div>
              ) : (
                props.schema.title
              )
            }
          >
            {!isCompact && props.schema.description && (
              <div class="jsf_form-item jsf_form-item__desc" style="margin-bottom: -12px;font-size:inherit;">
                {props.schema.description}
              </div>
            )}
            <div>{CommonObjectFieldContent.value}</div>
          </Collapse>
        </div>
      )
    }
  }
})
