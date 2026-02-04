import { Schema } from '@pkg/jsf'

export default {
  key: 'search-page',
  name: '搜索页',
  version: '0.1.0',
  schema: {
    title: '搜索页',
    type: 'object',
    properties: {
      searchBar: {
        title: '搜索框',
        type: 'object',
        widget: 'group',
        properties: {
          placeholder: {
            title: '占位符',
            type: 'string',
            description: '占位符不会被搜索，且「滚动词条」数量 ≥ 1 时不显示',
            config: {
              placeholder: '默认跟随系统设定'
            }
          },
          keywordsList: {
            title: '滚动词条',
            type: 'array',
            description: (
              <div>
                <div>1. 搜索框聚焦后将暂停滚动，且在未输入文字的情况下，可直接点击搜索</div>
                <div>2. 若从外部（如：首页搜索框）进入搜索页时携带词条，将只固定显示该词条</div>
              </div>
            ),
            items: {
              title: '词条',
              type: 'object',
              properties: {
                text: {
                  title: '词条文本',
                  type: 'string'
                },
                value: {
                  title: '实际搜索',
                  type: 'string',
                  description: '纯文字，不应包含图标等特殊字符，设置 "搜索动作" 后无效',
                  config: {
                    placeholder: '默认等同 "词条文本" 内容'
                  }
                },
                action: {
                  title: '搜索动作',
                  type: 'object',
                  widget: 'action',
                  description: '若未设置搜索动作，将进行默认搜索',
                  default: null
                }
              }
            }
          }
        }
      },
      hotKeywords: {
        title: '热搜发现',
        type: 'object',
        widget: 'group',
        enableKey: 'hotKeywordsEnable',
        properties: {
          visibleCount: {
            title: '每页数量',
            type: 'number',
            description: '列表数量 > 每页数量 才可显示「换一换」',
            config: {
              min: 2
            }
          },
          list: {
            title: '词条列表',
            type: 'array',
            items: {
              title: '热搜节点',
              type: 'object',
              properties: {
                text: {
                  title: '按钮文本',
                  type: 'string'
                },
                value: {
                  title: '实际搜索',
                  type: 'string',
                  description: '纯文字，不应包含图标等特殊字符，设置 "点击动作" 后无效',
                  config: {
                    placeholder: '默认等同 "按钮文本" 内容'
                  }
                },
                color: {
                  title: '颜色',
                  type: 'string',
                  widget: 'color',
                  enableKey: 'colorEnable',
                  default: '#e63d3d'
                },
                icon: {
                  title: '图标',
                  type: 'object',
                  widget: 'image',
                  enableKey: 'iconEnable'
                },
                action: {
                  title: '点击动作',
                  type: 'object',
                  widget: 'action',
                  description: '若未设置点击动作，将作为搜索词条，点击后搜索',
                  default: null
                }
              }
            }
          }
        }
      }
    }
  } as Schema,
  default: {
    searchBar: {
      placeholder: '搜索你感兴趣的内容',
      keywordsList: []
    },
    hotKeywordsEnable: true,
    hotKeywords: {
      visibleCount: 2,
      list: []
    }
  }
}
