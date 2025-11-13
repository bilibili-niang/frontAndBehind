import { computed, defineComponent, PropType } from 'vue'
import './style.scss'
import useCanvasStore from '../../../stores/canvas'
import BasicNaigator from '../../../canvas-components/components/navigator/basic'
import useEditorStore from '../../../stores/editor'
import { storeToRefs } from 'pinia'

import { default as manifest } from './manifest'
import { defaultsDeep } from 'lodash'

export { manifest }

export default defineComponent({
  name: 'P_Custom',
  props: {
    page: {
      type: Object as PropType<Record<string, any>>,
      required: true
    }
  },
  setup(props, { slots }) {
    const editorStore = useEditorStore()
    const { viewWidth, scale } = storeToRefs(editorStore)
    const canvasStore = useCanvasStore()
    const { page } = storeToRefs(canvasStore)

    const computedPage = computed(() => {
      return defaultsDeep(page.value, manifest.default)
    })

    const styleRef = computed(() => {
      const { backgroundEnable, background } = computedPage.value.basic
      return {
        width: `${viewWidth.value * scale.value}px`,
        background: backgroundEnable ? background : '',
        fontSize: `${16 * scale.value}px`,
        '--scale': editorStore.scale
      }
    })

    return () => {
      if (!page.value) return null
      return (
        <div class="p_custom" style={styleRef.value}>
          <BasicNaigator options={page.value.navigator} />
          {slots.default?.()}
        </div>
      )
    }
  }
})
