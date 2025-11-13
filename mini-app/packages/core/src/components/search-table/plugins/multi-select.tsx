import { Checkbox, Button } from '@anteng/ui'
import type { SearchTablePlugin, SearchTablePluginContext } from '../index'
import '../styles/expansionStyle.scss'

/**
 * MultiSelect 插件
 * - 在第一列插入选择列
 * - 隐藏“操作”列（标题=操作 或 key/dataIndex=actions）
 * - 自定义 footer：提供“全选本页”和“完成添加”按钮
 *
 * 兼容旧参数：
 * props.multiple: (payload: any) => void
 * props.multipleValue: { value: string[] }
 */
export const createMultiSelectPlugin = (): SearchTablePlugin => {
  const isEnabled = (ctx: SearchTablePluginContext) => !!ctx.props?.multiple

  return {
    enhanceColumns(columns, ctx) {
      if (!isEnabled(ctx)) return columns

      // 选择列
      const selectionCol = {
        dataIndex: 'selection',
        title: '选择',
        width: 80,
        align: 'center',
        customRender: (value: { record: { id: string }; index: number; renderIndex: number; column: object }) => {
          return (
            <Checkbox
              checked={ctx.props.multipleValue.value.includes(value.record.id)}
              onChange={() => ctx.props.multiple(value)}
              style="transform:scale(1.5)"
            />
          )
        }
      }

      const next = [selectionCol, ...columns]

      // 隐藏“操作”列
      return next.filter((col: any) => {
        const titleText = typeof col.title === 'string' ? col.title : ''
        const key = col.key
        const dataIndex = col.dataIndex
        if (col.hidden) return false
        return !(titleText === '操作' || key === 'actions' || dataIndex === 'actions')
      })
    },

    footer(prev, ctx) {
      if (!isEnabled(ctx)) return prev
      const ds = ctx.dataSource.value as any[]
      const selectedCount = ctx.props.multipleValue.value.length
      const allChecked = selectedCount >= ds.length && selectedCount !== 0

      return (
        <div class="multiple-footer">
          <div class="check-all">
            <Checkbox style="transform:scale(1.5)" onChange={() => ctx.props.multiple(ds)} checked={allChecked} />
            &ensp; 全选本页： {selectedCount}／{ds?.length} 个
          </div>
          <Button
            type="primary"
            onClick={() => {
              ctx.props.multiple('over')
            }}
          >
            完成添加
          </Button>
        </div>
      )
    }
  }
}
