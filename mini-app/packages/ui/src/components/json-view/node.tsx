import { computed, defineComponent, ref, watch } from 'vue'

import { getType, BOOLEAN, STRING, NUMBER, ARRAY, OBJECT, NULL } from './utils'
import Icon from '../icon'

const Node = defineComponent({
  name: 'JSONViewNode',
  props: {
    symbol: {},
    value: {},
    path: {
      type: String
    },
    deepth: {
      type: Number,
      required: true
    },
    defaultUnfold: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const type = computed(() => getType(props.value))

    const showFoldIcon = computed(() => type.value === OBJECT || type.value === ARRAY)

    const isSpread = ref(props.defaultUnfold)

    const handleDragStart = (e: DragEvent) => {
      e.dataTransfer?.setData('text', `{{ ${props.path} }}`)
    }

    const ValueNode = computed(() => {
      if (type.value === STRING) {
        return (
          <div class="--inline --string">
            <span class="jv__quote">"</span>
            {props.value}
            <span class="jv__quote">"</span>
          </div>
        )
      } else if (type.value === NUMBER) {
        return <div class="--inline --number">{props.value}</div>
      } else if (type.value === OBJECT || type.value === ARRAY) {
        return (
          isSpread.value && (
            <div class="jv__children">
              {Object.keys(props.value as any).map((key) => (
                <Node
                  symbol={key}
                  value={(props.value as any)[key]}
                  path={
                    // TODO 这里要考虑无法使用 . 链接的
                    type.value === OBJECT ? `${props.path}.${key}` : `${props.path}[${key}]`
                  }
                  deepth={props.deepth + 1}
                  defaultUnfold={props.defaultUnfold}
                />
              ))}
            </div>
          )
        )
      } else if (type.value === NULL) {
        return <div class="--inline --null">null</div>
      } else if (type.value === BOOLEAN) {
        return <div class="--inline --boolean">{String(props.value)}</div>
      }
      return <div class="--inline --unknown">unknown</div>
    })

    const onNodeClick = () => {
      if (Object.keys(props.value as any).length > 0) {
        isSpread.value = !isSpread.value
      }
    }

    const childrenLength = computed(() => Object.keys((props.value as any) ?? {}).length)

    watch(
      () => childrenLength.value,
      (length) => {
        if (length === 0) {
          isSpread.value = false
        }
      }
    )

    return () => {
      const isStack = type.value === OBJECT || type.value === ARRAY
      return (
        <div class={['jv__node', `type-${type.value}`]}>
          <div
            class={['jv__label', showFoldIcon.value && 'clickable']}
            style={{ top: `${props.deepth * 22}px`, 'z-index': 50 - props.deepth }}
            onClick={onNodeClick}
          >
            <i class={['jv__fold-icon', isSpread.value && '--active']}>
              {showFoldIcon.value && <Icon name="right-one" />}
            </i>
            {
              <span class="jv__key" draggable={true} onDragstart={handleDragStart}>
                {props.symbol}
              </span>
            }
            {isStack ? (
              <>
                <span class="jv__colon">:&nbsp;</span>
                <span class="jv__scope">{type.value === OBJECT ? '{' : '['}</span>
                {childrenLength.value > 0 && !isSpread.value && <small class="jv__ellipsis"> ... </small>}
                {!isSpread.value && (
                  <span class="jv__scope">
                    {type.value === OBJECT ? ' }' : ' ]'}
                    <span style="font-size: 12px;">
                      &nbsp;<span style="margin-right: 3px;">{childrenLength.value}</span>
                      {type.value === OBJECT ? 'keys' : 'items'}
                    </span>
                  </span>
                )}
              </>
            ) : (
              <span class="jv__colon">:&nbsp;</span>
            )}
          </div>
          {(isSpread.value || !isStack) && ValueNode.value}
          {isSpread.value && isStack && <span class="jv__scope">{type.value === OBJECT ? '}' : ']'}</span>}
          {isStack && <div class="jv__dash"></div>}
        </div>
      )
    }
  }
})

export default Node
