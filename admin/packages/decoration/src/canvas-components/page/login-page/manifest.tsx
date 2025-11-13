import login from '../../../constants/pages/login.json'

export default {
  key: 'login-page',
  name: '登录页',
  version: '0.1.0',
  description: (
    <div>
      注意！为了用户体验和小程序审核，登录页将不可上下滑动，请确保在左侧视图为非自适应高度情况下&nbsp;
      <strong class="color-info">登录模组</strong>&nbsp;能够完整显示。
    </div>
  ),
  schema: {
    title: '登录页',
    type: 'object',
    properties: {
      mode: {
        title: '模式',
        type: 'string',
        widget: 'select',
        config: {
          options: [
            { label: '半屏弹窗（60%～80%）', value: 'modal' },
            { label: '全屏页面（100%）', value: 'page' }
          ]
        }
      },
      closeButton: {
        title: '关闭按钮',
        type: 'object',
        widget: 'suite',
        description: '提示：可以调整组件内/外边距以防止组件和关闭按钮在视觉上产生重叠',
        enableKey: 'enable',
        enableKeyAsProperty: true,
        properties: {
          color: {
            title: '图标颜色',
            type: 'string',
            widget: 'color'
          },
          backgroundColor: {
            title: '背景颜色',
            type: 'string',
            widget: 'color'
          },
          placement: {
            title: '位置',
            type: 'string',
            widget: 'select',
            config: {
              options: [
                { label: '左上角', value: 'topLeft' },
                { label: '右上角', value: 'topRight' }
              ]
            },
            condition: (rootValue: any) => {
              return rootValue.mode === 'modal'
            }
          },
          offsetX: {
            title: 'X轴偏移',
            type: 'number',
            config: {
              flex: 12,
              suffix: 'px'
            },
            condition: (rootValue: any) => {
              return rootValue.mode === 'modal'
            }
          },
          offsetY: {
            title: 'Y轴偏移',
            type: 'number',
            config: {
              flex: 12,
              suffix: 'px'
            },
            condition: (rootValue: any) => {
              return rootValue.mode === 'modal'
            }
          }
        }
      },
      theme: {
        title: '样式',
        type: 'string',
        widget: 'select',
        config: {
          options: [{ label: '默认', value: 'default' }]
        }
      },
      themeColor: {
        title: '主题颜色',
        type: 'string',
        widget: 'color'
      },
      cancelText: {
        title: '取消文案',
        type: 'string',
        description: '根据微信小程序规范要求，必须提供用户跳过登录功能，否则可能导致审核失败。'
      },
      quickLogin: {
        title: '一键登录',
        type: 'object',
        widget: 'suite',
        description: (
          <div>
            <div class="color-info">关闭后仅支持用户使用手机号验证码登录</div>
            <div>H5端：需绑定公众号才可使用，若无公众号主体请关闭</div>
            <div>微信小程序端：付费功能，需要在微信小程序后台购买配额</div>
          </div>
        ),
        properties: {
          h5: {
            title: 'H5端',
            type: 'boolean',
            config: {
              checkedChildren: '开启',
              unCheckedChildren: '禁用',
              flex: 12
            }
          },
          weapp: {
            title: '微信小程序端',
            type: 'boolean',
            config: {
              checkedChildren: '开启',
              unCheckedChildren: '禁用',
              flex: 12
            }
          }
        }
      },
      userAgreement: {
        title: '用户协议',
        type: 'object',
        widget: 'group',
        description: '若未开启将默认为《微信用户隐私政策》',
        properties: {
          type: {
            title: '类型',
            type: 'number',
            widget: 'select',
            config: {
              options: [
                { label: '同步系统页面-用户协议', value: 1 },
                { label: '打开链接', value: 2 },
                { label: '自定义内容', value: 3 },
                { label: '微信用户隐私政策', value: 4 }
              ]
            }
          },
          title: {
            title: '协议标题',
            type: 'string',
            required: true,
            condition: (rootValue: any) => [2, 3].includes(rootValue.userAgreement.type),
            config: {
              placeholder: '必填，请输入'
            }
          },
          link: {
            title: '链接',
            type: 'string',
            description: '请确保该链接域名已配置到小程序业务域名',
            required: true,
            condition: (rootValue: any) => rootValue.userAgreement.type === 2,
            config: {
              placeholder: '必填，请输入'
            }
          },
          content: {
            title: '协议内容',
            type: 'string',
            widget: 'rich-text',
            required: true,
            condition: (rootValue: any) => rootValue.userAgreement.type === 3,
            config: {
              placeholder: '必填，请输入'
            }
          }
        }
      }
    }
  },
  default: login.payload.page
}
