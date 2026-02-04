import { useImageSelector } from '@pkg/core'
import { Button, Input } from '@pkg/ui'

export default {
  schema: {
    type: 'object',
    properties: {
      poster: {
        type: 'object',
        title: '封面',
        widget: 'image',
        config: {
          disabled: true
        }
      },
      url: {
        title: '链接',
        type: 'string',
        widget: (props: any) => {
          return (
            <div class="flex-center">
              <Input
                value={props.value}
                onChange={(e) => {
                  props.onChange(e.target.value)
                }}
              />
              <Button
                style="height:30px;margin-left:8px;"
                onClick={() => {
                  useImageSelector({
                    type: 'video',
                    onSuccess: (res) => {
                      props.onChange(res.url)
                    }
                  })
                }}
              >
                选择
              </Button>
            </div>
          )
        }
      },
      ratio: {
        title: '视频比例',
        type: 'object',
        widget: 'suite',
        properties: {
          width: {
            title: '宽度',
            type: 'number',
            config: {
              flex: 7,
              controls: false
            }
          },
          height: {
            title: '高度',
            type: 'number',
            config: {
              flex: 7,
              controls: false
            }
          },
          objectFit: {
            title: '适应',
            type: 'string',
            widget: 'select',
            config: {
              flex: 10,
              options: [
                { label: '拉伸', value: 'fill' },
                { label: '包含', value: 'contain' },
                { label: '覆盖', value: 'cover' }
              ]
            }
          }
        }
      }
    }
  },
  default: {
    url: '',
    ratio: {
      width: 16,
      height: 9,
      objectFit: 'fill'
    }
  }
}
