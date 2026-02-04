// 储值卡的面值展示
import './style.scss'
import { Table } from '@pkg/ui'
import { useModal } from '@pkg/core'

export const displayPriceRuleModal = (data, name) => {
  const columns = [
    {
      title: <div class="isRequired">面值(元)</div>,
      dataIndex: 'parValue',
      width: 120
    },
    {
      title: <div class="isRequired">售价(元)</div>,
      width: 120,
      dataIndex: 'salePrice'
    },
    {
      title: '划线价(元)',
      width: 120,
      dataIndex: 'dashPrice'
    },
    {
      title: <div class="isRequired">库存</div>,
      width: 120,
      dataIndex: 'stock'
    }
  ]
  useModal({
    title: '面值-' + name,
    width: 1000,
    content: () => (
      <div class="popupContent">
        <Table bordered pagination={false} columns={columns} dataSource={data}></Table>
      </div>
    )
  })
}
