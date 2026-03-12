import { Modal, Form, Input, Select, message } from '@pkg/ui'
import { ref } from 'vue'
import type { DataPermission, CreateDataPermissionData, Role, DataScope } from '../../../api/permission'

interface FormState {
  roleId: string
  resourceType: string
  scope: number
  customRule: string
  status: number
}

const defaultForm: FormState = {
  roleId: '',
  resourceType: '',
  scope: 4,
  customRule: '',
  status: 1
}

/**
 * 创建数据权限规则弹窗
 */
export const onCreate = (
  onSubmit: (data: CreateDataPermissionData) => Promise<void>,
  roles: Role[]
) => {
  const form = ref<FormState>({ ...defaultForm })
  const loading = ref(false)

  const scopeOptions = [
    { label: '全部数据', value: 1, description: '可查看所有数据' },
    { label: '本部门数据', value: 2, description: '仅可查看本部门数据' },
    { label: '本部门及以下', value: 3, description: '可查看本部门及下属部门数据' },
    { label: '仅本人数据', value: 4, description: '仅可查看自己创建的数据' },
    { label: '自定义', value: 5, description: '自定义数据范围' }
  ]

  const handleSubmit = async () => {
    if (!form.value.roleId || !form.value.resourceType) {
      message.error('请填写必填项')
      return
    }

    loading.value = true
    try {
      await onSubmit({
        roleId: form.value.roleId,
        resourceType: form.value.resourceType,
        scope: form.value.scope,
        customRule: form.value.customRule || undefined,
        status: form.value.status
      })
      message.success('创建成功')
    } catch (err) {
      message.error('创建失败')
    } finally {
      loading.value = false
    }
  }

  Modal.confirm({
    title: '添加数据权限规则',
    width: 600,
    onOk: handleSubmit,
    content: () => (
      <Form layout="vertical">
        <Form.Item label="角色" required>
          <Select
            v-model:value={form.value.roleId}
            placeholder="请选择角色"
            options={roles.map(r => ({ label: r.displayName, value: r.id }))}
          />
        </Form.Item>
        <Form.Item label="资源类型" required>
          <Input
            v-model:value={form.value.resourceType}
            placeholder="请输入资源类型，如：user, order, product"
          />
        </Form.Item>
        <Form.Item label="数据范围" required>
          <Select
            v-model:value={form.value.scope}
            placeholder="请选择数据范围"
            options={scopeOptions.map(s => ({
              label: `${s.label} - ${s.description}`,
              value: s.value
            }))}
          />
        </Form.Item>
        {form.value.scope === 5 && (
          <Form.Item label="自定义规则">
            <Input.TextArea
              v-model:value={form.value.customRule}
              placeholder='{"deptIds": ["1", "2"], "userIds": ["3"]}'
              rows={4}
            />
          </Form.Item>
        )}
        <Form.Item label="状态">
          <Select
            v-model:value={form.value.status}
            options={[
              { label: '启用', value: 1 },
              { label: '禁用', value: 0 }
            ]}
          />
        </Form.Item>
      </Form>
    )
  })
}

/**
 * 编辑数据权限规则弹窗
 */
export const onUpdate = (
  record: DataPermission,
  onSubmit: (data: Partial<CreateDataPermissionData>) => Promise<void>,
  roles: Role[],
  scopes: DataScope[]
) => {
  const form = ref<FormState>({
    roleId: record.roleId,
    resourceType: record.resourceType,
    scope: record.scope,
    customRule: record.customRule || '',
    status: record.status
  })
  const loading = ref(false)

  const scopeOptions = [
    { label: '全部数据', value: 1, description: '可查看所有数据' },
    { label: '本部门数据', value: 2, description: '仅可查看本部门数据' },
    { label: '本部门及以下', value: 3, description: '可查看本部门及下属部门数据' },
    { label: '仅本人数据', value: 4, description: '仅可查看自己创建的数据' },
    { label: '自定义', value: 5, description: '自定义数据范围' }
  ]

  const handleSubmit = async () => {
    loading.value = true
    try {
      await onSubmit({
        scope: form.value.scope,
        customRule: form.value.customRule || undefined,
        status: form.value.status
      })
      message.success('更新成功')
    } catch (err) {
      message.error('更新失败')
    } finally {
      loading.value = false
    }
  }

  Modal.confirm({
    title: '编辑数据权限规则',
    width: 600,
    onOk: handleSubmit,
    content: () => (
      <Form layout="vertical">
        <Form.Item label="角色">
          <Select
            v-model:value={form.value.roleId}
            disabled
            options={roles.map(r => ({ label: r.displayName, value: r.id }))}
          />
        </Form.Item>
        <Form.Item label="资源类型">
          <Input v-model:value={form.value.resourceType} disabled />
        </Form.Item>
        <Form.Item label="数据范围" required>
          <Select
            v-model:value={form.value.scope}
            placeholder="请选择数据范围"
            options={scopeOptions.map(s => ({
              label: `${s.label} - ${s.description}`,
              value: s.value
            }))}
          />
        </Form.Item>
        {form.value.scope === 5 && (
          <Form.Item label="自定义规则">
            <Input.TextArea
              v-model:value={form.value.customRule}
              placeholder='{"deptIds": ["1", "2"], "userIds": ["3"]}'
              rows={4}
            />
          </Form.Item>
        )}
        <Form.Item label="状态">
          <Select
            v-model:value={form.value.status}
            options={[
              { label: '启用', value: 1 },
              { label: '禁用', value: 0 }
            ]}
          />
        </Form.Item>
      </Form>
    )
  })
}
