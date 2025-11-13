import { defineComponent } from 'vue'
import { useSearchTable, useTableAction } from '../../components/search-table'
import { STATUS_OPTIONS } from '@anteng/config'
import { Button, Tag } from '@anteng/ui'
import { onCreate, onUpdate } from './modal'
import { $shopCreate, $shopDelete, $shopList, $shopUpdate } from '../../api/shop'
import { commonDelete } from '@anteng/utils'

export default defineComponent({
  name: 'ShopTable',
  setup() {
    const { Table, refresh } = useSearchTable({
      title: '门店管理',
      customRequest: (p) => $shopList(p),
      toolbar: (
        <Button
          type="primary"
          onClick={() => onCreate((data) => {
            // 前端不再做兜底转换，直接按表单格式化后的数据提交
            return $shopCreate(data as any)
          }, refresh)}>
          添加门店
        </Button>
      ),
      filter: {
        list: [
          { key: 'name', label: '门店名称', type: 'input', fixed: true },
          { key: 'region', label: '所属区域', type: 'input' }
        ]
      },
      table: {
        columns: [
          { title: '门店名称', dataIndex: 'name', width: 160 },
          { title: '所属区域', dataIndex: 'region', width: 160 },
          { title: '详细地址', dataIndex: 'address', width: 220 },
          { title: '开门时间', dataIndex: 'openingAt', width: 120 },
          { title: '关门时间', dataIndex: 'closingAt', width: 120 },
          {
            title: '状态',
            dataIndex: 'status',
            customRender: ({ text }) => (
              <Tag color={STATUS_OPTIONS.find((i) => i.value === text)?.color}>
                {STATUS_OPTIONS.find((i) => i.value === text)?.label}
              </Tag>
            )
          },
          {
            title: '操作',
            customRender: ({ record }) =>
              useTableAction({
                list: [
                  {
                    title: '编辑',
                    type: 'default',
                    onClick: () =>
                      onUpdate(
                        { ...record, isEditor: true },
                        (data) => $shopUpdate(record.id as string, data as any),
                        refresh
                      )
                  },
                  {
                    title: '删除',
                    type: 'danger',
                    onClick: () =>
                      commonDelete({ id: record.id, name: record.name }, (id: string) => $shopDelete(id), refresh)
                  }
                ]
              })
          }
        ]
      }
    })

    return () => Table
  }
})