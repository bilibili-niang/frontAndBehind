// 文字省略
import './style.scss'
import { defineComponent, ref, computed } from 'vue'
import { Icon } from '@anteng/ui'

export default defineComponent({
  name: 'TextOmitted',
  props: {
    text: {
      type: String,
      default: ''
    },
    color: {
      type: String,
      default: '#000000'
    },
    fontSize: {
      type: String,
      default: '15px'
    },
    controllerTextStyle: {
      type: Object,
      default: () => ({})
    }
  },
  setup: function (props) {
    const showAll = ref(false)

    const textStyle = computed(() => {
      return {
        color: props.color,
        fontSize: props.fontSize
      }
    })

    return () => {
      if (props?.text) {
        return props.text.length <= 50 ? (
          <text decode class="content-text" style={textStyle.value}>
            {props.text}
          </text>
        ) : (
          <>
            {showAll.value && (
              <div class="collapse-text-container">
                <text decode class="content-text" style={textStyle.value}>
                  {props.text}
                </text>
                <div
                  class="controller-text"
                  style={props.controllerTextStyle}
                  onClick={() => {
                    showAll.value = !showAll.value
                  }}
                >
                  <Icon name="up" />
                </div>
              </div>
            )}
            {!showAll.value && (
              <div class="collapse-text-container">
                <text decode class="collapse content-text" style={textStyle.value}>
                  {props.text}
                </text>

                <div
                  class="controller-text"
                  style={props.controllerTextStyle}
                  onClick={() => {
                    showAll.value = !showAll.value
                  }}
                >
                  展开
                  <Icon name="down" />
                </div>
              </div>
            )}
          </>
        )
      } else {
        return ''
      }
    }
  }
})
