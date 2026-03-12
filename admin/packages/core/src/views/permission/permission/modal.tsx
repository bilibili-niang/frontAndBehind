import { Modal, Form, Input, Select, TreeSelect, message } from '@pkg/ui'
import { ref } from 'vue'
import type { Permission, CreatePermissionData } from '../../../api/permission'

interface FormState {
  name: string
  displayName: string
  type: 'menu' | 'button' | 'api' | 'data'
  resource: string
  action: 'view' | 'create' | 'update' | 'delete'
  parentId?: string
  sort: number
  status: number
}

const defaultForm: FormState = {
  name: '',
  displayName: '',
  type: 'menu',
  resource: '',
  action: 'view',
  sort: 0,
  status: 1
}

/**
 * 构建权限树选项
 */
const buildPermissionTree = (permissions: Permission[]) => {
  const map = new Map<string, any>()
  const roots: any[] = []

  permissions.forEach(p => {
    map.set(p.id, {
      title: p.displayName,
      value: p.id,
      children: [],
      selectable: p.type === 'menu' // 只有菜单类型可以作为父级
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

/**
 * 创建权限弹窗
 */
export const onCreate = (
  onSubmit: (data: CreatePermissionData) => Promise<void>,
  permissions: Permission[]
) => {
  const form = ref<FormState>({ ...defaultForm })
  const loading = ref(false)
  const treeData = buildPermissionTree(permissions)

  const handleSubmit = async () => {
    if (!form.value.name || !form.value.displayName || !form.value.resource) {
      message.error('请填写必填项')
      return
    }

    loading.value = true
    try {
      await onSubmit({
        name: form.value.name,
        displayName: form.value.displayName,
        type: form.value.type,
        resource: form.value.resource,
        action: form.value.action,
        parentId: form.value.parentId,
        sort: form.value.sort,
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
    title: '添加权限',
    width: 600,
    onOk: handleSubmit,
    content: () => (
      <Form layout="vertical">
        <Form.Item label="权限名称" required>
          <Input
            v-model:value={form.value.name}
            placeholder="请输入权限名称，如：user:create"
          />
        </Form.Item>
        <Form.Item label="显示名称" required>
          <Input
            v-model:value={form.value.displayName}
            placeholder="请输入显示名称，如：创建用户"
          />
        </Form.Item>
        <Form.Item label="权限类型" required>
          <Select
            v-model:value={form.value.type}
            options={[
              { label: '菜单', value: 'menu' },
              { label: '按钮', value: 'button' },
              { label: 'API', value: 'api' },
              { label: '数据', value: 'data' }
            ]}
          />
        </Form.Item>
        <Form.Item label="资源标识" required>
          <Input
            v-model:value={form.value.resource}
            placeholder="请输入资源标识，如：user"
          />
        </Form.Item>
        <Form.Item label="操作类型" required>
          <Select
            v-model:value={form.value.action}
            options={[
              { label: '查看', value: 'view' },
              { label: '创建', value: 'create' },
              { label: '更新', value: 'update' },
              { label: '删除', value: 'delete' }
            ]}
          />
        </Form.Item>
        <Form.Item label="父权限">
          <TreeSelect
            v-model:value={form.value.parentId}
            treeData={treeData}
            placeholder="请选择父权限（可选）"
            allowClear
            treeDefaultExpandAll
          />
        </Form.Item>
        <Form.Item label="排序">
          <Input
            v-model:value={form.value.sort}
            type="number"
            placeholder="请输入排序号"
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
      </Form>
    )
  })
}

/**
 * 编辑权限弹窗
 */
export const onUpdate = (
  record: Permission,
  onSubmit: (data: Partial<CreatePermissionData>) => Promise<void>,
  permissions: Permission[]
) => {
  const form = ref<FormState>({
    name: record.name,
    displayName: record.displayName,
    type: record.type,
    resource: record.resource,
    action: record.action,
    parentId: record.parentId,
    sort: record.sort,
    status: record.status
  })
  const loading = ref(false)
  const treeData = buildPermissionTree(permissions)

  const handleSubmit = async () => {
    if (!form.value.displayName || !form.value.resource) {
      message.error('请填写必填项')
      return
    }

    loading.value = true
    try {
      await onSubmit({
        displayName: form.value.displayName,
        type: form.value.type,
        resource: form.value.resource,
        action: form.value.action,
        parentId: form.value.parentId,
        sort: form.value.sort,
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
    title: '编辑权限',
    width: 600,
    onOk: handleSubmit,
    content: () => (
      <Form layout="vertical">
        <Form.Item label="权限名称">
          <Input v-model:value={form.value.name} disabled />
        </Form.Item>
        <Form.Item label="显示名称" required>
          <Input
            v-model:value={form.value.displayName}
            placeholder="请输入显示名称"
          />
        </Form.Item>
        <Form.Item label="权限类型" required>
          <Select
            v-model:value={form.value.type}
            options={[
              { label: '菜单', value: 'menu' },
              { label: '按钮', value: 'button' },
              { label: 'API', value: 'api' },
              { label: '数据', value: 'data' }
            ]}
          />
        </Form.Item>
        <Form.Item label="资源标识" required>
          <Input
            v-model:value={form.value.resource}
            placeholder="请输入资源标识"
          />
        </Form.Item>
        <Form.Item label="操作类型" required>
          <Select
            v-model:value={form.value.action}
            options={[
              { label: '查看', value: 'view' },
              { label: '创建', value: 'create' },
              { label: '更新', value: 'update' },
              { label: '删除', value: 'delete' }
            ]}
          />
        </Form.Item>
        <Form.Item label="父权限">
          <TreeSelect
            v-model:value={form.value.parentId}
            treeData={treeData}
            placeholder="请选择父权限（可选）"
            allowClear
            treeDefaultExpandAll
          />
        </Form.Item>
        <Form.Item label="排序">
          <Input
            v-model:value={form.value.sort}
            type="number"
            placeholder="请输入排序号"
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
      </Form>
    )
  })
}
