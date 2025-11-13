import { PREFIX_CLS } from '@anteng/config'
import { Table } from '@anteng/ui'
import { type PropType, computed, defineComponent, onBeforeUnmount, onMounted } from 'vue'
import { ref } from 'vue'
import './styles/table.scss'
import './styles/pagination.scss'
import type { OmittedTableProps } from '.'

export type ITableSort = { key: string; order?: 'desc' | 'asc' }

export default defineComponent({
  name: '',
  props: {
    nativeProps: {
      type: Object as PropType<OmittedTableProps>,
      required: true
    },
    tableStickyTop: Number,
    defaultDescs: {
      type: String,
      default: 'createTime'
    }
  },
  emits: {
    sort: (sorter: ITableSort) => true
  },
  setup(props, { emit, slots }) {
    const containerRef = ref<HTMLElement>()
    const resizeObserver = ref<ResizeObserver>()
    const widthRef = ref(0)
    const heightRef = ref(0)

    onMounted(() => {
      resize()
      resizeObserver.value = new ResizeObserver(resize)
      resizeObserver.value.observe(containerRef.value!)
    })
    onBeforeUnmount(() => {
      resizeObserver.value?.disconnect()
      resizeObserver.value = undefined
    })
    const resize = () => {
      const width = containerRef.value!.offsetWidth
      const height = containerRef.value!.offsetHeight
      const header = containerRef.value?.querySelector(`.${PREFIX_CLS}-table-header`) as HTMLElement
      const summary = containerRef.value?.querySelector(`.${PREFIX_CLS}-table-summary`) as HTMLElement
      widthRef.value = width
      heightRef.value = height - (header?.offsetHeight ?? 0) - (summary?.offsetHeight ?? 0) - 24
    }

    const tableDefaultSortKeys = ['sort', 'createTime', 'updateTime']
    const columnsRef = computed(() => {
      return (props.nativeProps?.columns ?? [])
        .filter((item) => {
          return !item.hidden
        })
        .map((item) => {
          return {
            ...item,
            sorter: item.sorter ?? (tableDefaultSortKeys.includes((item as any).dataIndex) && true),
            sortDirections: item.sortDirections ?? ['descend', 'ascend'],
            defaultSortOrder:
              (item.defaultFilteredValue ?? (item as any).dataIndex === props.defaultDescs) ? 'descend' : undefined
          }
        })
    })

    const dataSourceRef = computed(() => {
      return props.nativeProps?.dataSource ?? []
    })

    const handleChange = (pagination: any, filters: any, sorter: any, context: any) => {
      emit('sort', {
        key: sorter.field,
        order: sorter.order === 'descend' ? 'desc' : sorter.order === 'ascend' ? 'asc' : undefined
      })
    }

    return () => {
      const { title, columns, dataSource, ...injectedProps } = props.nativeProps ?? {}
      return (
        <div class="btp__table" ref={containerRef} data-sticky-top={heightRef.value}>
          <div class="btp__table-container">
            <Table
              sticky={{
                getContainer: () =>
                  (document.querySelector('.anteng-basic-layout__router-view-content') as HTMLElement) ||
                  containerRef.value!,
                offsetHeader: (props.tableStickyTop ?? 0) + 8,
                offsetScroll: 4
              }}
              rowKey="id"
              columns={columnsRef.value as any}
              data-source={dataSourceRef.value}
              pagination={false}
              bordered
              size="large"
              {...injectedProps}
              scroll={{
                scrollToFirstRowOnChange: true,
                x: injectedProps?.scroll?.x,
                y: 100000
              }}
              onChange={handleChange}
            >
              {{ ...slots }}
            </Table>
          </div>
        </div>
      )
    }
  }
})
