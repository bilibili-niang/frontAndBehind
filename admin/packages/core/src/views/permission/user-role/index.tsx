/**
 * 用户角色与权限管理
 * 包含两个 Tab：
 * 1. 用户角色分配 - 为用户分配角色
 * 2. 角色权限管理 - 管理角色的权限
 */
import { defineComponent, ref, onMounted, computed } from 'vue'
import { Tabs, Card, Transfer, Table, Tag, Button, message, Spin, Empty } from 'ant-design-vue'
import { useSearchTable } from '../../components/search-table'
import {
  getRoleList,
  getUserRoles,
  assignRolesToUser,
  getPermissionList,
  assignPermissionsToRole,
  getRolePermissions,
  type Role,
  type Permission
} from '../../api/permission'
import { $accountList } from '../../api'

const { TabPane } = Tabs

export default defineComponent({
  name: 'UserRoleManagement',
  setup() {
    const activeTab = ref('user-role')
    const loading = ref(false)

    // 用户角色分配相关
    const selectedUserId = ref<string>('')
    const userAssignedRoles = ref<Role[]>([])
    const allRoles = ref<Role[]>([])
    const targetKeys = ref<string[]>([])

    // 角色权限相关
    const selectedRoleId = ref<string>('')
    const roleAssignedPermissions = ref<Permission[]>([])
    const allPermissions = ref<Permission[]>([])
    const permissionTargetKeys = ref<string[]>([])

    // 加载数据
    const loadRoles = async () => {
      try {
        const res = await getRoleList()
        allRoles.value = res.filter((r: Role) => r.status === 1)
      } catch (err) {
        message.error('获取角色列表失败')
      }
    }

    const loadPermissions = async () => {
      try {
        const res = await getPermissionList()
        allPermissions.value = res.filter((p: Permission) => p.status === 1)
      } catch (err) {
        message.error('获取权限列表失败')
      }
    }

    onMounted(() => {
      loadRoles()
      loadPermissions()
    })

    // 加载用户的角色
    const loadUserRoles = async (userId: string) => {
      loading.value = true
      try {
        const res = await getUserRoles(userId)
        userAssignedRoles.value = res
        targetKeys.value = res.map((r: Role) => r.id)
      } catch (err) {
        message.error('获取用户角色失败')
      } finally {
        loading.value = false
      }
    }

    // 加载角色的权限
    const loadRolePerms = async (roleId: string) => {
      loading.value = true
      try {
        const res = await getRolePermissions(roleId)
        roleAssignedPermissions.value = res
        permissionTargetKeys.value = res.map((p: Permission) => p.id)
      } catch (err) {
        message.error('获取角色权限失败')
      } finally {
        loading.value = false
      }
    }

    // 保存用户角色
    const saveUserRoles = async () => {
      if (!selectedUserId.value) {
        message.warning('请选择用户')
        return
      }
      try {
        await assignRolesToUser({
          userId: selectedUserId.value,
          roleIds: targetKeys.value
        })
        message.success('保存用户角色成功')
      } catch (err) {
        message.error('保存用户角色失败')
      }
    }

    // 保存角色权限
    const saveRolePermissions = async () => {
      if (!selectedRoleId.value) {
        message.warning('请选择角色')
        return
      }
      try {
        await assignPermissionsToRole({
          roleId: selectedRoleId.value,
          permissionIds: permissionTargetKeys.value
        })
        message.success('保存角色权限成功')
      } catch (err) {
        message.error('保存角色权限失败')
      }
    }

    // 用户列表相关
    const {
      Table: UserTable
    } = useSearchTable({
      title: '用户列表',
      customRequest: (params) => {
        return $accountList(params).then((res: any) => ({
          list: res.list || [],
          total: res.pagination?.total || 0
        }))
      },
      table: {
        columns: [
          {
            title: '用户名',
            dataIndex: 'userName',
            width: 150
          },
          {
            title: '手机号',
            dataIndex: 'phoneNumber',
            width: 150
          },
          {
            title: '状态',
            dataIndex: 'status',
            width: 100,
            customRender: ({ text }: { text: number }) => {
              return <Tag color={text === 1 ? 'success' : 'default'}>
                {text === 1 ? '启用' : '禁用'}
              </Tag>
            }
          },
          {
            title: '创建时间',
            dataIndex: 'createdAt',
            width: 180
          }
        ],
        rowSelection: {
          type: 'radio',
          onChange: (_selectedRowKeys: any, selectedRows: any[]) => {
            if (selectedRows.length > 0) {
              selectedUserId.value = selectedRows[0].id
              loadUserRoles(selectedRows[0].id)
            }
          }
        }
      }
    })

    // 用户选择变化时重置
    const handleUserRowClick = (record: any) => {
      selectedUserId.value = record.id
      loadUserRoles(record.id)
    }

    // 角色选择变化
    const handleRoleRowClick = (record: Role) => {
      selectedRoleId.value = record.id
      loadRolePerms(record.id)
    }

    // Transfer 数据源
    const roleTransferData = computed(() => {
      return allRoles.value.map((role: Role) => ({
        key: role.id,
        title: role.displayName,
        description: role.description || role.name
      }))
    })

    const permissionTransferData = computed(() => {
      return allPermissions.value.map((perm: Permission) => ({
        key: perm.id,
        title: perm.displayName,
        description: `${perm.resource}:${perm.action}`
      }))
    })

    return () => (
      <Card>
        <Tabs v-model:activeKey={activeTab.value}>
          {/* Tab 1: 用户角色分配 */}
          <TabPane key="user-role" tab="用户角色分配">
            <Spin spinning={loading.value}>
              <div style={{ display: 'flex', gap: '24px' }}>
                {/* 用户列表 */}
                <div style={{ flex: 1, maxWidth: '500px' }}>
                  <h3 style={{ marginBottom: '16px' }}>选择用户</h3>
                  {UserTable()}
                </div>

                {/* 角色分配 */}
                <div style={{ flex: 1 }}>
                  <h3 style={{ marginBottom: '16px' }}>分配角色</h3>
                  {selectedUserId.value ? (
                    <>
                      <Transfer
                        dataSource={roleTransferData.value}
                        titles={['可选角色', '已分配角色']}
                        targetKeys={targetKeys.value}
                        onChange={(keys: any) => {
                          targetKeys.value = keys
                        }}
                        render={(item: any) => item.title}
                        listStyle={{
                          width: '280px',
                          height: '350px'
                        }}
                      />
                      <div style={{ marginTop: '16px', textAlign: 'center' }}>
                        <Button
                          type="primary"
                          onClick={saveUserRoles}
                          disabled={!selectedUserId.value}
                        >
                          保存用户角色
                        </Button>
                      </div>
                    </>
                  ) : (
                    <Empty description="请先在左侧选择用户" />
                  )}
                </div>
              </div>
            </Spin>
          </TabPane>

          {/* Tab 2: 角色权限管理 */}
          <TabPane key="role-permission" tab="角色权限管理">
            <Spin spinning={loading.value}>
              <div style={{ display: 'flex', gap: '24px' }}>
                {/* 角色列表 */}
                <div style={{ width: '280px' }}>
                  <h3 style={{ marginBottom: '16px' }}>选择角色</h3>
                  <Table
                    columns={[
                      {
                        title: '角色名称',
                        dataIndex: 'displayName'
                      }
                    ]}
                    dataSource={allRoles.value}
                    rowKey="id"
                    size="small"
                    onRow={(record: Role) => ({
                      onClick: () => handleRoleRowClick(record),
                      style: { cursor: 'pointer' }
                    })}
                    rowClassName={() => 'clickable-row'}
                    pagination={false}
                  />
                </div>

                {/* 权限分配 */}
                <div style={{ flex: 1 }}>
                  <h3 style={{ marginBottom: '16px' }}>分配权限</h3>
                  {selectedRoleId.value ? (
                    <>
                      <Transfer
                        dataSource={permissionTransferData.value}
                        titles={['可选权限', '已分配权限']}
                        targetKeys={permissionTargetKeys.value}
                        onChange={(keys: any) => {
                          permissionTargetKeys.value = keys
                        }}
                        render={(item: any) => item.title}
                        listStyle={{
                          width: '280px',
                          height: '350px'
                        }}
                      />
                      <div style={{ marginTop: '16px', textAlign: 'center' }}>
                        <Button
                          type="primary"
                          onClick={saveRolePermissions}
                          disabled={!selectedRoleId.value}
                        >
                          保存角色权限
                        </Button>
                      </div>
                    </>
                  ) : (
                    <Empty description="请先在左侧选择角色" />
                  )}
                </div>
              </div>
            </Spin>
          </TabPane>
        </Tabs>
      </Card>
    )
  }
})
