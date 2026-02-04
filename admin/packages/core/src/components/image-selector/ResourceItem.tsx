import { defineComponent, ref } from 'vue'
import useImagePreview from '../../hooks/useImagePreview'
import test from '../../utils/test'
import { Icon } from '@pkg/ui'
import { withImageResize } from '../../utils'

export default defineComponent({
  name: 'LegoResourceModal',
  props: {
    resource: {
      type: Object,
      required: true
    },
    checked: {
      type: Boolean,
      required: true
    }
  },
  emits: ['choose'],
  setup(props, { emit }) {
    const loaded = ref(false)
    const isVideo = test.video(props.resource.thumbnail)
    return () => {
      return (
        <div
          class={['lego-resource__item', loaded.value ? '--visible' : '--hidden', props.checked && '--checked']}
          key={props.resource.id}
        >
          {isVideo ? (
            <video src={props.resource.thumbnail} controls></video>
          ) : (
            <img
              src={withImageResize(props.resource.thumbnail, { w: 300, h: 300 })}
              alt=""
              onLoad={() => (loaded.value = true)}
            />
          )}
          <span class="lego-resource__name ellipsis">{props.resource.name}</span>
          <div class="lego-resource__layer">
            <div class="handler-button clickable" onClick={() => emit('choose')}>
              <Icon class="icon" name={props.checked ? 'close' : 'check-small'}></Icon>
              <span>{props.checked ? '取消选择' : '选择'}</span>
            </div>
            <div class="handler-button clickable" onClick={() => useImagePreview({ url: props.resource.url })}>
              <Icon class="icon" name="close"></Icon>
              <span>预览</span>
            </div>
          </div>
        </div>
      )
    }
  }
})
