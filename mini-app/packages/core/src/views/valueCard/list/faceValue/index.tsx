// 面值widget
import './style.scss'
import { defineComponent, ref } from 'vue'
import { CommonWidgetPropsDefine } from '@anteng/jsf'
import { Button, message, Table, Input, InputNumber, Icon, Popconfirm } from '@anteng/ui'
import { useTableAction } from '@anteng/core'
import { cloneDeep } from 'lodash'
import { checkObject } from '@/utils'

export default defineComponent({
  name: 'FaceValueWidget',
  props: CommonWidgetPropsDefine,
  emits: [''],
  setup(props, { emit }) {
    const tempList = ref([])
    const editRow = ref({
      isEditor: false,
      row: 0
    })
    // 是否在编辑最后一行
    const isEditLastLine = ref(false)
    const init = () => {
      if (props.value) {
        // 不论需不需要,拷贝一遍
        tempList.value = cloneDeep(props.value)
      }
    }
    const columns = [
      {
        title: <div class="isRequired">面值(元)</div>,
        dataIndex: 'parValue',
        width: 120
      },
      {
        title: <div class="isRequired">售价(元)</div>,
        width: 120,
        dataIndex: 'salePrice'
      },
      {
        title: '划线价(元)',
        width: 120,
        dataIndex: 'dashPrice'
      },
      {
        title: <div class="isRequired">库存</div>,
        width: 120,
        dataIndex: 'stock'
      },
      {
        title: '操作',
        width: 120,
        dataIndex: 'action',
        fixed: 'right'
      }
    ]
    init()

    // 添加面值
    const add = () => {
      const lastRow = tempList.value[tempList.value.length - 1]
      // 需要判断最后一行是否为空或者没有填写完整,否则不添加
      tempList.value.push({
        parValue: '',
        salePrice: '',
        dashPrice: '',
        stock: ''
      })
      isEditLastLine.value = true
    }

    return () => {
      return (
        <div class="FaceValueWidget">
          <div class="top-button-content">
            <Button
              type="primary"
              onClick={() => {
                add()
              }}
            >
              添加面值
            </Button>
          </div>
          <Table bordered pagination={false} columns={columns} dataSource={tempList.value}>
            {{
              bodyCell: ({ column, index }) => {
                const isLast = index === tempList.value.length - 1

                if (column.dataIndex === 'action') {
                  // 如果是在编辑最后一行并且是编辑最后一行的模式下
                  if (isLast && isEditLastLine.value) {
                    return useTableAction({
                      list: [
                        {
                          title: '完成',
                          onClick: () => {
                            const lastItem = tempList.value[index]
                            // 需要进行判断的item数据
                            const judgeItemData = cloneDeep(lastItem)
                            // 部分属性无需判断 操作列,划线价
                            delete judgeItemData.action
                            delete judgeItemData.dashPrice
                            if (!checkObject(judgeItemData)) {
                              message.info('必填字段不能为空')
                              // 有不允许为空的字段是空的,则移除此行
                              tempList.value.pop()
                            }
                            isEditLastLine.value = false
                          }
                        }
                      ]
                    })
                    // 在编辑模式下且为指定的编辑行
                  } else if (editRow.value.isEditor && index === editRow.value.row) {
                    // 如果是在编辑指定行
                    return useTableAction({
                      list: [
                        {
                          title: '完成',
                          onClick: () => {
                            const editItem = tempList.value[index]
                            const judgeItemData = cloneDeep(editItem)
                            // 部分属性无需判断 操作列,划线价
                            delete judgeItemData.action
                            delete judgeItemData.dashPrice
                            if (!checkObject(judgeItemData)) {
                              message.info('必填字段不能为空')
                              // 有不允许为空的字段是空的,则移除此行
                              tempList.value.splice(index, 1)
                            }
                            editRow.value.isEditor = false
                          }
                        }
                      ]
                    })
                  }

                  return useTableAction({
                    list: [
                      {
                        title: '编辑',
                        onClick: () => {
                          editRow.value = {
                            isEditor: true,
                            row: index
                          }
                        }
                      },
                      {
                        title: (
                          <Popconfirm
                            title={`确定要删除吗？`}
                            okText="删除"
                            okButtonProps={{ danger: true }}
                            cancelText="取消"
                            overlayInnerStyle={{ padding: '8px 12px' }}
                            onConfirm={() => {
                              // 移除
                              tempList.value.splice(index, 1)
                            }}
                          >
                            删除
                          </Popconfirm>
                        ),
                        onClick: () => {}
                      }
                    ]
                  })
                } else {
                  if ((isLast && isEditLastLine.value) || (editRow.value.isEditor && index === editRow.value.row)) {
                    // 为最后一行
                    return (
                      <InputNumber
                        min={0}
                        v-model:value={tempList.value[index][column.dataIndex]}
                        onChange={(e) => {
                          props.onChange(tempList.value)
                        }}
                      />
                    )
                  }
                }
              }
            }}
          </Table>
        </div>
      )
    }
  }
})
