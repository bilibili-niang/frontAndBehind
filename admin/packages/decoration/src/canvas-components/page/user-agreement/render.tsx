import { PropType, computed, defineComponent, onBeforeUnmount, ref } from 'vue'
import './style.scss'
import BasicNavigator from '../../components/navigator/basic'
export { default as manifest } from './manifest'

export default defineComponent({
  name: 'P_User-Agreement',
  props: {
    page: {
      type: Object as PropType<Record<string, any>>,
      required: true
    }
  },
  setup(props, { slots }) {
    const list = computed<any[]>(() => {
      return (props.page?.list || []).filter((i) => i)
    })

    const type = computed(() => props.page?.type ?? 1)

    const current = ref(0)
    const currentContent = computed(() => {
      return list.value[current.value]?.content
    })
    return () => {
      if (!props.page) return null

      return (
        <div class="p_user-agreement">
          <BasicNavigator options={{ title: props.page.title || '' }} />
          {type.value === 1 ? (
            <>
              <div class="p_user-agreement__header scroller--hidden">
                <div class="p_user-agreement__header-content">
                  {list.value.map((item, index) => {
                    return (
                      <div
                        class={[
                          'p_user-agreement__header-item clickable',
                          index === current.value && 'active'
                        ]}
                        onClick={() => {
                          current.value = index
                        }}
                      >
                        《{item.title}》
                      </div>
                    )
                  })}
                </div>
              </div>
              <div class="p_user-agreement__content" v-html={currentContent.value}></div>
              {slots.default?.()}
            </>
          ) : (
            <iframe
              class="p_user-agreement__webview"
              src={props.page.link}
              frameborder="0"
            ></iframe>
          )}
        </div>
      )
    }
  }
})
