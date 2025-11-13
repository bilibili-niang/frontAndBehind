// 小程序导航装修列表
import { defineComponent } from 'vue'
import { Button, message, Tag } from '@anteng/ui'
import { COMMON_STATUS_ON, useSearchTable, useTableAction } from '@anteng/core'
import { $deleteNavigation, $navigationList, $updateNavigation } from '../../../api'
import { SCENE_YESONG, STATUS_OPTIONS } from '@anteng/config'
import { createNavigation, updateNavigation } from './modal'
import { commonDelete } from '@anteng/utils'

export default defineComponent({
  setup() {
    const { Table, refresh } = useSearchTable({
      title: '导航管理',
      customRequest: p => {
        return $navigationList({
          ...p,
          scene: SCENE_YESONG
        })
      },
      toolbar: (() => {
        return <div class="flex">
          <Button
            type="primary"
            onClick={() => {
              createNavigation(refresh)
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
            title: '状态',
            dataIndex: 'status',
            customRender: ({ text }) => {
              return <Tag
                color={
                  STATUS_OPTIONS.find(item => item.value === text)?.color
                }
              >
                {STATUS_OPTIONS.find(item => item.value === text)?.label}
              </Tag>
            }
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
            customRender: ({ text, record }) => {
              return useTableAction({
                list: [
                  {
                    title: '编辑',
                    type: 'default',
                    onClick: () => {
                      updateNavigation(record.id, refresh)
                    }
                  },
                  {
                    title: '开启',
                    disabled: record.status == COMMON_STATUS_ON,
                    onClick: async () => {
                      try {
                        const res = await $updateNavigation(
                          record.id,
                          {
                            status: COMMON_STATUS_ON,
                            scene: SCENE_YESONG
                          }
                        )
                        if (res?.success || res?.code === 200) {
                          message.success(res?.msg || '开启成功')
                          refresh()
                        } else {
                          message.error(res?.msg || '开启失败')
                        }
                      } catch (err: any) {
                        message.error(err?.message || '开启失败')
                      }
                    }
                  },
                  {
                    title: '删除',
                    type: 'danger',
                    onClick: () =>
                      commonDelete(
                        { id: record.id, name: record.name },
                        (id: string) => $deleteNavigation(id),
                        refresh
                      )
                  },
                ]
              })
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
