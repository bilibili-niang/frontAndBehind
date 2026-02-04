import { defineComponent, ref, type PropType, computed, toRaw } from 'vue'
import './style.scss'
import { getActionDefine, type ActionItem, useActionSelector } from '../../hooks/useAction'
import { CommonWidgetPropsDefine } from '@pkg/jsf'

export const ActionWidget = defineComponent({
  name: 'w_action',
  props: {
    value: {
      type: Object as PropType<ActionItem>
    }
  },
  emits: ['change'],
  setup(props, { emit }) {
    const state = ref({
      key: props.value?.key ?? '',
      remark: props.value?.remark ?? '',
      config: props.value?.config ?? {}
    })

    const actionRef = computed(() => getActionDefine(state.value.key!))

    const handleSelectAction = () => {
      useActionSelector({
        key: state.value.key,
        remark: state.value.remark,
        config: state.value.config,
        onChange: (res) => {
          state.value = res
          emit('change', toRaw(state.value))
        }
      })
    }

    const onClear = (e: MouseEvent) => {
      e.stopPropagation()
      state.value = {
        key: '',
        remark: '',
        config: {}
      }
      emit('change', toRaw(state.value))
    }

    return () => {
      return (
        <div class="w_action clickable" onClick={handleSelectAction}>
          <div class="w_action__icon">
            <iconpark-icon
              // name={actionRef.value?.icon || actionRef.value?.category.icon || 'click'}
              name="click"
            ></iconpark-icon>
          </div>
          {state.value.key ? (
            <>
              <div class="w_action__title">{state.value.remark || actionRef.value?.title}</div>
              <div class="w_action__icon --checked">
                <iconpark-icon name="check-one"></iconpark-icon>
              </div>
              <div class="w_action__icon --remove" onClick={onClear}>
                <iconpark-icon name="error"></iconpark-icon>
              </div>
            </>
          ) : (
            <div class="w_action__placeholder">未配置事件动作~</div>
          )}
        </div>
      )
    }
  }
})

export default defineComponent({
  name: 'w_action',
  props: CommonWidgetPropsDefine,
  setup(props) {
    return () => <ActionWidget value={props.value as ActionItem} onChange={props.onChange} />
  }
})
