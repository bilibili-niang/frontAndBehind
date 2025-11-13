import { computed, defineComponent, ref, watchEffect, type PropType } from 'vue'
import './style.scss'
import { Checkbox, Icon, Popover } from '@anteng/ui'
import { PermissionTree, type MenuItem } from './tree'
import { copyText, renderAnyNode } from '@anteng/utils'

const useIndeterminate = false

export const usePermissionTree = (options: { nodes: MenuItem[]; defaultValue?: string[] }) => {
  const { nodes = [], defaultValue = [] } = options

  const treeValue = ref<string[]>(defaultValue)

  const tree = ref(new PermissionTree({ nodes: nodes, defaultValue: treeValue.value, useIndeterminate: false }))

  const updateNodes = (nodes: MenuItem[]) => {
    tree.value = new PermissionTree({ nodes: nodes, defaultValue: treeValue.value, useIndeterminate: false })
  }

  watchEffect(() => {
    treeValue.value = tree.value.getValue()
  })

  const PermissionTreeEditor = () => {
    // @ts-ignore
    return <RolePermission style="flex:1" tree={tree.value} onUpdate={() => {}} />
  }

  return {
    tree,
    updateNodes,
    treeValue,
    PermissionTreeEditor
  }
}

const withPopover = (el: any, code?: string) => {
  if (import.meta.env.DEV || import.meta.env.MODE === 'test') {
    return (
      <Popover
        title={
          <div style="padding:12px 12px 0 12px;">
            <div>
              <small class="color-disabled">权限编码（仅测试环境）</small>
            </div>
            <a
              onClick={() => {
                copyText(code || '')
              }}
            >
              {code}
            </a>
          </div>
        }
      >
        {renderAnyNode(el)}
      </Popover>
    )
  }
  return el
}

const RolePermission = defineComponent({
  name: 'RolePermission',
  props: {
    tree: { type: Object as PropType<PermissionTree>, required: true },
    onUpdate: { type: Function as PropType<(ids: string[]) => void>, required: true }
  },
  setup(props) {
    const apps = computed(() => props.tree.nodes)
    const current = ref(0)
    const currentApp = computed(() => apps.value[current.value])
    const routes = computed(() => currentApp.value?.children ?? [])

    return () => (
      <div class="c_role-permission">
        <div class="c_role-permission__apps">
          {apps.value.map((item, index) => {
            const node = props.tree.getNode(item.id)
            return (
              <div
                class={['app-item clickable', index === current.value && 'active']}
                onClick={() => {
                  current.value = index
                }}
              >
                <Checkbox
                  checked={node?.checked}
                  // indeterminate={node?.indeterminate}
                  onChange={() => {
                    node?.setChecked(!node.checked, useIndeterminate)
                    props.onUpdate(props.tree.getValue())
                  }}
                />
                <div class="name">{item.title}</div>
                &nbsp;
                <Icon name="right" />
              </div>
            )
          })}
        </div>
        <div class="c_role-permission__content">
          <div class="c_role-permission__header">
            <div class="c_role-permission__route">菜单／页面权限</div>
            <div class="c_role-permission__controls">功能权限</div>
            <div class="c_role-permission__data">数据权限</div>
          </div>
          <div class="c_role-permission__tree" key={currentApp.value?.id}>
            {routes.value.map((route) => (
              <RolePermissionTreeNode
                key={route.id}
                node={route}
                depth={0}
                tree={props.tree}
                onUpdate={props.onUpdate}
              />
            ))}
            <div class="c_role-permission__end">没有更多了</div>
          </div>
        </div>
      </div>
    )
  }
})

const RolePermissionTreeNode = defineComponent({
  props: {
    node: { type: Object as PropType<MenuItem>, required: true },
    depth: { type: Number, default: 0 },
    tree: { type: Object as PropType<PermissionTree>, required: true },
    onUpdate: { type: Function as PropType<(ids: string[]) => void>, required: true }
  },
  setup(props) {
    const isFold = ref(false)
    const children = computed(() => props.node?.children ?? [])
    const controls = computed(() => children.value.filter((i) => i.category === 2))
    const routes = computed(() => children.value.filter((i) => i.category !== 2))
    const nodeInstance = computed(() => props.tree.getNode(props.node.id))

    const toggle = () => {
      nodeInstance.value?.setChecked(!nodeInstance.value?.checked, useIndeterminate)
      props.onUpdate(props.tree.getValue())
    }

    return () => (
      <div class="c_role-permission__node-wrap">
        <div class="c_role-permission__node" style={{ '--depth': props.depth }}>
          <div class="c_role-permission__route">
            <div
              class={['fold-icon clickable', isFold.value && 'fold', routes.value.length === 0 && 'no-children']}
              onClick={() => {
                isFold.value = !isFold.value
              }}
            >
              <Icon name="down-fill" />
            </div>
            {withPopover(
              <div class="c_role-permission__item clickable" onClick={toggle}>
                <Checkbox
                  checked={nodeInstance.value?.checked}
                  // indeterminate={nodeInstance.value?.indeterminate}
                />
                <div class="name">{props.node.title}</div>
              </div>,
              props.node.code!
            )}
          </div>
          <div class="c_role-permission__controls">
            {controls.value.length > 0 ? (
              controls.value.map((item) => {
                const inst = props.tree.getNode(item.id)
                return withPopover(
                  <div
                    class="c_role-permission__item clickable"
                    onClick={() => {
                      inst?.setChecked(!inst?.checked, useIndeterminate)
                      props.onUpdate(props.tree.getValue())
                    }}
                  >
                    <Checkbox checked={inst?.checked} />
                    <div class="name">{item.title}</div>
                  </div>,
                  item.code
                )
              })
            ) : (
              <span class="c_role-permission__item color-disabled">-</span>
            )}
          </div>
          <div class="c_role-permission__data">
            <div class="c_role-permission__item color-disabled">全部</div>
          </div>
        </div>
        {routes.value.length > 0 && (
          <div
            class={['c_role-permission__children', isFold.value && 'fold']}
            style={{ '--children-count': routes.value.length }}
          >
            {routes.value.map((child) => (
              <RolePermissionTreeNode
                key={child.id}
                node={child}
                depth={props.depth + 1}
                tree={props.tree}
                onUpdate={props.onUpdate}
              />
            ))}
          </div>
        )}
      </div>
    )
  }
})
