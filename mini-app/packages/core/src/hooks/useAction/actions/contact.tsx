import { defineAction } from '../utils'

export default defineAction({
  key: 'contact',
  title: '联系客服',
  schema: {
    type: 'object',
    properties: {
      type: {
        title: '类型',
        type: 'string',
        widget: 'radio-button',
        config: {
          options: [
            { label: '小程序客服', value: 'mp' },
            { label: '企业微信客服', value: 'work' }
          ]
        }
      },
      _: {
        type: 'null',
        pure: true,
        widget: (props) => {
          if (props.rootValue.config.type === 'work') {
            return (
              <div style="padding-left:28px" class="color-disabled">
                可以参考{' '}
                <a href="https://work.weixin.qq.com/kf/" target="_blank">
                  微信客服介绍
                </a>{' '}
                了解更多信息
              </div>
            )
          }
          return (
            <div style="padding-left:28px;margin-bottom:12px;" class="color-disabled">
              需前往{' '}
              <a href="https://mp.weixin.qq.com/" target="_blank">
                小程序后台 - 客服
              </a>
              ，绑定客服
            </div>
          )
        }
      },
      contacts: {
        title: '电话客服',
        type: 'array',
        enableKey: 'contactsEnable',
        condition: (rootValue) => {
          return rootValue.config.type === 'mp'
        },
        items: {
          title: '联系人',
          type: 'object',
          properties: {
            name: {
              title: '姓名/称呼',
              type: 'string',
              required: true
            },
            mobile: {
              title: '电话/手机',
              type: 'string',
              required: true
            }
          }
        }
      },
      work: {
        type: 'object',
        pure: true,
        condition: (rootValue) => {
          return rootValue.config.type === 'work'
        },
        properties: {
          url: {
            title: '客服链接',
            type: 'string',
            required: true,
            config: {
              placeholder: '必填，请输入'
            }
          },
          corpId: {
            title: '企业ID',
            type: 'string',
            required: true,
            config: {
              placeholder: '必填，请输入'
            }
          },
          messageCard: {
            title: '小程序气泡',
            type: 'object',
            enableKey: 'showMessageCard',
            enableKeyAsProperty: true,
            widget: 'suite',
            properties: {
              sendMessageTitle: {
                title: '自定义气泡标题',
                type: 'string',
                config: {
                  placeholder: '选填'
                }
              },
              sendMessagePath: {
                title: '自定义气泡路径',
                type: 'string',
                config: {
                  placeholder: '选填'
                }
              },
              sendMessageImage: {
                title: '自定义气泡图片',
                type: 'string',
                widget: 'image',
                config: {
                  compact: true
                }
              }
            }
          }
        }
      }
    }
  },
  default: {
    type: 'mp'
  }
})
