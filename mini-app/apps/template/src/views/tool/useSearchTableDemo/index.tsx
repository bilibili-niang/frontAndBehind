import { defineComponent } from 'vue'
import type { RouteMeta } from '@/router/routeMeta'
import { Button } from '@anteng/ui'
import { useSearchTable } from '@anteng/core'

/**
 * useSearchTable 示例页面，采用自定义请求（mock）返回分页数据
 * - 响应结构符合 packages/core/src/api/request.ts 中 ResponseData<PaginationData<Record>> 约定
 */
export default defineComponent({
  name: 'UseSearchTableDemo',
  setup() {
    type Row = {
      id: string
      name: string
      status: 0 | 1
      createTime: string
    }

    // 生成模拟数据
    const makeMockRows = (count: number, current: number, keywords?: string, status?: number, datege?: string, datele?: string): Row[] => {
      const list: Row[] = []
      for (let i = 0; i < count; i++) {
        const id = `${(current - 1) * count + i + 1}`
        const baseName = `演示数据-${id}`
        const name = keywords ? `${baseName}-${keywords}` : baseName
        const st: 0 | 1 = typeof status === 'number' ? (status === 1 ? 1 : 0) : (i % 2 === 0 ? 1 : 0)
        // 在时间范围内生成一个近似的时间（仅演示，不做严格范围判断）
        const createTime = new Date(Date.now() - i * 3600_000).toISOString().slice(0, 19).replace('T', ' ')
        list.push({ id, name, status: st, createTime })
      }
      return list
    }

    const pageSize = 10

    const { Table, refresh, silentRefresh } = useSearchTable({
      title: 'useSearchTable 示例',
      toolbar: (
        <div class="flex gap-2">
          <Button type="primary" onClick={() => {
            refresh()
          }}>刷新数据</Button>
          <Button onClick={() => {
            silentRefresh()
          }}>静默刷新</Button>
        </div>
      ),
      // 使用自定义请求，返回 mock 分页数据
      async customRequest(params) {
        // params 结构：{ current, size, ascs?, descs?, keywords?, status?, createTime_datege?, createTime_datele? }
        const current = Number(params.current || 1)
        const size = Number(params.size || pageSize)
        const keywords = (params as any).keywords as string | undefined
        const status = (params as any).status as number | undefined
        const datege = (params as any)['createTime_datege'] as string | undefined
        const datele = (params as any)['createTime_datele'] as string | undefined

        const records = makeMockRows(size, current, keywords, status, datege, datele)
        const total = 57 // 演示用固定总数

        // 返回结构符合 ResponseData<PaginationData<Row>>
        return Promise.resolve({
          code: 200,
          success: true,
          msg: 'ok',
          data: {
            countId: '',
            current,
            maxLimit: 0,
            optimizeCountSql: true,
            orders: [],
            pages: Math.ceil(total / size),
            records,
            searchCount: true,
            size,
            total
          }
        })
      },
      filter: {
        list: [
          {
            key: 'keywords',
            label: '关键词',
            type: 'input',
            fixed: true,
            flex: 6,
            config: { placeholder: '按名称关键词过滤' }
          },
          {
            key: 'status',
            label: '状态',
            type: 'select',
            fixed: true,
            flex: 4,
            config: { options: [{ label: '启用', value: 1 }, { label: '停用', value: 0 }] }
          },
          { key: 'createTime', label: '创建时间', type: 'range-picker', flex: 8 }
        ]
      },
      table: {
        columns: [
          { dataIndex: 'id', title: 'ID', width: 120 },
          { dataIndex: 'name', title: '名称', width: 260 },
          {
            dataIndex: 'status',
            title: '状态',
            width: 120,
            customRender: ({ text }) => (text === 1 ? '启用' : '停用')
          },
          { dataIndex: 'createTime', title: '创建时间', width: 200 }
        ]
      },
      initialSize: pageSize
    })

    return () => Table
  }
})

export const routeMeta: RouteMeta = {
  title: 'useSearchTable 示例',
  order: 20
}