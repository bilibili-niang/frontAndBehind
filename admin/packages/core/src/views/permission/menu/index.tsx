import { defineComponent, ref, onMounted } from 'vue'
import { useSearchTable, useTableAction } from '../../../components/search-table'
import { Button, Tag, message } from '@pkg/ui'
import { commonDelete } from '@pkg/utils'
import {
  getMenuList,
  createMenu,
  updateMenu,
  deleteMenu,
  type Menu,
  type CreateMenuData
} from '../../../api/permission'
import { onCreate, onUpdate } from './modal'

export default defineComponent({
  name: 'PermissionMenu',
  setup() {
    const menuList = ref<Menu[]>([])

    const loadMenus = async () => {
      try {
        const res = await getMenuList()
        menuList.value = res
      } catch (err) {
        message.error('获取菜单列表失败')
      }
    }

    onMounted(() => {
      loadMenus()
    })

    const {
      Table,
      refresh
    } = useSearchTable({
      title: '菜单管理',
      customRequest: () => {
        return getMenuList().then(res => ({
          list: res,
          total: res.length
        }))
      },
      toolbar: (
        <Button
          type="primary"
          v-permission="button:menu:create"
          onClick={() => {
            onCreate(async (data: CreateMenuData) => {
              await createMenu(data)
              refresh()
            }, menuList.value)
          }}
        >
          添加菜单
        </Button>
      ),
      table: {
        columns: [
          {
            title: '菜单名称',
            dataIndex: 'name',
            width: 150
          },
          {
            title: '路径',
            dataIndex: 'path',
            width: 200
          },
          {
            title: '组件',
            dataIndex: 'component',
            width: 200,
            ellipsis: true
          },
          {
            title: '图标',
            dataIndex: 'icon',
            width: 100
          },
          {
            title: '权限标识',
            dataIndex: 'permission',
            width: 150
          },
          {
            title: '排序',
            dataIndex: 'sort',
            width: 80
          },
          {
            title: '隐藏',
            dataIndex: 'hidden',
            width: 80,
            customRender: ({ text }) => {
              return text ? <Tag color="orange">是</Tag> : <Tag>否</Tag>
            }
          },
          {
            title: '缓存',
            dataIndex: 'keepAlive',
            width: 80,
            customRender: ({ text }) => {
              return text ? <Tag color="blue">是</Tag> : <Tag>否</Tag>
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
                    vPermission: 'button:menu:update',
                    onClick: () => {
                      onUpdate(
                        record,
                        async (data: Partial<CreateMenuData>) => {
                          await updateMenu(record.id, data)
                          refresh()
                        },
                        menuList.value
                      )
                    }
                  },
                  {
                    title: '删除',
                    type: 'danger',
                    vPermission: 'button:menu:delete',
                    onClick: () => {
                      commonDelete(
                        { id: record.id, name: record.name },
                        (id: string) => deleteMenu(id),
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
      <div class="permission-menu">
        {Table}
      </div>
    )
  }
})
