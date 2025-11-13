import { type InputHTMLAttributes, computed, defineComponent, reactive, ref, watch } from 'vue'
import './style.scss'
import { Input, InputNumber } from '@anteng/ui'
import { hex2Rgb, formatHex, type Rgb, validateHexColor, getRGBA } from './utils'
import { useColorModal } from '../../../../components/color'
import { CommonWidgetPropsDefine } from '../../../../types/widget'

export default defineComponent({
  name: 'ColorWidget',
  props: CommonWidgetPropsDefine,
  setup(props) {
    const alphaRef = ref()
    const inputFocused = ref(false)
    const thumbnailFocused = ref(false)

    const uiDefault = props.schema.default

    const defaultColorDefine = uiDefault || '#ffffff'

    if (!props.value && uiDefault) {
      props.onChange(defaultColorDefine)
    }

    const defaultColor = (props.value || defaultColorDefine) as string
    const defaultAlpha = getRGBA((props.value as string) || defaultColorDefine)
      ? (getRGBA((props.value as string) || defaultColorDefine)?.a ?? 1) * 100
      : 100
    const initialColor = formatHex(
      (props.value as string) || (props.schema.default as string) || defaultColorDefine,
      defaultColor
    )

    const state = reactive({
      tempColor: initialColor,
      color: initialColor,
      alpha: defaultAlpha,
      rgb: hex2Rgb(initialColor) as Rgb
    })

    watch(
      () => props.value,
      () => {
        const defaultColor = (props.value || defaultColorDefine) as string
        const defaultAlpha = getRGBA((props.value as string) || defaultColorDefine)
          ? (getRGBA((props.value as string) || defaultColorDefine)?.a ?? 1) * 100
          : 100
        const initialColor = formatHex(
          (props.value as string) || (props.schema.default as string) || defaultColorDefine,
          defaultColor
        )

        if (state.color !== initialColor) {
          state.color = state.tempColor = initialColor
          state.alpha = defaultAlpha
          state.rgb = hex2Rgb(initialColor) as Rgb
        }
      }
    )

    const handleFocus = () => {
      inputFocused.value = true
    }
    const handleBlur = () => {
      state.color = formatHex(state.tempColor) || state.color || defaultColor
      state.tempColor = state.color
      inputFocused.value = false
      state.rgb = hex2Rgb(state.color)
      state.alpha = state.alpha ?? 100
    }
    const formatedHex = computed(() => {
      return formatHex(state.tempColor, state.color)
    })

    watch(state, () => {
      if (validateHexColor(state.tempColor)) {
        const rgba = `rgba(${hex2Rgb(state.tempColor).join(', ')}, ${state.alpha / 100})`
        props.onChange(rgba)
      }
    })

    const showColorModal = () => {
      useColorModal({
        rgba: [...state.rgb, state.alpha / 100],
        onChange: (v) => {
          state.rgb = v.rgba.slice(0, 3) as Rgb
          state.tempColor = v.hex
          state.color = v.hex
          state.alpha = v.rgba[3] * 100
        },
        onClose: () => {
          thumbnailFocused.value = false
        }
      })
      setTimeout(() => {
        thumbnailFocused.value = true
      })
    }

    return () => {
      return (
        <div class={['jsf-widget-color']}>
          <div
            class={['color__thumbnail-wrap clickable', thumbnailFocused.value && '--focus']}
            onClick={showColorModal}
          >
            <div class="color__thumbnail">
              <div
                class="color__real"
                style={`background: ${formatedHex.value}; opacity: ${state.alpha ?? 100}%;`}
              ></div>
              <div class="color__origin" style={`background: ${formatedHex.value}`}></div>
            </div>
          </div>
          <div class={['jsf-widget-color__input', inputFocused.value && '--focus']}>
            <strong>#&nbsp;</strong>
            {/* <span>#</span> */}
            <Input
              class="color__hex"
              type="text"
              bordered={false}
              maxlength={6}
              value={state.tempColor.replace(/^#/, '')}
              onInput={(e) => (state.tempColor = '#' + (e.target as InputHTMLAttributes).value)}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
            <InputNumber
              ref={alphaRef}
              class="color__alpha"
              type="number"
              value={state.alpha}
              onChange={(v) => (state.alpha = v as number)}
              precision={0}
              min={0}
              max={100}
              onFocus={handleFocus}
              onBlur={handleBlur}
              controls={false}
              bordered={false}
            />
            <i
              class="color__percent --flex-center cursor-resize-0"
              onClick={() => {
                alphaRef.value.focus()
              }}
            >
              %
            </i>
          </div>
        </div>
      )
    }
  }
})
