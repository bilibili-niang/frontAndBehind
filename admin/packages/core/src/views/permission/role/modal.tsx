import { Modal, Form, Input, Select, Switch, message } from '@pkg/ui'
import { ref, watch } from 'vue'
import type { Role, CreateRoleData } from '../../../api/permission'

interface FormState {
  name: string
  displayName: string
  description: string
  status: number
  isDefault: boolean
  permissionIds: string[]
}

const defaultForm: FormState = {
  name: '',
  displayName: '',
  description: '',
  status: 1,
  isDefault: false,
  permissionIds: []
}

/**
 * 创建角色弹窗
 */
export const onCreate = (
  onSubmit: (data: CreateRoleData) => Promise<void>
) => {
  const visible = ref(true)
  const form = ref<FormState>({ ...defaultForm })
  const loading = ref(false)

  const handleSubmit = async () => {
    if (!form.value.name || !form.value.displayName) {
      message.error('请填写必填项')
      return
    }

    loading.value = true
    try {
      await onSubmit({
        name: form.value.name,
        displayName: form.value.displayName,
        description: form.value.description,
        status: form.value.status,
        isDefault: form.value.isDefault,
        permissionIds: form.value.permissionIds
      })
      message.success('创建成功')
      visible.value = false
    } catch (err) {
      message.error('创建失败')
    } finally {
      loading.value = false
    }
  }

  Modal.confirm({
    title: '添加角色',
    width: 600,
    onOk: handleSubmit,
    content: () => (
      <Form layout="vertical">
        <Form.Item label="角色名称" required>
          <Input
            v-model:value={form.value.name}
            placeholder="请输入角色名称，如：admin"
          />
        </Form.Item>
        <Form.Item label="显示名称" required>
          <Input
            v-model:value={form.value.displayName}
            placeholder="请输入显示名称，如：管理员"
          />
        </Form.Item>
        <Form.Item label="描述">
          <Input.TextArea
            v-model:value={form.value.description}
            placeholder="请输入角色描述"
            rows={3}
          />
        </Form.Item>
        <Form.Item label="状态">
          <Select
            v-model:value={form.value.status}
            options={[
              { label: '启用', value: 1 },
              { label: '禁用', value: 0 }
            ]}
          />
        </Form.Item>
        <Form.Item label="默认角色">
          <Switch
            v-model:checked={form.value.isDefault}
            checkedChildren="是"
            unCheckedChildren="否"
          />
        </Form.Item>
      </Form>
    )
  })
}

/**
 * 编辑角色弹窗
 */
export const onUpdate = (
  record: Role,
  onSubmit: (data: Partial<CreateRoleData>) => Promise<void>
) => {
  const form = ref<FormState>({
    name: record.name,
    displayName: record.displayName,
    description: record.description || '',
    status: record.status,
    isDefault: record.isDefault,
    permissionIds: []
  })
  const loading = ref(false)

  const handleSubmit = async () => {
    if (!form.value.displayName) {
      message.error('请填写显示名称')
      return
    }

    loading.value = true
    try {
      await onSubmit({
        displayName: form.value.displayName,
        description: form.value.description,
        status: form.value.status,
        isDefault: form.value.isDefault,
        permissionIds: form.value.permissionIds
      })
      message.success('更新成功')
    } catch (err) {
      message.error('更新失败')
    } finally {
      loading.value = false
    }
  }

  Modal.confirm({
    title: '编辑角色',
    width: 600,
    onOk: handleSubmit,
    content: () => (
      <Form layout="vertical">
        <Form.Item label="角色名称">
          <Input v-model:value={form.value.name} disabled />
        </Form.Item>
        <Form.Item label="显示名称" required>
          <Input
            v-model:value={form.value.displayName}
            placeholder="请输入显示名称"
          />
        </Form.Item>
        <Form.Item label="描述">
          <Input.TextArea
            v-model:value={form.value.description}
            placeholder="请输入角色描述"
            rows={3}
          />
        </Form.Item>
        <Form.Item label="状态">
          <Select
            v-model:value={form.value.status}
            options={[
              { label: '启用', value: 1 },
              { label: '禁用', value: 0 }
            ]}
          />
        </Form.Item>
        <Form.Item label="默认角色">
          <Switch
            v-model:checked={form.value.isDefault}
            checkedChildren="是"
            unCheckedChildren="否"
          />
        </Form.Item>
      </Form>
    )
  })
}
