// 下载模板的按钮
import './index.scss'
import { defineComponent } from 'vue'
import { Icon, message } from '@pkg/ui'
import { downloadFile } from '@pkg/core'

/*
 * @param item: string 文件地址
 * @param placeholderText: string 提示文字
 * */
export default defineComponent({
  name: 'DownloadFileRender',
  props: {
    item: {
      type: String,
      default: () => ''
    },
    placeholderText: {
      type: String,
      default: '点击下载文件'
    }
  },
  emits: [''],
  setup(props) {
    const download = () => {
      downloadFile(props.item)
    }
    return () => {
      return (
        <div
          class="filer-render"
          title="点击下载文件"
          onClick={() => {
            if (!props.item) {
              message.error('没有目标文件')
              return void 0
            }
            download()
          }}
        >
          {props.placeholderText}
          <Icon name="download1" />
        </div>
      )
    }
  }
})
