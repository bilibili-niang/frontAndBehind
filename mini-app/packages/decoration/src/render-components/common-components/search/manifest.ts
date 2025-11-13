import { defineSchema } from '@anteng/jsf/src/utils/schema'

export default {
  schema: defineSchema({
    title: 'search',
    type: 'object',
    properties: {
      placeholder: {
        type: 'string',
        title: '占位文本'
      },
      // button: {
      //   title: '按钮',
      //   type: 'object',
      //   widget: 'group',
      //   enableKey: 'enableButton',
      //   properties: {
      //     text: {
      //       title: '文本内容',
      //       type: 'string'
      //     },
      //     color: {
      //       title: '文本颜色',
      //       type: 'string',
      //       widget: 'color'
      //     },
      //     backgroundColor: {
      //       title: '背景颜色',
      //       type: 'string',
      //       widget: 'color'
      //     },
      //   }
      // },
      keywords: {
        type: 'array',
        title: '预设词条',
        description: '用户点击该词条进入搜索页面默认（占位文本形式）填充到搜索框中',
        enableKey: 'enableKeywords',
        config: {
          itemTitle: '词条',
          itemDefault: {
            text: '文本'
          }
        },
        items: {
          title: '词条',
          type: 'object',
          properties: {
            text: {
              title: '文本内容',
              type: 'string'
            }
            // color: {
            //   title: '文本颜色',
            //   type: 'string',
            //   widget: 'color'
            // }
          }
        }
      },
      tags: {
        type: 'array',
        title: '标签列表',
        config: {
          itemTitle: '标签',
          itemDefault: { text: '文字', action: null }
        },
        enableKey: 'tagsEnable',
        items: {
          title: '标签',
          type: 'object',
          properties: {
            text: {
              title: '标题名称',
              type: 'string'
            },
            action: {
              title: '动作',
              type: 'object',
              description: '若没有定义动作，默认搜索该内容',
              widget: 'action'
            }
          }
        }
      },
      tagStyle: {
        title: '标签样式',
        type: 'object',
        widget: 'suite',
        condition: (rootValue) => rootValue.tagsEnable,
        properties: {
          color: {
            title: '字体颜色',
            type: 'string',
            widget: 'color'
          },
          background: {
            title: '背景颜色',
            type: 'string',
            widget: 'color'
          }
        }
      }
    }
  }),
  default: {
    enableKeywords: true,
    keywords: [],
    tagsEnable: true,
    tags: [],
    tagStyle: {
      color: '#ffffff',
      background: 'rgba(255, 255, 255, 0.1)'
    }
  }
}
