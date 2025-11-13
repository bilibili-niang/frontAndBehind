import { computed, defineComponent, type PropType } from 'vue'
import './style.scss'
import { Button, message, Popover } from '@anteng/ui'
import type { ErrorSchema } from '@anteng/jsf'
import Icon from '../../../../../ui/src/components/icon'

export default defineComponent({
  name: 'SchemaFormErrors',
  props: {
    errorSchema: {
      type: Object as PropType<ErrorSchema>
    }
  },
  setup(props, { slots }) {
    const errors = computed(() => {
      // TODO 这里可能得排序一下
      return Object.values(props.errorSchema?.errorMap || {})
    })

    const onItemClick = (item: any) => {
      const el = document.querySelector(`[data-jsf-path="${item.path}"]`)

      if (el) {
        el.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'center'
        })
      } else {
        message.info('该字段无法自动聚焦')
      }
    }

    return () => {
      return (
        <Popover
          trigger="click"
          content={
            <div class="jsf_errors-popup ui-scrollbar">
              {errors.value.map((item, index) => {
                return (
                  <div class="jsf_errors-item clickable" onClick={() => onItemClick(item)}>
                    <div class="error-title">
                      {index + 1}. {item.schema.title}
                    </div>
                    <small class="error-path">{item.path}</small>
                    {item.errors.map((error) => {
                      return (
                        <div class={['error-message', error.status]}>
                          {error.status === 'warn' ? <Icon name="warn-fill" /> : <Icon name="error-fill" />}

                          {error.message}
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          }
        >
          <Button
            class={['jsf_errors-button clickable flex-center', errors.value.length == 0 && 'jsf_errors-button--hidden']}
          >
            存在<strong>{errors.value.length}</strong>处错误
            <Icon name="right-one" />
          </Button>
        </Popover>
      )
    }
  }
})
