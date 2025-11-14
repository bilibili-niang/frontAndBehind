export const subTitleManifest = {
  schema: {
    type: 'object',
    properties: {
      align: {
        title: '水平对齐',
        type: 'string',
        widget: 'select',
        config: {
          options: [
            { label: '居左', value: 'left' },
            { label: '居中', value: 'center' },
            { label: '居右', value: 'right' }
          ]
        }
      },
      title: {
        title: '主标题',
        type: 'object',
        widget: 'group',
        properties: {
          text: { title: '文本', type: 'string' },
          color: { title: '颜色', type: 'string', widget: 'color' },
          fontSize: {
            title: '大小',
            type: 'number',
            widget: 'number',
            config: { suffix: 'px', min: 10, max: 64 }
          }
        }
      },
      subtitle: {
        title: '副标题',
        type: 'object',
        widget: 'group',
        enableKey: 'enable',
        enableKeyAsProperty: true,
        properties: {
          text: { title: '文本', type: 'string' },
          color: { title: '颜色', type: 'string', widget: 'color' },
          fontSize: {
            title: '大小',
            type: 'number',
            widget: 'number',
            config: { suffix: 'px', min: 8, max: 48 }
          },
          placement: {
            title: '位置',
            type: 'string',
            widget: 'select',
            config: {
              options: [
                { label: '下方', value: 'bottom' },
                { label: '左侧', value: 'left' },
                { label: '右侧', value: 'right' },
                { label: '上方', value: 'top' }
              ]
            }
          }
        }
      }
    }
  },
  default: {
    align: 'left',
    title: {
      text: '主标题',
      color: '#1f1f1f',
      fontSize: 18
    },
    subtitle: {
      enable: true,
      text: '副标题',
      color: '#999999',
      fontSize: 12,
      placement: 'right'
    }
  },
  defaultAttrs: {
    margin: [0, 0, 0, 0]
  }
}

// 同时保留默认导出，兼容现有引用
export default subTitleManifest
