// 账号页面的管理
import { defineComponent } from 'vue'
import { useSearchTable, useTableAction } from '../../components/search-table'
import { STATUS_OPTIONS } from '@anteng/config'
import { Button, Tag } from '@anteng/ui'
import { onCreate, onUpdate } from './modal'
import { $accountCreate, $accountDelete, $accountList } from '../../api'
import { commonDelete } from '@anteng/utils'

export default defineComponent({
  name: 'componentName',
  props: {},
  emits: [''],
  setup(props, { emit }) {
    const {
      Table
      , refresh
    } = useSearchTable({
      title: '账号管理',
      customRequest: p => {
        return $accountList(p)
      },
      toolbar: <Button
        type="primary"
        onClick={() => {
          onCreate(data => {
            return $accountCreate(data)
          }, refresh)
        }}>添加账号</Button>,
      filter: {
        list: [
          {
            key: 'userName',
            label: '账号名称',
            type: 'input',
            fixed: true
          }
        ]
      },
      table: {
        columns: [
          {
            title: '账号名称',
            dataIndex: 'userName',
            width: 100
          },
          {
            title: '账号',
            dataIndex: 'phoneNumber',
            width: 100
          },
          {
            title: '状态',
            dataIndex: 'status',
            customRender: ({ text }) => {
              return <Tag
                color={STATUS_OPTIONS.find(item => item.value === text)?.color}>{STATUS_OPTIONS.find(item => item.value === text)?.label}</Tag>
            }
          },
          {
            title: '操作',
            customRender: ({ record }) => {
              return useTableAction({
                list: [
                  {
                    title: '编辑',
                    type: 'default',
                    disabled: record.isAdmin == 1,
                    onClick: () => {
                      onUpdate({
                          ...record,
                          isEditor: true
                        },
                        data => {
                          return $accountCreate(data)
                        },
                        refresh)
                    }
                  },
                  {
                    title: '删除',
                    type: 'danger',
                    disabled: record.isAdmin == 1,
                    onClick: () => {
                      commonDelete({
                        id: record.id,
                        name: record.userName
                      }, (id: string) => $accountDelete(id), refresh)
                    }
                  }
                ]
              })
            }
          }
        ]
      }

    })

    return () => {
      return Table
    }
  }
})

