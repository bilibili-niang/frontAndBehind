import { Modal, Form, Input, TreeSelect, Switch, message } from '@pkg/ui'
import { ref } from 'vue'
import type { Menu, CreateMenuData } from '../../../api/permission'

interface FormState {
  name: string
  path: string
  component: string
  icon: string
  permission: string
  parentId?: string
  sort: number
  hidden: boolean
  keepAlive: boolean
  status: number
}

const defaultForm: FormState = {
  name: '',
  path: '',
  component: '',
  icon: '',
  permission: '',
  sort: 0,
  hidden: false,
  keepAlive: false,
  status: 1
}

/**
 * 构建菜单树选项
 */
const buildMenuTree = (menus: Menu[]) => {
  const map = new Map<string, any>()
  const roots: any[] = []

  menus.forEach(m => {
    map.set(m.id, {
      title: m.name,
      value: m.id,
      children: []
    })
  })

  menus.forEach(m => {
    const node = map.get(m.id)
    if (m.parentId && map.has(m.parentId)) {
      map.get(m.parentId).children.push(node)
    } else {
      roots.push(node)
    }
  })

  return roots
}

/**
 * 创建菜单弹窗
 */
export const onCreate = (
  onSubmit: (data: CreateMenuData) => Promise<void>,
  menus: Menu[]
) => {
  const form = ref<FormState>({ ...defaultForm })
  const loading = ref(false)
  const treeData = buildMenuTree(menus)

  const handleSubmit = async () => {
    if (!form.value.name) {
      message.error('请填写菜单名称')
      return
    }

    loading.value = true
    try {
      await onSubmit({
        name: form.value.name,
        path: form.value.path,
        component: form.value.component,
        icon: form.value.icon,
        permission: form.value.permission,
        parentId: form.value.parentId,
        sort: form.value.sort,
        hidden: form.value.hidden,
        keepAlive: form.value.keepAlive,
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
    title: '添加菜单',
    width: 600,
    onOk: handleSubmit,
    content: () => (
      <Form layout="vertical">
        <Form.Item label="菜单名称" required>
          <Input
            v-model:value={form.value.name}
            placeholder="请输入菜单名称，如：用户管理"
          />
        </Form.Item>
        <Form.Item label="路由路径">
          <Input
            v-model:value={form.value.path}
            placeholder="请输入路由路径，如：/system/user"
          />
        </Form.Item>
        <Form.Item label="组件路径">
          <Input
            v-model:value={form.value.component}
            placeholder="请输入组件路径，如：system/user/index"
          />
        </Form.Item>
        <Form.Item label="图标">
          <Input
            v-model:value={form.value.icon}
            placeholder="请输入图标名称"
          />
        </Form.Item>
        <Form.Item label="权限标识">
          <Input
            v-model:value={form.value.permission}
            placeholder="请输入权限标识，如：menu:user"
          />
        </Form.Item>
        <Form.Item label="父菜单">
          <TreeSelect
            v-model:value={form.value.parentId}
            treeData={treeData}
            placeholder="请选择父菜单（可选）"
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
        <Form.Item label="隐藏菜单">
          <Switch
            v-model:checked={form.value.hidden}
            checkedChildren="是"
            unCheckedChildren="否"
          />
        </Form.Item>
        <Form.Item label="缓存页面">
          <Switch
            v-model:checked={form.value.keepAlive}
            checkedChildren="是"
            unCheckedChildren="否"
          />
        </Form.Item>
        <Form.Item label="状态">
          <Switch
            v-model:checked={form.value.status}
            checkedChildren="启用"
            unCheckedChildren="禁用"
          />
        </Form.Item>
      </Form>
    )
  })
}

/**
 * 编辑菜单弹窗
 */
export const onUpdate = (
  record: Menu,
  onSubmit: (data: Partial<CreateMenuData>) => Promise<void>,
  menus: Menu[]
) => {
  const form = ref<FormState>({
    name: record.name,
    path: record.path || '',
    component: record.component || '',
    icon: record.icon || '',
    permission: record.permission || '',
    parentId: record.parentId,
    sort: record.sort,
    hidden: record.hidden,
    keepAlive: record.keepAlive,
    status: record.status
  })
  const loading = ref(false)
  const treeData = buildMenuTree(menus.filter(m => m.id !== record.id))

  const handleSubmit = async () => {
    if (!form.value.name) {
      message.error('请填写菜单名称')
      return
    }

    loading.value = true
    try {
      await onSubmit({
        name: form.value.name,
        path: form.value.path,
        component: form.value.component,
        icon: form.value.icon,
        permission: form.value.permission,
        parentId: form.value.parentId,
        sort: form.value.sort,
        hidden: form.value.hidden,
        keepAlive: form.value.keepAlive,
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
    title: '编辑菜单',
    width: 600,
    onOk: handleSubmit,
    content: () => (
      <Form layout="vertical">
        <Form.Item label="菜单名称" required>
          <Input
            v-model:value={form.value.name}
            placeholder="请输入菜单名称"
          />
        </Form.Item>
        <Form.Item label="路由路径">
          <Input
            v-model:value={form.value.path}
            placeholder="请输入路由路径"
          />
        </Form.Item>
        <Form.Item label="组件路径">
          <Input
            v-model:value={form.value.component}
            placeholder="请输入组件路径"
          />
        </Form.Item>
        <Form.Item label="图标">
          <Input
            v-model:value={form.value.icon}
            placeholder="请输入图标名称"
          />
        </Form.Item>
        <Form.Item label="权限标识">
          <Input
            v-model:value={form.value.permission}
            placeholder="请输入权限标识"
          />
        </Form.Item>
        <Form.Item label="父菜单">
          <TreeSelect
            v-model:value={form.value.parentId}
            treeData={treeData}
            placeholder="请选择父菜单（可选）"
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
        <Form.Item label="隐藏菜单">
          <Switch
            v-model:checked={form.value.hidden}
            checkedChildren="是"
            unCheckedChildren="否"
          />
        </Form.Item>
        <Form.Item label="缓存页面">
          <Switch
            v-model:checked={form.value.keepAlive}
            checkedChildren="是"
            unCheckedChildren="否"
          />
        </Form.Item>
        <Form.Item label="状态">
          <Switch
            v-model:checked={form.value.status}
            checkedChildren="启用"
            unCheckedChildren="禁用"
          />
        </Form.Item>
      </Form>
    )
  })
}
