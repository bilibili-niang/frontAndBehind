import { defineAction } from '../utils'

export default defineAction({
  key: 'wx-channels-live',
  title: '微信视频号-直播',
  schema: {
    type: 'object',
    properties: {
      _: {
        type: 'null',
        pure: true,
        widget: () => {
          return (
            <div style="padding:12px">
              可前往{' '}
              <a target="__blank" href="https://channels.weixin.qq.com/">
                视频号助手
              </a>{' '}
              内查询配置所需参数
            </div>
          )
        }
      },
      finderUserName: {
        title: '视频号ID',
        type: 'string',
        description: (
          <div>
            <img
              style="width:800px;"
              src="https://dev-cdn.null.cn/upload/20240621/2b75b9402de8fdac279495c1302be8ec.jpg"
              alt=""
            />
          </div>
        ),
        required: true,
        config: {
          placeholder: '必填，请输入'
        }
      },
      feedId: {
        title: 'feedId',
        type: 'string',
        config: {
          placeholder: '选填'
        }
      },
      nonceId: {
        title: 'nonceId',
        type: 'string',
        config: {
          placeholder: '选填'
        }
      }
    }
  },
  default: {
    finderUserName: '',
    feedId: '',
    nonceId: ''
  },
  handler: (config) => {}
})
