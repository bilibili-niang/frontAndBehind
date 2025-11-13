import { computed, defineComponent, reactive, ref, type PropType } from 'vue'
import './style.scss'
import { Icon, InputNumber, Slider, Tooltip } from '@anteng/ui'

export default defineComponent({
  name: 'BasicAttrs',
  props: {
    state: {
      type: Object as PropType<{
        x: number
        y: number
        width: number
        height: number
        rotate: number
        sizeLock: boolean
        flipH: boolean
        flipV: boolean
        opacity: number
      }>,
      required: true
    }
  },
  setup(props) {
    const el = ref()
    const onChange: any = (e: any) => {
      Object.assign(props.state, e)
    }

    const rotationStyle = computed(() => {
      return `transform: rotate(${props.state.rotate}deg)`
    })
    let originX = 0,
      originY = 0
    const handleRotateStart = (e: MouseEvent) => {
      const rect = (e.target as HTMLElement).getBoundingClientRect()
      originX = rect.x + rect.width / 2
      originY = rect.y + rect.height / 2
      // 手动触发一次，立刻旋转到该角度
      handleRotating(e)
      document.documentElement.addEventListener('mousemove', handleRotating, true)
      document.documentElement.addEventListener('mouseup', handleRotateEnd, true)
    }
    const handleRotating = (e: MouseEvent) => {
      const x = e.pageX - originX
      const y = e.pageY - originY
      const deg = Math.round((Math.atan2(y, x) * 180) / Math.PI) + 90
      onChange({
        rotate: deg > 0 ? deg : deg + 360
      })
    }
    const handleRotateEnd = (e: MouseEvent) => {
      document.documentElement.removeEventListener('mousemove', handleRotating, true)
      document.documentElement.removeEventListener('mouseup', handleRotateEnd, true)
    }
    return () => {
      const attrs = props.state

      return (
        <div class="jsf-ui config-basic-attrs" ref={el}>
          <div class="jsf_form-item">
            {/* <div class="jsf_form-item-prefix"></div> */}
            <i class="jsf_form-item__prefix"></i>
            <div class="jsf_form-item__label ellipsis">尺寸</div>
            <Tooltip title={attrs.sizeLock ? '已锁定比例' : '点击锁定比例'} getPopupContainer={() => el.value}>
              <Icon
                class={['size-lock clickable', attrs.sizeLock && '--active']}
                name={attrs.sizeLock ? 'lock' : 'unlock'}
                onClick={() => (attrs.sizeLock = !attrs.sizeLock)}
              />
            </Tooltip>

            <div class="jsf_form-item__widget">
              <div class="w_suite">
                <div class="w_suite-item jsf-ui-grid-col-12">
                  <div class="jsf_form-item--pure">
                    <InputNumber
                      class="w_number"
                      style="width:100%"
                      prefix={<span class="prefix">宽</span>}
                      value={Math.round(attrs.width)}
                      onChange={(v: any) => {
                        onChange({ width: v })
                      }}
                    />
                  </div>
                </div>
                <div class="w_suite-item jsf-ui-grid-col-12">
                  <div class="jsf_form-item--pure">
                    <InputNumber
                      class="w_number"
                      style="width:100%"
                      prefix={<span class="prefix">高</span>}
                      value={Math.round(attrs.height)}
                      onChange={(v: any) => {
                        onChange({ height: v })
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="jsf_form-item">
            {/* <div class="jsf_form-item-prefix"></div> */}
            <i class="jsf_form-item__prefix"></i>
            <div class="jsf_form-item__label ellipsis">起始位置</div>
            <div class="jsf_form-item__widget">
              <div class="w_suite">
                <div class="w_suite-item jsf-ui-grid-col-12">
                  <div class="jsf_form-item--pure">
                    <InputNumber
                      class="w_number"
                      style="width:100%"
                      prefix={<span class="prefix">X</span>}
                      value={Math.round(attrs.x)}
                      onChange={(v: any) => {
                        onChange({ x: v })
                      }}
                    />
                  </div>
                </div>
                <div class="w_suite-item jsf-ui-grid-col-12">
                  <div class="jsf_form-item--pure">
                    <InputNumber
                      class="w_number"
                      style="width:100%"
                      prefix={<span class="prefix">Y</span>}
                      value={Math.round(attrs.y)}
                      onChange={(v: any) => {
                        onChange({ y: v })
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="jsf_form-item">
            {/* <div class="jsf_form-item-prefix"></div> */}
            <i class="jsf_form-item__prefix"></i>
            <div class="jsf_form-item__label ellipsis">旋转角度</div>
            <div class="jsf_form-item__widget">
              <div class="w_suite">
                <div class="w_suite-item jsf-ui-grid-col-12">
                  <div class="jsf_form-item--pure">
                    <InputNumber
                      class="w_number"
                      style="width:100%"
                      prefix={
                        <span class="prefix">
                          <iconpark-icon style="transform:translate3d(-0.5px, 0, 0);" name="rotate"></iconpark-icon>
                        </span>
                      }
                      value={Math.round(attrs.rotate)}
                      onBlur={() => {
                        onChange({
                          rotate: (attrs.rotate + 720) % 360
                        })
                      }}
                      onChange={(v: any) => {
                        onChange({ rotate: v })
                      }}
                    />
                  </div>
                </div>
                <div class="w_suite-item jsf-ui-grid-col-12">
                  <div class="jsf-ui-component flip-wrap">
                    <div class="rotation-icon" style={rotationStyle.value} onMousedown={handleRotateStart}></div>
                    <Tooltip title="水平翻转" getPopupContainer={() => el.value}>
                      <iconpark-icon
                        class={['flip-h clickable', attrs.flipH && '--active']}
                        name="contrast-view"
                        onClick={() => (attrs.flipH = !attrs.flipH)}
                      ></iconpark-icon>
                    </Tooltip>
                    <Tooltip title="垂直翻转" getPopupContainer={() => el.value}>
                      <iconpark-icon
                        class={['flip-v clickable', attrs.flipV && '--active']}
                        name="contrast-view"
                        onClick={() => (attrs.flipV = !attrs.flipV)}
                      ></iconpark-icon>
                    </Tooltip>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  }
})
