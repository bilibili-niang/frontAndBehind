import { computed, reactive, ref, watch } from 'vue'
import { defineComponent } from 'vue'
import { Icon, Input, InputNumber, message } from '@anteng/ui'
import { hsv2rgb, rgb2hsv, rgb2hex, hex2rgb } from './utils'
import type { RGB, RGBA, HSV } from './utils'

export interface ColorModalCfg {
  rgba: RGBA
  onChange?: (v: { hex: string; rgba: RGBA; hsv: HSV }) => void
  onClose?: () => void
}
export enum ColorModes {
  hex = 'hex',
  rgba = 'rgba',
  hsv = 'hsv'
}
const modes = [ColorModes.rgba, ColorModes.hex, ColorModes.hsv]

// FIXME rgb <-> hsv 计算存在小数点偏差

export default defineComponent({
  name: 'ColorModal',
  setup(props, { expose }) {
    const state = reactive({
      visible: false,
      onChange: (v: { hex: string; rgba: RGBA; hsv: HSV }) => {},
      onClose: () => {},
      originRgba: [0, 0, 0, 1] as RGBA,
      mode: 0
    })

    const color = reactive({
      h: 0, // 色相
      s: 0, // 饱和度
      v: 0, // 明度
      r: 0, // 红色通道
      g: 0, // 绿色通道
      b: 0, // 蓝色通道
      a: 1 // 不透明度
    })

    const mode = computed(() => modes[state.mode])
    const handleToggleMode = () => {
      state.mode = (state.mode + 1) % modes.length
    }

    const sv = ref<HTMLElement>()
    const slider = ref<HTMLElement>()

    const rgba = computed(() => {
      return [color.r, color.g, color.b, color.a] as RGBA
    })
    const rgb = computed(() => rgba.value.slice(0, 3) as RGB)
    const hsv = computed(() => {
      return [color.h, color.s, color.v] as HSV
    })
    const hex = computed(() => {
      return rgb2hex(rgb.value, true)
    })
    const rgbBase = computed(() => {
      return hsv2rgb([color.h, 100, 100])
    })

    const favColors = ref<RGBA[]>([
      [0, 0, 0, 1],
      [255, 255, 255, 1]
    ])
    const favColorStyles = computed(() => {
      return favColors.value.map((i) => {
        return `background: rgba(${i.join(',')})`
      })
    })

    // 颜色发生变化，回调传值
    watch(rgb, () => {
      state.onChange({
        hex: hex.value,
        rgba: rgba.value,
        hsv: hsv.value
      })
    })

    const calcHsvByRgb = () => {
      ;[color.h, color.s, color.v] = rgb2hsv(rgb.value)
    }
    const calcRgbByHsv = () => {
      ;[color.r, color.g, color.b] = hsv2rgb(hsv.value)
    }

    // 设置rgb，重新计算hsv
    const setRgb = (rgb: RGB) => {
      ;[color.r, color.g, color.b] = rgb
      calcHsvByRgb()
    }

    // 设置hsv，重新计算rgb
    const setHsv = (hsv: HSV) => {
      ;[color.h, color.s, color.v] = hsv
      calcRgbByHsv()
    }

    const originColorStyle = computed(() => {
      return `background: rgba(${state.originRgba.join(',')});`
    })
    const baseColorStyle = computed(() => {
      return `background: rgb(${rgbBase.value.join(',')});`
    })
    const realColorStyle = computed(() => {
      return `background: rgb(${rgb.value.join(',')});`
    })
    const hueHandlerStyle = computed(() => {
      const a = hsv.value[0] / 3.6 // 3.6 = 360 / 100
      return `
        left: ${a}%;
        transform: translate3d(-${a}%, 0, 0);
      `
    })
    const alphaHandlerStyle = computed(() => {
      const a = color.a * 100
      return `
        left: ${a}%;
        transform: translate3d(-${a}%, 0, 0);
      `
    })
    const svHandlerStyle = computed(() => {
      return `
        left: ${color.s}%;
        bottom: ${color.v}%;
      `
    })
    const alphaGradientStyle = computed(() => {
      return `
        background-image: linear-gradient(90deg, transparent, rgb(${rgb.value.join(',')}));
      `
    })

    // 显示
    const show = (cfg: ColorModalCfg) => {
      state.onClose()
      resetHandler(cfg)
      state.visible = true
      //TODO 校验 + 格式化
      state.originRgba = cfg.rgba
      setRgb(cfg.rgba.slice(0, 3) as RGB)
      color.a = cfg.rgba[3]
    }

    // 关闭
    const close = () => {
      state.visible = false
      state.onClose()
      resetHandler()
    }

    // 重置回调
    const resetHandler = (cfg?: ColorModalCfg) => {
      state.onChange = cfg?.onChange || ((v) => {})
      state.onClose = cfg?.onClose || (() => {})
    }

    // 拾色
    const dropping = ref(false)
    const handleDropper = () => {
      if (!(window as any).EyeDropper) {
        message.error(
          window.isSecureContext
            ? '您的浏览器不支持拾色器，请更新浏览器后再次尝试，\n推荐使用 Chrome/Edge 95 以上版本。'
            : '抱歉，非<https>协议不支持使用拾色器。'
        )
        return false
      }
      const dropper = new (window as any).EyeDropper()
      dropper
        .open()
        .then((res: any) => {
          dropping.value = false
          setRgb(hex2rgb(res.sRGBHex as string))
        })
        .catch(() => {
          dropping.value = false
        })
      dropping.value = true
    }

    expose({
      show,
      close
    })

    /**
     * 鼠标按下滑动条
     * @param coefficient - 区间系数
     */
    const handleSlide = (e: MouseEvent, coefficient: number, callback: (v: number) => void) => {
      const sliderRect = slider.value!.getBoundingClientRect()!
      // 注意，这里是在 <滑动条宽度> 等于容器宽度的情况下
      const { left, width } = sliderRect
      const startX = e.pageX
      const startValue = ((e.pageX - left) / width) * coefficient
      const format = (v: number) => {
        return Math.round((v > 0 ? (v < coefficient ? v : coefficient) : 0) * 100) / 100
      }

      // 按下立刻跟随鼠标
      callback(format(startValue))

      const changing = (e: MouseEvent) => {
        e.preventDefault()
        const offset = e.pageX - startX
        const delta = (offset / width) * coefficient
        const v = startValue + delta
        callback(format(v))
      }
      const end = () => {
        document.removeEventListener('mousemove', changing, true)
        document.removeEventListener('mouseup', end, true)
      }

      document.addEventListener('mousemove', changing, true)
      document.addEventListener('mouseup', end, true)
    }

    // 调整 <色相>
    const handleHueSlideStart = (e: MouseEvent) => {
      // 防止选中文本
      e.preventDefault()

      handleSlide(e, 360, (h) => {
        setHsv([h, color.s, color.v])
      })
    }

    // 调整 <不透明度>
    const handleAlphaSlideStart = (e: MouseEvent) => {
      // 防止选中文本
      e.preventDefault()

      handleSlide(e, 1, (v) => {
        color.a = v
      })
    }

    // 调整 <饱和度&明度>
    const handleSvSlideStart = (e: MouseEvent) => {
      // 防止选中文本
      e.preventDefault()

      const svRect = sv.value!.getBoundingClientRect()!
      const { left, top, width, height } = svRect
      const startX = e.pageX - left
      const startY = e.pageY - top

      const format = (v: number) => {
        return Math.round(v > 0 ? (v < 100 ? v : 100) : 0)
      }

      const startS = format((startX / width) * 100)
      const startV = format(100 - (startY / height) * 100)
      setHsv([color.h, startS, startV])

      const changing = (e: MouseEvent) => {
        const x = e.pageX - left
        const y = e.pageY - top
        const s = format((x / width) * 100)
        const v = format(100 - (y / height) * 100)
        setHsv([color.h, s, v])
      }
      const end = () => {
        document.removeEventListener('mousemove', changing, true)
        document.removeEventListener('mouseup', end, true)
      }

      document.addEventListener('mousemove', changing, true)
      document.addEventListener('mouseup', end, true)
    }

    // 还原到最初的颜色
    const retrieveOriginColor = () => {
      color.a = state.originRgba[3]
      setRgb(state.originRgba.slice(0, 3) as RGB)
    }

    // 选取颜色
    const useColor = (rgba: RGBA) => {
      setRgb(rgba.slice(0, 3) as RGB)
      color.a = rgba[3]
    }

    return () => {
      const Value =
        mode.value === ColorModes.hex ? (
          <Input prefix="hex" value={hex.value} />
        ) : mode.value === ColorModes.rgba ? (
          <div class="color__rgba-input">
            <InputNumber placeholder="R" min={0} max={255} bordered={false} controls={false} value={color.r} />
            <InputNumber placeholder="G" min={0} max={255} bordered={false} controls={false} value={color.g} />
            <InputNumber placeholder="B" min={0} max={255} bordered={false} controls={false} value={color.b} />
            <InputNumber
              placeholder="A"
              min={0}
              max={255}
              bordered={false}
              controls={false}
              value={Math.round(color.a * 100)}
            />
            <strong class="color__alpha-percent">%</strong>
          </div>
        ) : mode.value === ColorModes.hsv ? (
          <div class="color__rgba-input">
            <InputNumber placeholder="H" min={0} max={360} bordered={false} controls={false} value={color.h} />
            <InputNumber placeholder="S" min={0} max={100} bordered={false} controls={false} value={color.s} />
            <InputNumber placeholder="V" min={0} max={100} bordered={false} controls={false} value={color.v} />
            <InputNumber
              placeholder="A"
              min={0}
              max={255}
              bordered={false}
              controls={false}
              value={Math.round(color.a * 100)}
            />
            <strong class="color__alpha-percent">%</strong>
          </div>
        ) : (
          <Input value="hex" />
        )

      return (
        <div class="jsf-ui-color-modal">
          <div class="saturation-wrapper" onMousedown={handleSvSlideStart}>
            <div class="saturation" ref={sv} style={baseColorStyle.value}>
              <div class="saturation-light"></div>
              <div class="saturation-dark"></div>
              <div class="saturation-pointer-range-wrapper">
                <div class="saturation-pointer" style={svHandlerStyle.value}></div>
              </div>
            </div>
          </div>
          <div class="color__tools">
            <div class="color__block">
              <div class="color__current-color" style={realColorStyle.value}></div>
              <div class="color__origin clickable" title="还原初始颜色" onClick={retrieveOriginColor}>
                <div class="color__origin-color" style={originColorStyle.value}></div>
              </div>
            </div>
            <div class="color__slider" ref={slider}>
              <div class="color__hue cursor-move--active" onMousedown={handleHueSlideStart}>
                <div class="color__handler" style={[hueHandlerStyle.value, baseColorStyle.value]}></div>
              </div>
              <div class="color__alpha cursor-move--active" onMousedown={handleAlphaSlideStart}>
                <div class="color__alpha-gradient" style={alphaGradientStyle.value}></div>
                <div class="color__handler" style={alphaHandlerStyle.value}></div>
              </div>
            </div>
          </div>
          <div class="color__value">
            <div class="color__input">{Value}</div>
            <span class="color__toggler clickable" onClick={handleToggleMode}>
              <Icon name="sort-fill" />
            </span>
            <span class={['color__dropper clickable', dropping.value && '--active']} onClick={handleDropper}>
              <Icon name="dropper" />
            </span>
          </div>
          <div class="color__fav-list">
            {favColors.value.map((rgba, index) => (
              <div
                class="color__fav-item clickable"
                style={favColorStyles.value[index]}
                onClick={() => useColor(rgba)}
              ></div>
            ))}
          </div>
          {/* <div style="margin-top: 4px;">{rgba.value.join(', ')}</div>
          <div style="margin-top: 4px;">{hsv.value.join(', ')}</div>
          <div style="margin-top: 4px;">{hex.value}</div>
          <div class="color__preview-wrapper">
            <input type="color" name="" id="" />
          </div> */}
        </div>
      )
    }
  }
})
