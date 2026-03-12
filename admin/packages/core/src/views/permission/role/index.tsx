import { defineComponent, ref, onMounted } from 'vue'
import { useSearchTable, useTableAction } from '../../../components/search-table'
import { Button, Tag, message } from '@pkg/ui'
import { commonDelete } from '@pkg/utils'
import {
  getRoleList,
  createRole,
  updateRole,
  deleteRole,
  type Role,
  type CreateRoleData
} from '../../../api/permission'
import { onCreate, onUpdate } from './modal'

export default defineComponent({
  name: 'PermissionRole',
  setup() {
    const roleList = ref<Role[]>([])

    const loadRoles = async () => {
      try {
        const res = await getRoleList()
        roleList.value = res
      } catch (err) {
        message.error('获取角色列表失败')
      }
    }

    onMounted(() => {
      loadRoles()
    })

    const {
      Table,
      refresh
    } = useSearchTable({
      title: '角色管理',
      customRequest: () => {
        return getRoleList().then(res => ({
          list: res,
          total: res.length
        }))
      },
      toolbar: (
        <Button
          type="primary"
          v-permission="button:role:create"
          onClick={() => {
            onCreate(async (data: CreateRoleData) => {
              await createRole(data)
              refresh()
            })
          }}
        >
          添加角色
        </Button>
      ),
      table: {
        columns: [
          {
            title: '角色名称',
            dataIndex: 'name',
            width: 150
          },
          {
            title: '显示名称',
            dataIndex: 'displayName',
            width: 150
          },
          {
            title: '描述',
            dataIndex: 'description',
            ellipsis: true
          },
          {
            title: '状态',
            dataIndex: 'status',
            width: 100,
            customRender: ({ text }) => {
              return (
                <Tag color={text === 1 ? 'success' : 'default'}>
                  {text === 1 ? '启用' : '禁用'}
                </Tag>
              )
            }
          },
          {
            title: '默认角色',
            dataIndex: 'isDefault',
            width: 100,
            customRender: ({ text }) => {
              return text ? <Tag color="blue">是</Tag> : <Tag>否</Tag>
            }
          },
          {
            title: '创建时间',
            dataIndex: 'createdAt',
            width: 180
          },
          {
            title: '操作',
            width: 200,
            fixed: 'right',
            customRender: ({ record }) => {
              return useTableAction({
                list: [
                  {
                    title: '编辑',
                    type: 'default',
                    vPermission: 'button:role:update',
                    onClick: () => {
                      onUpdate(
                        record,
                        async (data: Partial<CreateRoleData>) => {
                          await updateRole(record.id, data)
                          refresh()
                        }
                      )
                    }
                  },
                  {
                    title: '删除',
                    type: 'danger',
                    vPermission: 'button:role:delete',
                    disabled: record.isDefault,
                    onClick: () => {
                      commonDelete(
                        { id: record.id, name: record.displayName },
                        (id: string) => deleteRole(id),
                        refresh
                      )
                    }
                  }
                ]
              })
            }
          }
        ]
      }
    })

    return () => Table
  }
})
