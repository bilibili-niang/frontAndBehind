import { defineComponent } from 'vue'

definePageConfig({
  enableShareAppMessage: true,
  navigationStyle: 'custom',
  disableScroll: true
})

export default defineComponent({
  name: 'componentName',
  props: {},
  emits: [''],
  setup(props, { emit }) {
    return () => {
      return (
        <div class="test">
          开发测试中...
          <button
            open-type="getRealtimePhoneNumber"
            bindgetrealtimephonenumber="getrealtimephonenumber"
            onGetrealtimephonenumber={e => {
              console.log('e')
              console.log(e)
            }}
          >
            获取看看
          </button>
        </div>
      )
    }
  }
})
