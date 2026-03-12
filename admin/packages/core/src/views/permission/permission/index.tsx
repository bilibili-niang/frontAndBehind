import { defineComponent, ref, onMounted } from 'vue'
import { useSearchTable, useTableAction } from '../../../components/search-table'
import { Button, Tag, Tree, message } from '@pkg/ui'
import { commonDelete } from '@pkg/utils'
import {
  getPermissionList,
  createPermission,
  updatePermission,
  deletePermission,
  type Permission,
  type CreatePermissionData
} from '../../../api/permission'
import { onCreate, onUpdate } from './modal'

export default defineComponent({
  name: 'PermissionManage',
  setup() {
    const permissionList = ref<Permission[]>([])

    const loadPermissions = async () => {
      try {
        const res = await getPermissionList()
        permissionList.value = res
      } catch (err) {
        message.error('获取权限列表失败')
      }
    }

    onMounted(() => {
      loadPermissions()
    })

    // 构建权限树
    const buildPermissionTree = (permissions: Permission[]) => {
      const map = new Map<string, any>()
      const roots: any[] = []

      permissions.forEach(p => {
        map.set(p.id, {
          title: `${p.displayName} (${p.name})`,
          key: p.id,
          children: [],
          data: p
        })
      })

      permissions.forEach(p => {
        const node = map.get(p.id)
        if (p.parentId && map.has(p.parentId)) {
          map.get(p.parentId).children.push(node)
        } else {
          roots.push(node)
        }
      })

      return roots
    }

    const {
      Table,
      refresh
    } = useSearchTable({
      title: '权限管理',
      customRequest: () => {
        return getPermissionList().then(res => ({
          list: res,
          total: res.length
        }))
      },
      toolbar: (
        <Button
          type="primary"
          v-permission="button:permission:create"
          onClick={() => {
            onCreate(async (data: CreatePermissionData) => {
              await createPermission(data)
              refresh()
            }, permissionList.value)
          }}
        >
          添加权限
        </Button>
      ),
      table: {
        columns: [
          {
            title: '权限名称',
            dataIndex: 'name',
            width: 200
          },
          {
            title: '显示名称',
            dataIndex: 'displayName',
            width: 150
          },
          {
            title: '类型',
            dataIndex: 'type',
            width: 100,
            customRender: ({ text }) => {
              const typeMap: Record<string, { color: string; label: string }> = {
                menu: { color: 'blue', label: '菜单' },
                button: { color: 'green', label: '按钮' },
                api: { color: 'orange', label: 'API' },
                data: { color: 'purple', label: '数据' }
              }
              const config = typeMap[text] || { color: 'default', label: text }
              return <Tag color={config.color}>{config.label}</Tag>
            }
          },
          {
            title: '资源',
            dataIndex: 'resource',
            width: 150
          },
          {
            title: '操作',
            dataIndex: 'action',
            width: 100,
            customRender: ({ text }) => {
              const actionMap: Record<string, string> = {
                view: '查看',
                create: '创建',
                update: '更新',
                delete: '删除'
              }
              return actionMap[text] || text
            }
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
                    vPermission: 'button:permission:update',
                    onClick: () => {
                      onUpdate(
                        record,
                        async (data: Partial<CreatePermissionData>) => {
                          await updatePermission(record.id, data)
                          refresh()
                        },
                        permissionList.value
                      )
                    }
                  },
                  {
                    title: '删除',
                    type: 'danger',
                    vPermission: 'button:permission:delete',
                    onClick: () => {
                      commonDelete(
                        { id: record.id, name: record.displayName },
                        (id: string) => deletePermission(id),
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

    return () => (
      <div class="permission-manage">
        {Table}
      </div>
    )
  }
})
