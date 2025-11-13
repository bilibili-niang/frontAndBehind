// 页面选择器（通用选择器样式），对齐导航编辑器中的“展示页面”选择器
import { CommonWidgetPropsDefine } from '@anteng/jsf'
import { defineComponent } from 'vue'
import { useCommonSelector, useTabSearchTable } from '@anteng/core'
import { decorationList as DecorationList, systemList as SystemList } from '../../../lib'

// 作为通用选择器的弹窗内容
const SelectPages = defineComponent({
  name: 'SelectPages',
  props: {
    asSelector: { type: Boolean, default: false },
    onSelect: { type: Function, default: null }
  },
  setup(props: any) {
    return () =>
      useTabSearchTable([
        <SystemList
          title="系统装修页"
          asSelector={1}
          onSelect={e => props.onSelect?.({ __type: 'system', ...e })}
        />, 
        <DecorationList
          title="自定义装修"
          asSelector={1}
          onSelect={e => props.onSelect?.({ __type: 'custom', ...e })}
        />
      ])
  }
})

// 导出为通用选择器风格的控件（点击后弹出 Modal，选择项回填 {id,name}）
export default useCommonSelector({
  widget: SelectPages,
  title: '选择页面'
})
