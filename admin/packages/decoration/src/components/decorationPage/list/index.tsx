// 自定义装修页面列表
import './index.scss'
import { defineComponent } from 'vue'
import { SCENE_YESONG } from '@anteng/config'
import { $decorationList, $deleteDecorationPage } from '../../../api/decoration'
import { CommonSelectorPropsDefine, router, useSearchTable, useTableAction } from '@anteng/core'
import { Button } from '@anteng/ui'
import { commonDelete } from '@anteng/utils'
import { useDecorationStore } from '../../../store'

export default defineComponent({
  props: CommonSelectorPropsDefine,
  setup(props) {
    // 统一使用 @anteng/core 导出的 router 实例
    if (import.meta.env.VITE_APP_SCENE === SCENE_YESONG) {
      // 也宋,获取也宋的装修列表
      console.log('当前是也宋的装修列表')
    }

    const store = useDecorationStore()
    const { Table, refresh } = useSearchTable({
      title: '自定义装修列表',
      // 统一向后端传 scene；分页与筛选参数由 useSearchTable 传递
      customRequest: (params: any) => {
        const scene = import.meta.env.VITE_APP_SCENE || SCENE_YESONG
        return $decorationList({ ...params, scene })
      },
      toolbar: (() => {
        return <div class="flex">
          <Button
            type="primary"
            onClick={() => {
              // 新建前先清理编辑态
              store.reset()
              // 新建时清空当前编辑页面ID，并跳转到装修页
              store.setCurrentPageId(null)
              router.push('/decoration/new')
            }}>
            新建页面
          </Button>
        </div>
      })(),
      filter: {
        list: [
          {
            key: 'name',
            label: '页面名称',
            type: 'input',
            fixed: true
          }
        ]
      },
      table: {
        columns: [
          {
            title: '页面名称',
            dataIndex: 'name',
            width: 100
          },
          {
            title: '编辑用户',
            dataIndex: 'editUser',
            width: 120
          },
          {
            title: '创建时间',
            dataIndex: 'createTime'
          },
          {
            title: '更新时间',
            dataIndex: 'updateTime'
          },
          {
            title: '操作',
            dataIndex: 'action',
            align: 'center',
            fixed: 'right',
            customRender: ({ record }) => {
              if (props.asSelector) {
                return useTableAction({
                  list: [
                    {
                      title: '选择',
                      type: 'default',
                      onClick: () => {
                        props.onSelect(record)
                      }
                    }
                  ]
                })
              } else {
                return useTableAction({
                  list: [
                    {
                      title: '编辑',
                      type: 'default',
                      onClick: () => {
                        // 编辑前先清理旧状态
                        store.reset()
                        // 记录当前编辑页面ID，跳转到装修编辑页
                        store.setCurrentPageId(record.id)
                        router.push(`/decoration/new?id=${record.id}`)
                      }
                    },
                    {
                      title: '删除',
                      type: 'danger',
                      onClick: () =>
                        commonDelete(
                          { id: record.id, name: record.name },
                          (id: string) => $deleteDecorationPage(id),
                          () => refresh()
                        )
                    }
                  ]
                })
              }
            }
          }
        ]
      }

    })

    return () => {
      return Table
    }
  }
})
