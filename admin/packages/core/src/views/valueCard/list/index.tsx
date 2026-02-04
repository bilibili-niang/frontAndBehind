// 储值卡列表
import { defineComponent, onMounted, ref } from 'vue'
import { CommonSelectorPropsDefine, useSearchTable, useTableImages } from '@pkg/core'
import { Button, Switch } from '@pkg/ui'
import { COMMON_STATUS_ON, COMMON_STATUS_OPTIONS } from '@pkg/config'
import { $getValueCardList } from '../../../api/valueCard'

export default defineComponent({
  name: 'ValueCardList',
  props: CommonSelectorPropsDefine,
  title: '储值卡管理',
  setup(props) {
    const venueOptionsLoading = ref(false)
    const getVenues = () => {
      venueOptionsLoading.value = true
    }

    onMounted(() => {
      getVenues()
    })

    const customCell = (record: any) => {
      if (record.$index === 0) {
        return { rowSpan: record.cardFaceValue?.length || 1 }
      }
      return {
        rowSpan: 0
      }
    }

    const {
      Table: valueCardTable,
      refresh
    } = useSearchTable({
      title: '储值卡列表',
      customRequest(params) {
        return $getValueCardList(params)
      },
      filter: {
        list: [
          { key: 'templateId', label: '模板ID', type: 'input', fixed: true, flex: 4 },
          { key: 'name', label: '储值卡名称', type: 'input', fixed: true, flex: 4 },
          {
            key: 'status',
            label: '状态',
            type: 'select',
            fixed: true,
            config: {
              options: COMMON_STATUS_OPTIONS
            },
            flex: 4
          }
        ]
      },
      dataSourceFormat(dataSource) {
        return dataSource.flatMap((item) => {
          return item.cardFaceValue.map((faceValueItem: any, i) => {
            return {
              ...item,
              $card: faceValueItem,
              $index: i
            }
          })
        })
      },
      table: {
        columns: [
          {
            dataIndex: 'templateId',
            title: '模板ID',
            width: 150,
            customCell
          },
          {
            dataIndex: 'name',
            title: '储值卡名称',
            width: 120,
            customCell
          },
          {
            dataIndex: 'images',
            title: '卡面',
            width: 80,
            customCell,
            customRender: ({ record }) => {
              return useTableImages(record.images)
            }
          },
          {
            title: '面值',
            width: 80,
            customRender({ record }) {
              return (
                <div>
                  <strong>&yen;{record.$card.parValue / 100}</strong>
                </div>
              )
            }
          },
          {
            title: '售价',
            width: 130,
            customRender({ record }) {
              return (
                <div>
                  <strong>&yen;{record.$card.salePrice / 100}</strong>
                  {/* 划线价 */}
                  {record.$card.dashPrice > record.$card.salePrice && (
                    <span style="text-decoration: line-through; color: #999; margin-left: 4px;">
                      &nbsp;&yen;{record.$card.dashPrice / 100}
                    </span>
                  )}
                </div>
              )
            }
          },
          {
            dataIndex: 'stock',
            title: '库存',
            width: 80,
            customRender: ({ record }) => {
              return <div>{record.$card.stock === -1 ? '不限' : record.$card.stock}</div>
            }
          },
          {
            dataIndex: 'soldNum',
            title: '已售',
            width: 80,
            customRender: ({ record }) => {
              return <div>-</div>
            }
          },

          {
            title: '更新用户',
            dataIndex: 'userPhone',
            width: 120,
            customCell
          },
          {
            title: '更新时间',
            dataIndex: 'updateTime',
            width: 180,
            customCell
          },
          {
            dataIndex: 'status',
            title: '状态',
            fixed: 'right',
            width: 80,
            customCell,
            customRender: ({ record }) => <Switch checked={record.status === COMMON_STATUS_ON} disabled />
          },
          {
            title: '操作',
            dataIndex: 'title',
            width: 100,
            fixed: 'right',
            customCell,
            customRender: ({ record }) => {
              if (props.asSelector) {
                return (
                  <Button
                    type="primary"
                    onClick={() => {
                      props.onSelect(record)
                    }}
                  >
                    选择
                  </Button>
                )
              }
            }
          }
        ]
      }
    })
    return () => <div class="valueCardList">{valueCardTable}</div>
  }
})
