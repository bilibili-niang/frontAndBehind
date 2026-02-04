import { defineComponent, ref, watch } from 'vue'
import './style.scss'
import { CommonWidgetPropsDefine } from '../../../../types/widget'
import { test, useImageSelector } from '@pkg/core'
import { Button, message } from '@pkg/ui'

export default defineComponent({
  name: 'W_Audio',
  props: CommonWidgetPropsDefine,
  setup(props) {
    const url = ref(props.value)
    watch(
      () => props.value,
      () => {
        url.value = props.value
      }
    )
    return () => {
      return (
        <div class="w_audio">
          <div>
            <a
              onClick={() => {
                useImageSelector({
                  type: 'audio',
                  onSuccess: (audio) => {
                    if (!test.audio(audio.url)) {
                      message.error('非音频文件')
                      return void 0
                    }
                    url.value = audio.url
                    props.onChange(url.value)
                  }
                })
              }}
            >
              {url.value ? '替换音频' : '上传音频'}
            </a>
            &emsp;
            {url.value && (
              <a
                class="w_audio__remove"
                onClick={() => {
                  props.onChange(undefined)
                }}
              >
                删除
              </a>
            )}
          </div>
          {url.value && <audio src={url.value} controls />}
        </div>
      )
    }
  }
})
