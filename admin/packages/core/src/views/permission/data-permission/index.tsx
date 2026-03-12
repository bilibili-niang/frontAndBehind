import { defineComponent, ref, onMounted } from 'vue'
import { useSearchTable, useTableAction } from '../../../components/search-table'
import { Button, Tag, Select, message } from '@pkg/ui'
import { commonDelete } from '@pkg/utils'
import {
  getDataPermissionList,
  createDataPermission,
  updateDataPermission,
  deleteDataPermission,
  getRoleList,
  getDataScopes,
  type DataPermission,
  type CreateDataPermissionData,
  type Role,
  type DataScope
} from '../../../api/permission'
import { onCreate, onUpdate } from './modal'

export default defineComponent({
  name: 'DataPermissionManage',
  setup() {
    const roleList = ref<Role[]>([])
    const dataScopes = ref<DataScope[]>([])
    const selectedRole = ref<string>('')

    const loadRoles = async () => {
      try {
        const res = await getRoleList()
        roleList.value = res
      } catch (err) {
        message.error('获取角色列表失败')
      }
    }

    const loadDataScopes = async () => {
      try {
        const res = await getDataScopes()
        dataScopes.value = res
      } catch (err) {
        message.error('获取数据权限范围失败')
      }
    }

    onMounted(() => {
      loadRoles()
      loadDataScopes()
    })

    const getScopeLabel = (scope: number) => {
      const scopeMap: Record<number, { label: string; color: string }> = {
        1: { label: '全部数据', color: 'red' },
        2: { label: '本部门', color: 'orange' },
        3: { label: '本部门及以下', color: 'blue' },
        4: { label: '仅本人', color: 'green' },
        5: { label: '自定义', color: 'purple' }
      }
      const config = scopeMap[scope] || { label: '未知', color: 'default' }
      return <Tag color={config.color}>{config.label}</Tag>
    }

    const {
      Table,
      refresh
    } = useSearchTable({
      title: '数据权限管理',
      customRequest: (p) => {
        return getDataPermissionList({
          ...p,
          roleId: selectedRole.value || undefined
        }).then(res => ({
          list: res.list,
          total: res.pagination.total
        }))
      },
      toolbar: (
        <div style={{ display: 'flex', gap: '12px' }}>
          <Select
            v-model:value={selectedRole.value}
            placeholder="选择角色筛选"
            allowClear
            style={{ width: '200px' }}
            options={roleList.value.map(r => ({ label: r.displayName, value: r.id }))}
            onChange={() => refresh()}
          />
          <Button
            type="primary"
            v-permission="button:data-permission:create"
            onClick={() => {
              onCreate(async (data: CreateDataPermissionData) => {
                await createDataPermission(data)
                refresh()
              }, roleList.value)
            }}
          >
            添加数据权限
          </Button>
        </div>
      ),
      filter: {
        list: [
          {
            key: 'resourceType',
            label: '资源类型',
            type: 'input',
            placeholder: '如：user, order'
          }
        ]
      },
      table: {
        columns: [
          {
            title: '角色',
            dataIndex: 'roleId',
            width: 150,
            customRender: ({ text }) => {
              const role = roleList.value.find(r => r.id === text)
              return role?.displayName || text
            }
          },
          {
            title: '资源类型',
            dataIndex: 'resourceType',
            width: 150
          },
          {
            title: '数据范围',
            dataIndex: 'scope',
            width: 150,
            customRender: ({ text }) => getScopeLabel(text)
          },
          {
            title: '自定义规则',
            dataIndex: 'customRule',
            ellipsis: true,
            customRender: ({ text }) => {
              if (!text) return '-'
              try {
                const rule = JSON.parse(text)
                const parts: string[] = []
                if (rule.deptIds?.length) parts.push(`部门: ${rule.deptIds.length}个`)
                if (rule.userIds?.length) parts.push(`用户: ${rule.userIds.length}个`)
                return parts.join(', ') || '-'
              } catch {
                return text
              }
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
                    vPermission: 'button:data-permission:update',
                    onClick: () => {
                      onUpdate(
                        record,
                        async (data: Partial<CreateDataPermissionData>) => {
                          await updateDataPermission(record.id, data)
                          refresh()
                        },
                        roleList.value,
                        dataScopes.value
                      )
                    }
                  },
                  {
                    title: '删除',
                    type: 'danger',
                    vPermission: 'button:data-permission:delete',
                    onClick: () => {
                      commonDelete(
                        { id: record.id, name: `${record.resourceType}权限` },
                        (id: string) => deleteDataPermission(id),
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
      <div class="data-permission-manage">
        {Table}
      </div>
    )
  }
})
