export default {
  schema: {
    type: 'object',
    properties: {
      src: {
        title: '图片地址',
        widget: 'image',
        type: 'string',
      },
      mode: {
        title: '图片覆盖模式',
        widget: 'select',
        type: 'string',
        config: {
          options: [
            {
              label: '填充',
              value: 'fill'
            },
            {
              label: '自适应',
              value: 'fit'
            },
            {
              label: '原始',
              value: 'original'
            },
            {
              label: '剪裁',
              value: 'cover'
            },
            {
              label: '包含',
              value: 'contain'
            }
          ]
        }
      },
      position: {
        title: '图形位置',
        widget: 'select',
        type: 'string',
        description: '仅在“自适应/包含”或“剪裁”模式下生效',
        disabled: (root: any) => root?.mode === 'fill' || root?.mode === 'original',
        config: {
          options: [
            { label: '居中', value: 'center' },
            { label: '顶部', value: 'top' },
            { label: '底部', value: 'bottom' },
            { label: '居左', value: 'left' },
            { label: '居右', value: 'right' },
            { label: '左上', value: 'top-left' },
            { label: '右上', value: 'top-right' },
            { label: '左下', value: 'bottom-left' },
            { label: '右下', value: 'bottom-right' },
            { label: '自定义(百分比)', value: 'custom' }
          ]
        }
      },
      positionX: { title: '水平(%)', type: 'number', default: 50, condition: (root: any) => root?.position === 'custom', disabled: (root: any) => root?.mode === 'fill' || root?.mode === 'original' },
      positionY: { title: '垂直(%)', type: 'number', default: 50, condition: (root: any) => root?.position === 'custom', disabled: (root: any) => root?.mode === 'fill' || root?.mode === 'original' },
      alt: { title: '替代文本', type: 'string', },
      width: { title: '宽度', type: 'string', widget: 'input', description: '支持 px/%/auto，例如：300、50%、auto' },
      height: { title: '高度', type: 'string', widget: 'input', description: '支持 px/%/auto，例如：200、50%、auto' }
    }
  },
  default: {
    src: 'https://pic1.imgdb.cn/item/688b28ca58cb8da5c8f4e01d.png',
    alt: '示例图片',
    width: '100%',
    height: 200,
    mode: 'fit',
    position: 'center',
    positionX: 50,
    positionY: 50
  },
  defaultAttrs: {
    margin: [12, 12, 12, 12]
  }
}