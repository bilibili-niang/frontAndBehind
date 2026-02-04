// 系统页面
import { defineComponent } from 'vue'
import { $createSystemPage, $deleteSystemPage, $systemPageList, $updateSystemPage } from '../../../api'
import { Button } from '@pkg/ui'
import type { Schema } from '@pkg/core'
import { CommonSelectorPropsDefine, useCrud, useSearchTable, useTableAction, router } from '@pkg/core'
import { SCENE_YESONG } from '@pkg/config'

export default defineComponent({
  props: CommonSelectorPropsDefine,
  setup(props) {
    // 统一 CRUD 实例：创建/更新/删除
    const {
      onCreate,
      onUpdate,
      onRemove
    } = useCrud<{
      id?: string;
      key: string;
      title: string;
      description?: string
    }>({
      title: '系统页面',
      schema: (type: 'create' | 'update'): Schema => ({
        type: 'object',
        properties: {
          key: {
            title: '页面标识', type: 'string',
            required: true
          },
          title: {
            title: '页面标题', type: 'string',
            required: true
          },
          description: {
            title: '描述',
            type: 'string',
            widget: 'textarea'
          }
        },
        required: type === 'create' ? ['key', 'title'] : []
      }),
      // 前端不再提供默认的编辑用户
      retrieve: (row: any) => ({
        id: row.id,
        key: row.key,
        title: row.title ?? row.name,
        description: row.description
      }),
      format: (v) => {
        const payload: any = {
          scene: SCENE_YESONG,
          key: (v as any).key,
          title: (v as any).title,
          description: (v as any).description
        }
        return payload
      },
    })

    const { Table, refresh } = useSearchTable({
      title: '系统页面列表',
      customRequest: (params: any) => $systemPageList({ ...params, scene: SCENE_YESONG }),
      toolbar: (() => {
        return (
          <div class="flex">
            <Button type="primary" onClick={() => {
              onCreate(data => $createSystemPage(data), refresh)
            }}>
              新建页面
            </Button>
          </div>
        )
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
            width: 180
          },
          {
            title: '关键字',
            dataIndex: 'key',
            width: 100
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
                      title: '装修页面',
                      onClick: () => {
                        // 跳转到系统页面装修编辑器，使用查询参数传递页面ID
                        router.push(`/decoration/systempage/decorate?id=${record.id}`)
                      }
                    },
                    {
                      title: '编辑',
                      onClick: () => {
                        onUpdate(record, data => {
                          return $updateSystemPage(record.id!, data)
                        }, refresh)
                      }
                    },
                    {
                      title: '删除',
                      type: 'danger',
                      onClick: () => onRemove(() => $deleteSystemPage(record.id), () => refresh())
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
