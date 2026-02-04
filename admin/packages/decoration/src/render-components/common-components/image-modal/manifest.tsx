import { Schema } from '@pkg/jsf'
import image from '../image/manifest'
import { h } from 'vue'
import { Icon } from '@pkg/ui'

export const ImageModalManifest = {
  schema: {
    type: 'object',
    properties: {
      _tip: {
        type: 'null',
        pure: true,
        widget: () => {
          return (
            <ol class="color-primary" style="padding:12px 12px 12px 24px;font-size:13px;">
              <li>
                弹窗一经发布后如需修改请删除后重新创建。否则可能导致部分
                <u style="text-underline-offset:4px;text-decoration-style: dotted;">显示规则之外</u>
                的用户不再显示；
              </li>
              <li style="margin-top:4px;">
                若存在多个弹窗，将按图层顺序逐次显示；若中途跳转到其他页面，将中断连续显示，直到再次回到之前页面继续显示剩余弹窗；
              </li>
            </ol>
          )
        }
      },
      image: {
        ...image.schema,
        title: '图片',
        widget: 'group'
        // config: {
        //   defaultCollapsed: true
        // }
      },
      style: {
        title: '整体样式',
        type: 'object',
        widget: 'group',
        properties: {
          backgroundColor: {
            title: '背景颜色',
            type: 'string',
            widget: 'color'
          },
          backgroundBlur: {
            title: '背景虚化',
            type: 'string',
            widget: 'slider',
            config: {
              min: 0,
              max: 20,
              step: 1,
              suffix: 'px'
            }
          },
          padding: {
            title: '边距',
            type: 'object',
            properties: {
              left: {
                title: '左边距',
                type: 'number',
                widget: 'slider',
                config: {
                  suffix: 'px',
                  min: 0,
                  max: 100
                }
              },
              right: {
                title: '右边距',
                type: 'number',
                widget: 'slider',
                config: {
                  suffix: 'px',
                  min: 0,
                  max: 100
                }
              }
            }
          },
          offsetY: {
            title: '上下偏移',
            type: 'number',
            widget: 'slider',
            config: {
              suffix: 'px',
              min: -200,
              max: 200
            }
          }
        }
      },
      rule: {
        title: '显示规则',
        type: 'object',
        widget: 'group',
        properties: {
          mode: {
            title: '模式',
            type: 'string',
            widget: 'radio-button',
            description: (
              <div>
                <div class="color-info">
                  <Icon name="info" />
                  &nbsp;只有当弹窗关闭后才算完成 1 次
                </div>
                <div>
                  1. 首次：进入这个页面显示过一次之后将{' '}
                  <u style="text-underline-offset:4px;text-decoration-style: dotted;">永远</u>{' '}
                  不再显示
                </div>
                <div>2. 每次：每次进入这个页面都会显示，可额外限制</div>
                <div>3. 频率：频率时间段内只显示 1 次，直到下一个时间段</div>
              </div>
            ),
            config: {
              options: [
                { label: '首次', value: 'once' },
                { label: '每次', value: 'always' },
                { label: '频率', value: 'interval' }
              ]
            }
          },
          alwaysLimit: {
            title: '严格模式',
            type: 'boolean',
            description: (
              <ol style="padding:10px 12px 0 24px;">
                <li>不限制：每次进入页面均会显示</li>
                <li>
                  仅启动后首次：只会显示一次， 直到下一次
                  <br />
                  浏览器启动／刷新、小程序启动／重新载入
                </li>
              </ol>
            ),
            condition: (r) => {
              return r.rule?.mode === 'always'
            },
            widget: 'radio-button',
            config: {
              options: [
                { label: '不限制', value: false },
                { label: '仅启动后首次', value: true }
              ]
            }
          },
          interval: {
            title: '间隔时间',
            type: 'object',
            widget: 'suite',
            condition: (r) => {
              return r.rule?.mode === 'interval'
            },
            properties: {
              value: {
                title: '时长',
                type: 'number',
                config: {
                  flex: 7,
                  min: 1,
                  max: 999
                }
              },
              unit: {
                title: '单位',
                type: 'string',
                widget: 'select',
                config: {
                  flex: 9,
                  options: [
                    { label: '分钟', value: 'm' },
                    { label: '小时', value: 'h' },
                    { label: '天', value: 'd' }
                  ]
                }
              },
              _: {
                title: ' ',
                type: 'null',
                config: {
                  flex: 8
                },
                widget: () =>
                  h(
                    'small',
                    {
                      style: {
                        marginTop: '10px',
                        display: 'inline-block',
                        whiteSpace: 'nowrap'
                      }
                    },
                    '内只显示一次'
                  )
              },
              clearDay: {
                title: '距离下次时长 < 1 天时',
                type: 'boolean',
                widget: 'radio-button',
                config: {
                  options: [
                    { value: false, label: '不重置' },
                    { value: true, label: '0 点后立即重置' }
                  ]
                },
                condition: (r) => {
                  return r.rule?.interval?.unit === 'd'
                }
              }
            }
          },
          maxCount: {
            title: '次数限制',
            type: 'number',
            description: '开启后将限制最大显示次数，超过该次数将不再显示',
            widget: 'slider',
            enableKey: 'maxCountEnable',
            condition: (r) => {
              return r.rule?.mode !== 'once'
            },
            config: {
              min: 1,
              max: 10,
              suffix: '次'
            }
          },
          autoClose: {
            title: '自动关闭',
            type: 'object',
            widget: 'suite',
            enableKey: 'autoCloseEnable',
            properties: {
              interval: {
                title: '持续显示时间',
                type: 'number',
                widget: 'slider',
                config: {
                  suffix: 's',
                  min: 3,
                  max: 20
                }
              }
            }
          },
          afterClick: {
            title: '点击之后',
            type: 'string',
            widget: 'radio-button',
            description: (
              <div>
                <div>若选择「保持显示」，将在用户点击后取消</div>
                <div>自动关闭倒计时，需要用户自行点击关闭按钮</div>
                <div>
                  <Icon name="info" />
                  &nbsp;若图片允许长按，那么此配置强制为「保持显示」
                </div>
              </div>
            ),
            config: {
              options: [
                { label: '立即关闭', value: 'close' },
                { label: '保持显示', value: 'maintain' }
              ]
            }
          },
          maskClosable: {
            title: '点击遮罩关闭',
            type: 'boolean',
            noIndent: true
          }
        }
      }
    }
  } as Schema,
  default: {
    image: {
      ...image.default
    },
    style: {
      backgroundColor: 'rgba(0,0,0,0.7)',
      backgroundBlur: 2,
      padding: {
        left: 48,
        right: 48
      },
      offsetY: 0
    },
    rule: {
      mode: 'interval',
      maxCountEnable: false,
      maxCount: 3,
      alwaysLimit: true,
      interval: {
        value: 1,
        unit: 'd',
        clearDay: true
      },
      autoCloseEnable: true,
      autoClose: {
        interval: 10
      },
      afterClick: 'close',
      maskClosable: true
    }
  }
}

export default ImageModalManifest

type NestRelation = {
  includes?: string[] | '*' // 默认 *
  excludes?: string[] | '*' // 默认 []
}

type component = {
  allowedChildren: NestRelation
  allowedParents: NestRelation
}
