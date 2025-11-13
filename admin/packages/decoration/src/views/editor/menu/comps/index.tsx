import { computed, defineComponent, ref } from 'vue'
import Item from './item'
import './style.scss'
import './style.dark.scss'
import useComponentStore from '../../../../stores/component'
import { storeToRefs } from 'pinia'
import useCanvasStore from '../../../../stores/canvas'
import { SCOPE_CUSTOM } from '../../../../constants'

export default defineComponent({
  name: 'DeckEditorMenuComps',
  props: {
    asSelector: {
      type: Boolean,
      default: false
    }
  },
  emits: {
    select: (manifest: any) => true
  },
  setup(props, { emit }) {
    const componentStore = useComponentStore()
    const { componentList } = storeToRefs(componentStore)
    const canvasStore = useCanvasStore()

    const typeRef = ref<'common' | 'content' | 'scope'>('common')
    const listMap = computed(() => {
      return {
        common: componentList.value.filter((item) => item.type === 'common'),
        content: componentList.value.filter((item) => item.type === 'content'),
        scope: componentList.value.filter((item) => item.type === 'scope')
      }
    })

    const onSelect = (manifest: any) => {
      emit('select', manifest)
    }

    return () => {
      return (
        <div class="drag-comps__panel">
          {/* <div class="drag-comps__header">
            <strong>组件列表</strong>
          </div> */}
          <div class="drag-comps__type" data-type={typeRef.value}>
            <div class="drag-comps__type-item clickable" onClick={() => (typeRef.value = 'common')}>
              通用组件
            </div>
            <div
              class="drag-comps__type-item clickable"
              onClick={() => (typeRef.value = 'content')}
            >
              业务组件
            </div>
            {canvasStore.scope !== SCOPE_CUSTOM && (
              <div
                class="drag-comps__type-item clickable"
                onClick={() => (typeRef.value = 'scope')}
              >
                专属组件
              </div>
            )}
          </div>
          {typeRef.value === 'scope' && (
            <strong style="padding:2px 13px;font-size:12px;" class="color-disabled">
              暂未限制专属组件使用范围，请在适用场景下合理使用。
            </strong>
          )}
          <div class="drag-comps__list scroller" key={typeRef.value}>
            {listMap.value[typeRef.value].map((item) => {
              if (item.implicit) return null
              return (
                <Item
                  asSelector={props.asSelector}
                  manifest={item}
                  onSelect={() => {
                    onSelect(item)
                  }}
                />
              )
            })}
          </div>
          {!props.asSelector && (
            <div id="deck-out-screen-drag-tip" draggable={true}>
              <div>拖动到画布／图层上释放以添加组件</div>
            </div>
          )}
        </div>
      )
    }
  }
})
