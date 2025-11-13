export default {
  schema: {
    type: 'object',
    properties: {
      height: {
        title: '高度',
        type: 'number',
        widget: 'slider',
        config: {
          min: 0,
          max: 100,
          suffix: 'px'
        }
      },
      separator: {
        title: '分隔符',
        type: 'object',
        widget: 'suite',
        enableKey: 'enable',
        enableKeyAsProperty: true,
        properties: {
          color: {
            title: '颜色',
            type: 'string',
            widget: 'color'
          },
          shape: {
            type: 'string',
            title: '线型',
            widget: 'select',
            config: {
              options: [
                { value: 'solid', label: '实线' },
                { value: 'dashed', label: '虚线' },
                { value: 'dotted', label: '点线' }
              ],
              flex: 12
            }
          },
          width: {
            title: '线宽',
            type: 'number',
            config: {
              min: 0.5,
              max: 12,
              flex: 12,
              suffix: 'px'
            }
          }
        }
      }
    }
  },
  default: {
    height: 48,
    separator: {
      enable: false,
      color: '#eeeeee',
      shape: 'solid',
      width: 1
    }
  }
}
