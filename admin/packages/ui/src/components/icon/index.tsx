import { PREFIX_CLS } from '@pkg/config'
import { defineComponent, type HTMLAttributes, type PropType } from 'vue'
import './icon.js'
import './style.scss'

export type IconNames =
  | (string & {})
  | 'folder-arrow'
  | 'arrow-up'
  | 'arrow-down'
  | 'close'
  | 'add'
  | 'horizontal'
  | 'vertical'
  | 'copy'
  | 'visible'
  | 'border-radius-all'
  | 'border-radius'
  | 'hidden'
  | 'lock'
  | 'unlock'
  | 'right'
  | 'right-one'
  | 'sort-fill'
  | 'dropper'
  | 'zoom-in'
  | 'zoom-out'
  | 'rotate'
  | 'one-to-one'
  | 'auto-width'
  | 'delete'
  | 'preview'
  | 'image-add'
  | 'tag-delete'
  | 'error-fill'
  | 'warn-fill'
  | 'down'
  | 'search'
  | 'error-bold'
  | 'ok-bold'
  | 'settings'
  | 'download'
  | 'left'
  | 'click'
  | 'helper-fill'
  | 'task-fill'
  | 'settings-fill'
  | 'bell-fill'
  | 'check-small'

export default defineComponent({
  functional: true,
  props: {
    name: {
      type: String as PropType<IconNames>
    },
    onClick: {
      type: Function as PropType<HTMLAttributes['onClick']>
    },
    prefix: {
      type: String,
      default: 'icon'
    }
  },
  setup(props) {
    return () => {
      return (
        <div onClick={props.onClick} class={`${PREFIX_CLS}-icon icon ${props.prefix}-${props.name}`}>
          <svg aria-hidden="true">
            <use xlinkHref={`#${props.prefix}-${props.name}`}></use>
          </svg>
        </div>
      )
    }
  }
})
