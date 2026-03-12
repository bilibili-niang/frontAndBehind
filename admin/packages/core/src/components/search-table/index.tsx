import './styles/style.scss'

import {
  computed,
  defineComponent,
  getCurrentInstance,
  type HTMLAttributes,
  onActivated,
  onBeforeUnmount,
  onMounted,
  onUnmounted,
  type PropType,
  reactive,
  type Ref,
  ref,
  type SlotsType,
  watch,
  withModifiers
} from 'vue'

import type { TableProps } from '@pkg/ui'
import { Button, Checkbox, Icon, message, Modal, Pagination, TableSummary, Tooltip } from '@pkg/ui'
import Filter, { type FilterDefine } from './filter'
import Table, { type ITableSort } from './table'
import request, { type ResponsePaginationData } from '../../api/request'
import { PREFIX_CLS } from '@pkg/config'
import emitter from '../../utils/emitter'
import { snakeCase } from 'lodash'
import { getSimpleText, withImageResize } from '../../utils'
import uuid from '../../utils/uuid'
import Spin from '../spin'
import { useRequestErrorMessage } from '../../hooks/useRequestErrorMessage'
import useMapView from '../../hooks/useMapView'
import useBasicLayoutStore from '../../stores/basic-layout'
import { type ComputedValue, useComputedValue } from '../../hooks/useComputedValue'
import useModal from '../../hooks/useModal'
import { useRoute } from 'vue-router'
import { renderAnyNode } from '@pkg/utils'
import { getColumnWidth } from './utils'
import usePermissionStore from '../../stores/permission'

export type OmittedTableProps = Omit<TableProps<any>, 'columns'> &
  HTMLAttributes & { columns?: (Exclude<TableProps<any>['columns'], undefined>[number] & { hidden?: boolean })[] } // 拓展 hidden 属性，支持隐藏

export interface SearchTableConfig {
  /** 表格的key，全局唯一 */
  key?: string
  className?: string
  /** 表格标题 */
  title?: any
  titleBehind?: any
  /** 工具栏 */
  toolbar?: any
  /** 隐藏工具栏：适用于选择器控件场景 */
  toolbarHidden?: boolean
  filterFront?: any
  filterBehind?: any
  /** 过滤器定义 */
  filter?: ComputedValue<FilterDefine>
  dataSourceFormat?: (dataSource: any[]) => any[]
  /** 表格配置参数，继承自 Antd Table 组件 */
  table?: OmittedTableProps | ComputedValue<OmittedTableProps>
  customTable?: (dataSource: any[], options: { loading: boolean }) => any
  /** 请求地址（或customRequest，至少存在一个） */
  requestURL?: string
  /** 导出地址 */
  exportURL?: string
  // 默认降序字段，默认 create_time
  defaultDescs?: string
  /** 自定义请求（或requestURL，至少存在一个） */
  customRequest?: (params: RequestParams) => Promise<unknown>
  /** 拦截请求 */
  onInterceptRequest?: (params: RequestParams) => RequestParams
  /** 拦截响应 */
  onInterceptResponse?: <T>(response: ResponsePaginationData<T>) => ResponsePaginationData<T>
  /** 重置时触发 */
  onReset?: () => void
  props?: Record<string, any>
  footer?: () => any

  onActivated?: () => void

  initialSize?: number
  /* 是否开启多选,如果传入了function,那么在选择时会触发该方法 */
  multiple?: () => any
  /* 多选时 */
  multipleValue?: any
}

type RequestParams = {
  /** 当前页码，默认 1 */
  current: number
  /** 分页尺寸 */
  size: number
  /** 排序字段key */
  ascs?: string
  /** 排序规则 asc升序，desc降序 */
  descs?: string
  /** 过滤字段key: 过滤值 */
  [filterKey: string]: any
}

const SearchTable = defineComponent({
  name: 'SearchTable',
  props: {
    tableKey: { type: String },
    dataRef: {},
    toolbar: {},
    toolbarHidden: {
      type: Boolean
    },
    title: {},
    titleBehind: {},
    filter: {
      type: Object as PropType<ComputedValue<FilterDefine>>
    },
    filterFront: {},
    filterBehind: {},
    requestURL: {
      type: String
    },
    exportURL: {
      type: String
    },
    customRequest: {
      type: Function
    },
    defaultDescs: {
      type: String
    },
    table: {
      type: Object as PropType<ComputedValue<OmittedTableProps>>,
      default: () => computed({} as any)
    },
    customTable: {},
    dataSourceFormat: {
      type: Function
    },
    footer: {
      type: Function
    },
    rowSelection: {
      type: Object,
      default: () => ({})
    },
    filterCompRef: {
      type: Object as PropType<Ref>
    },
    onInterceptRequest: {
      type: Function as PropType<(params: RequestParams) => RequestParams>
    },
    onInterceptResponse: {
      type: Function as PropType<<T>(response: ResponsePaginationData<T>) => ResponsePaginationData<T>>
    },
    initialSize: {
      type: Number,
      default: 20
    },
    /*
     * 如果开启,会在最后一列添加多选框
     * */
    multiple: {
      type: Function
    },
    // 多选选中的值,是个响应式的
    multipleValue: {
      type: Object,
      default: () => ({ value: [] })
    }
  },
  slots: Object as SlotsType<{
    default: any
    title: any
    titleBehind: any
    toolbar: any
    filterFront: any
    filterBehind: any
  }>,
  emits: {
    reset: () => true
  },
  setup(props, { emit, attrs, slots }) {
    const isLoading = ref(false)
    const dataSourceRef = ref([])

    // 如果开启了多选,则引入指定的样式文件
    if (props?.multiple) {
      console.log('开启了多选!')
      import('../../components/search-table/styles/expansionStyle.scss')
    }

    const dataSource = computed(() => {
      try {
        return props.dataSourceFormat?.(dataSourceRef.value) ?? dataSourceRef.value
      } catch {
        return dataSourceRef.value
      }
    })
    const filterRef = useComputedValue(props.filter || { list: [] })
    const filterComp = props.filterCompRef ?? ref()

    const pagination = reactive({
      size: props.initialSize ?? 20,
      current: 1,
      total: 0
    })
    const tableRef = ref()
    const successRef = ref(false)
    const errorRef = ref(false)
    const sorterRef = ref<{
      descs?: string
      ascs?: string
    }>({
      descs: props.defaultDescs ?? 'create_time',
      ascs: undefined
    })

    let requestParamsTemp: any = {}
    let lastParams: any = {}
    const fetchData = (params = lastParams) => {
      lastParams = params
      if (!props.requestURL && !props.customRequest) {
        message.warning('请设置 requestURL 或 customRequest')
        return Promise.reject()
      }
      if (!silent.value) {
        isLoading.value = true
      }
      try {
        const onResolveHandler = (res: any) => {
          props.onInterceptResponse?.(res.data)

          try {
            if (props.onInterceptResponse) {
              res.data = props.onInterceptResponse(res.data)
            }
          } catch (err) {
            console.log(err)
          }

          successRef.value = true
          errorRef.value = false
          if (res.message) {
            message.success(res.message)
          }
          isLoading.value = false

          if (Array.isArray(res.data)) {
            dataSourceRef.value = res.data
          } else {
            try {
              dataSourceRef.value = res.data.records
              pagination.total = res.data.total
              pagination.size = res.data.size
              pagination.current = res.data.current
            } catch (err) {
              dataSourceRef.value = []
              pagination.total = 0
            }
          }
          try {
            const dataRef: any = props.dataRef
            dataRef.value = dataSourceRef.value
          } catch (err) {
            err
          }

          // 数据更新后表格自动滚动到顶部
          try {
            if (tableRef.value?.$el && !silent.value) {
              tableRef.value.$el.querySelector(`.${PREFIX_CLS}-table-body`).scrollTop = 0
            }
          } catch (err) {
            console.log(err)
          }
        }
        const onErrorHandler = (err: any) => {
          errorRef.value = true
          successRef.value = false
          dataSourceRef.value = []
          useRequestErrorMessage(err)
          isLoading.value = false
        }

        let requestParams = {
          current: pagination.current,
          size: pagination.size,
          // ascs: undefined,
          // descs: undefined,
          ...sorterRef.value,
          ...params
        }

        if (props.onInterceptRequest) {
          try {
            requestParams = props.onInterceptRequest(requestParams)
          } catch (err) {
            console.log(err)
          }
        }

        requestParamsTemp = requestParams

        if (props.customRequest) {
          try {
            return props.customRequest(requestParams).then(onResolveHandler).catch(onErrorHandler)
          } catch (e) {
            console.log('e:')
            console.log(e)
          }
        } else {
          return request<{ message: string }, { message: string }>({
            url: props.requestURL,
            method: 'get',
            params: requestParams
          })
            .then(onResolveHandler)
            .catch(onErrorHandler)
        }
      } catch (err) {
        isLoading.value = false
      }
    }

    const onSearch = (payload: Record<string, any>) => {
      pagination.current = 1
      fetchData({ ...payload })
    }

    emitter.off(`SearchTableRefresh:${props.tableKey}`)
    emitter.off(`SearchTableSilentRefresh:${props.tableKey}`)
    emitter.on(`SearchTableRefresh:${props.tableKey}`, () => {
      fetchData()
    })

    const silent = ref(false)
    emitter.on(`SearchTableSilentRefresh:${props.tableKey}`, async () => {
      silent.value = true
      await fetchData()
      silent.value = false
    })

    emitter.off(`SearchTableReload:${props.tableKey}`)
    emitter.on(`SearchTableReload:${props.tableKey}`, () => {
      pagination.current = 1
      fetchData()
    })

    onBeforeUnmount(() => {
      emitter.off(`SearchTableRefresh:${props.tableKey}`)
      emitter.off(`SearchTableSilentRefresh:${props.tableKey}`)
      emitter.off(`SearchTableReload:${props.tableKey}`)
    })

    const onPaginationChange = (page: number, size: number) => {
      pagination.current = page
      pagination.size = size
      fetchData(filterComp.value.getFilterState())
    }

    // 改为由 Filter 触发，有需要再调整
    // onMounted(fetchData)

    const handleSort = (sorter: ITableSort) => {
      sorterRef.value = { descs: undefined, ascs: undefined }
      if (sorter.order) {
        sorterRef.value[sorter.order === 'desc' ? 'descs' : 'ascs'] = snakeCase(sorter.key)
      }
      fetchData()
    }

    const handleExport = () => {
      const msgId = uuid()
      message.loading({ key: msgId, content: '请求创建导出任务中...' })

      const { current, size, ...exportParams } = requestParamsTemp

      const exportURL = props.exportURL ? props.exportURL : props.requestURL?.replace(/(\?.*)?$/, '/export$1')

      request({
        url: exportURL,
        method: 'get',
        params: { ...exportParams, ...filterComp.value.getFilterState() }
      })
        .then((res: any) => {
          if (res.code === 200) {
            message.success({ key: msgId, content: res.msg || '已创建导出任务' })
            emitter.emit('refreshTaskCount')
          } else {
            message.error({ key: msgId, content: '该表格不支持导出' })
          }
        })
        .catch((err) => {
          message.error({ key: msgId, content: '该表格不支持导出' })
        })
    }
    const isFullScreen = ref(false)

    const isRouteComponent = () => {
      const instance = getCurrentInstance()
      // 检查组件实例是否有 $route 和 $router 属性
      return (
        instance &&
        instance.appContext.config.globalProperties.$route !== undefined &&
        instance.appContext.config.globalProperties.$router !== undefined
      )
    }

    // 仅作为页面组件时才使用菜单栏对应标题
    const a = isRouteComponent()
      ? useBasicLayoutStore().flatenSideMenus.find((item) => item.path === useRoute()?.path)
      : undefined
    // 计算表单列
    const computedColumns = computed(() => {
      // @ts-ignore
      let tempColumn = (props.table?.columns || props.table?.value?.columns || []).map((column) => {
        return {
          ...column,
          customRender: column.customRender
            ? (...args: any[]) => {
              try {
                return column.customRender(...args)
              } catch (err) {
                console.log(err)
                return null
              }
            }
            : undefined
        }
      })

      // 表单多选功能
      if (props?.multiple) {
        tempColumn = [
          {
            dataIndex: 'selection',
            title: '选择',
            width: 80,
            align: 'center',
            customRender: (value: { record: { id: string }; index: number; renderIndex: number; column: object }) => {
              return (
                <Checkbox
                  checked={props.multipleValue.value.includes(value.record.id)}
                  onChange={(e) => {
                    props!.multiple(value)
                  }}
                  style="transform:scale(1.5)"
                />
              )
            }
          },
          ...tempColumn
        ]

        // 多选模式下隐藏“操作”列（兼容常见 key/dataIndex）
        tempColumn = tempColumn.filter((col: any) => {
          const titleText = typeof col.title === 'string' ? col.title : ''
          const key = col.key
          const dataIndex = col.dataIndex
          // 如果列本身声明了 hidden，则也遵循隐藏
          if (col.hidden) return false
          return !(titleText === '操作' || key === 'actions' || dataIndex === 'actions')
        })
      }

      // 表单多选功能 end

      // 表单列宽度自适应 如果不想使用 getColumnWidth ,那直接返回 tempColumn 即可
      return getColumnWidth(tempColumn, dataSource.value)
    })

    // 当前页面是否开启多选且该页面所有的id是否在props.multipleValue.value中
    const isAllChecked = computed(() => {
      if (!props.multiple) {
        return false
      } else {
        return dataSource.value.length == props.multipleValue.value.length
      }
    })

    /*
     * 表单开启多选时footer应该是强制使用多选状态下的footer
     * */
    const footerComputed = computed(() => {
      if (props.multiple) {
        return (
          <div class="multiple-footer">
            <div class="check-all">
              <Checkbox
                style="transform:scale(1.5)"
                onChange={(e) => {
                  // 提交本页所有数据
                  props!.multiple(dataSource.value)
                }}
                checked={isAllChecked.value}
                // indeterminate={indeterminate}
              />
              &ensp; 全选本页： {props.multipleValue.value.length}／{dataSource.value?.length} 个
            </div>
            {/*            <div>
              本次将添加 {props.multipleValue.value.length} 个，删除 {removedGoodsId.value.length} 个&emsp;
            </div>*/}
            <Button
              type="primary"
              onClick={() => {
                // 外界判断该字符串是否是 over 来表示管理弹窗
                props!.multiple('over')
              }}
            >
              完成添加
            </Button>
          </div>
        )
      } else {
        return props?.footer?.()
      }
    })

    const headerRef = ref<HTMLElement>()
    const tableStickyTop = ref(0)
    const onHeaderResize: ResizeObserverCallback = (e) => {
      const el = e[0]
      tableStickyTop.value = el.contentRect.height + (parseInt(getComputedStyle(el.target).marginBottom) || 0)
    }
    const o = new ResizeObserver(onHeaderResize)

    const tableMaxWidth = ref(10000)
    const calcMaxWidth = () => {
      const rect = headerRef.value?.getBoundingClientRect()
      tableMaxWidth.value = document.documentElement.offsetWidth - rect!.left - 0
    }
    const wo = new ResizeObserver(calcMaxWidth)

    onMounted(() => {
      calcMaxWidth()
      try {
        const target =
          document.querySelector('.ice-basic-layout__router-view-content') ||
          document.querySelector('.main-scroll .ui-scrollbar')
        if (target) {
          wo.observe(target)
        } else {
          console.warn('Router content container not found for ResizeObserver')
          // 兜底：观察视口根元素尺寸变化，并监听窗口大小变化
          try {
            wo.observe(document.documentElement)
          } catch {}
          window.addEventListener('resize', calcMaxWidth)
        }
      } catch (e) {
        console.log('e:')
        console.log(e)
      }
    })

    watch(
      () => headerRef.value,
      () => {
        o.disconnect()
        if (headerRef.value) {
          o.observe(headerRef.value)
        }
      }
    )

    onUnmounted(() => {
      o.disconnect()
      wo.disconnect()
      window.removeEventListener('resize', calcMaxWidth)
    })

    return () => {
      const title =
        (slots.title?.(a?.meta?.title) ?? typeof props.title === 'function')
          ? (props.title as Function)(a?.meta?.title)
          : props.title
      return (
        <div
          class={['base-table-page-container', isFullScreen.value && 'fullscreen']}
          onContextmenu={() => {
            // console.log('表单计算出来的列')
            // console.log(computedColumns.value)
          }}
        >
          <div
            class="base-table-page"
            style={{
              '--table-sticky-top': `${tableStickyTop.value}px`,
              maxWidth: `${tableMaxWidth.value}px`
            }}
          >
            <div class="btp__header" ref={headerRef}>
              {!props.toolbarHidden && (
                <div class="btp__toolbar">
                  <h2 key="title">
                    {title && (a?.meta?.title || title)}&emsp;
                    {renderAnyNode(props.titleBehind) ?? slots.titleBehind?.()}
                  </h2>

                  <div class="btp__toolbar-content">{slots.toolbar?.() ?? props.toolbar}</div>
                  <div class="btp__toolbar-split"/>
                  <div class="btp__settings">
                    {/*<div class="btp__setting-btn clickable" onClick={handleExport}>*/}
                    <div
                      class={['btp__setting-btn clickable btp__export-button', props.exportURL && 'custom-export']}
                      onClick={handleExport}
                    >
                      <Icon name="download"/>
                      <span>导出</span>
                    </div>
                    <div
                      class={['btp__setting-btn clickable', isFullScreen.value && 'active']}
                      onClick={() => (isFullScreen.value = !isFullScreen.value)}
                    >
                      <Icon name="full-screen"></Icon>
                      <span>{isFullScreen.value ? '退出全屏' : '全屏'}</span>
                    </div>
                    <div class="btp__setting-btn disabled" onClick={() => message.info('设置表格，暂未支持')}>
                      <Icon name="settings"></Icon>
                      <span>设置</span>
                    </div>
                  </div>
                </div>
              )}
              {renderAnyNode(props.filterFront) ?? slots.filterFront?.()}
              {filterRef.value && (
                <Filter
                  ref={filterComp}
                  filter={filterRef.value}
                  onSearch={onSearch}
                  onReset={() => {
                    emit('reset')
                  }}
                  defaultState={filterRef.value?.default ?? {}}
                />
              )}
              {renderAnyNode(props.filterBehind) ?? slots.filterBehind?.()}
              <div class="btp__footer">
                {isLoading.value ? (
                  <strong class="btp__summary">正在查找中，请稍候...</strong>
                ) : successRef.value ? (
                  <strong class="btp__summary">
                    <Icon class="color-success" name="ok-bold" style="margin-right:4px;"></Icon>
                    <span>共查找到 {pagination.total || dataSourceRef.value.length} 条数据</span>
                    {dataSource.value.length > 1 ? (
                      <span>
                        ，当前第 {(pagination.current - 1) * pagination.size + 1} ~{' '}
                        {(pagination.current - 1) * pagination.size + dataSource.value.length} 条
                      </span>
                    ) : (
                      pagination.total > 0 && `，当前第 ${(pagination.current - 1) * pagination.size + 1} 条`
                    )}
                  </strong>
                ) : errorRef.value ? (
                  <div class="btp__error">
                    <Icon name="error-bold"></Icon>
                    <strong>抱歉，出现了错误，请稍后重试。</strong>
                  </div>
                ) : (
                  ''
                )}

                <Pagination
                  showLessItems
                  pageSize={pagination.size}
                  current={pagination.current}
                  total={pagination.total}
                  showQuickJumper
                  showSizeChanger
                  onChange={onPaginationChange}
                />
              </div>
            </div>
            {(props.customTable as any)?.(dataSource.value, { loading: isLoading.value }) ?? (
              <Table
                ref={tableRef}
                // @ts-ignore
                rowKey={(record: any) => record.id}
                rowSelection={props.rowSelection}
                tableStickyTop={tableStickyTop.value}
                defaultDescs={props.defaultDescs}
                nativeProps={{
                  // @ts-ignore
                  ...props.table.value,
                  ...props.table,
                  columns: computedColumns.value,
                  dataSource: dataSource.value,
                  loading: {
                    size: 'large',
                    indicator: <Spin/>,
                    spinning: isLoading.value
                  }
                }}
                onSort={handleSort}
              >
                {{
                  ...slots,
                  title: null,
                  summary: () => {
                    return <TableSummary fixed="bottom"></TableSummary>
                  }
                }}
              </Table>
            )}
            {footerComputed.value}
            {/*{props.footer?.()}*/}
          </div>
        </div>
      )
    }
  }
})

export default SearchTable

export const useSearchTableRefresh = (key: string, silent?: boolean) => {
  silent ? emitter.emit(`SearchTableSilentRefresh:${key}`, {}) : emitter.emit(`SearchTableRefresh:${key}`, {})
}
export const useSearchTableReload = (key: string) => {
  emitter.emit(`SearchTableReload:${key}`, {})
}

/** 表格页 */
export const useSearchTable = (config: SearchTableConfig, slots?: Record<string, any>) => {
  const tableKey = config?.key ?? uuid()
  /** 刷新数据 */
  const refresh = () => useSearchTableRefresh(tableKey)
  /** 静默刷新数据，没有loading */
  const silentRefresh = () => useSearchTableRefresh(tableKey, true)
  const dataRef = ref<any[]>([])
  const filterCompRef = ref()

  const getFilterState = () => {
    return filterCompRef.value?.getFilterState()
  }

  const setFilterState = (newState: Record<string, any>, autoRefresh = true) => {
    filterCompRef.value?.setFilterState(newState, autoRefresh)
  }

  const computedTable = useComputedValue(config.table!)

  let scrollTop = 0
  const tableRef = ref()
  const onScroll = (e: Event) => {
    scrollTop = (e.target as HTMLElement).scrollTop
  }

  watch(
    () => tableRef.value,
    () => {
      if (tableRef.value) {
        const el = tableRef.value?.querySelector('.null-table-body') as HTMLDivElement
        el?.addEventListener('scroll', onScroll)
      }
    }
  )

  onActivated(() => {
    try {
      if (dataRef.value?.length > 0) {
        if (config.onActivated) {
          // console.log('自定义 onActivated')
          config.onActivated()
        } else {
          // console.log('onActivated 静默刷新')
          silentRefresh()
        }
      }
    } catch (err) {
      console.log('onActivated 静默刷新失败：', err)
    }

    // @ts-ignore
    const el = tableRef.value?.querySelector('.null-table-body') as HTMLDivElement
    if (el && scrollTop >= 0) {
      el.scrollTo({
        top: scrollTop,
        behavior: 'instant'
      })
    }
  })

  const _Table = () => (
    <div class={['base-table-page-wrapper', config.className]} key={tableKey} ref={tableRef}>
      <SearchTable
        tableKey={tableKey}
        dataRef={dataRef}
        {...config.props}
        {...config}
        table={computedTable}
        onReset={() => {
          config.onReset?.()
        }}
        filterCompRef={filterCompRef}
      >
        {{ ...slots }}
      </SearchTable>
    </div>
  )

  return {
    tableKey,
    refresh,
    silentRefresh,
    Table: <_Table/>,
    dataRef,
    getFilterState,
    setFilterState
  }
}

/** 分面表格页 */
const Comp = defineComponent({
  name: 'TabSearchTable',
  props: {
    list: {
      type: Array as PropType<any[]>,
      default: () => []
    },
    // 传递给组件的
    params: {
      type: Object,
      default: () => ({})
    }
  },
  setup(props, { expose }) {
    const current = ref(0)

    const toggle = (index: number) => {
      current.value = index
      cachedPage[index] = true
    }

    expose({
      current,
      toggle
    })

    const cachedPage = reactive<Record<number, boolean>>({
      0: true
    })

    const title = (index: number) => {
      return (
        <div class="btp__tab" key={index}>
          {props.list.map((item, index) => {
            return (
              <div
                class={['btp__tab-item clickable', index === current.value && '--active']}
                onClick={() => toggle(index)}
              >
                <span>
                  {item.title ??
                    item.type?.title ??
                    item.children?.[0]?.props?.title ??
                    item.props?.title ??
                    `表格 ${index + 1}`}
                </span>
              </div>
            )
          })}
        </div>
      )
    }
    return () => {
      return (
        <div class="base-table-page-wrapper --tab">
          {title(current.value)}
          {props.list.map((item, index) => {
            if (!item.config) {
              return (
                cachedPage[index] && (
                  <item
                    {...item.params}
                    {...item.props}
                    hiddenTitle
                    hidden={index !== current.value}
                    style={index !== current.value ? 'display:none' : ''}
                  />
                )
              )
            }
            const show = index === current.value
            return (
              cachedPage[index] && (
                <SearchTable
                  {...item.config.props}
                  {...item.config}
                  tableKey={item.config.key || item.config.title}
                  key={index}
                  title={null}
                  v-show={show}
                ></SearchTable>
              )
            )
          })}
        </div>
      )
    }
  }
})
export const useTabSearchTable = (
  list: ReturnType<typeof useSearchTable>['Table'][] | { title: string; config: SearchTableConfig }[]
) => {
  return <Comp list={list.filter((i) => !!i)}/>
}

type TableAction = {
  title: string
  description?: any
  type?: 'default' | 'danger'
  disabled?: boolean
  hidden?: boolean
  /** 权限，等同于调用 hasPermission 的第一个参数，优先级低于 hidden */
  permission?: string | string[]
  icon?: any
  onClick?: () => void
  /** 使用 AuthButton 进行权限控制时的权限点，提供则优先使用 AuthButton 渲染 */
  perm?: string
  /** 权限点展示名称，默认使用 title */
  label?: string
  /** 页面路径，不传则尝试使用当前路由 */
  pagePath?: string
  /** 无权限时隐藏或禁用，默认 hide */
  hiddenMode?: 'hide' | 'disable'
}
const withToolTip = (item: any, desc: any) => {
  if (desc) return <Tooltip title={desc}>{item}</Tooltip>
  return item
}
export const useTableAction = (cfg: {
  align?: 'center' | 'left' | 'right'
  list: (TableAction | false | null | undefined)[]
}) => {
  const permissionStore = usePermissionStore()
  const list = (cfg.list.filter((item) => !!item) as TableAction[]).map((item) => {
    if (item.hidden) {
      return null
    }

    // 统一用 <a> 渲染，并基于 perm/permission 控制显隐或禁用
    // 1) 优先使用 item.perm；2) 否则使用 item.permission；3) 两者皆无则直接渲染
    let allow = true
    if (item.perm) {
      allow = permissionStore.hasPermission(item.perm)
    } else if (item.permission !== undefined) {
      allow = permissionStore.hasPermission(item.permission)
    }

    // 根据 hiddenMode 处理无权限情况
    if (!allow && item.hiddenMode !== 'disable') {
      return null
    }

    const disabled = item.disabled || (!allow && item.hiddenMode === 'disable')

    const node = (
      <a
        style="white-space:nowrap;"
        class={[item.type === 'danger' && '--danger', disabled && '--disabled']}
        onClick={() => {
          if (!disabled) {
            if (item.onClick) {
              item.onClick()
            } else {
              message.info(`你点击了「${item.title}」似乎没有发生什么事情`)
            }
          }
        }}
      >
        {item.icon}
        {item.title}
      </a>
    )

    return withToolTip(node, item.description)
  })
  const align = cfg.align === 'left' ? 'flex-start' : cfg.align === 'right' ? 'flex-end' : 'center'
  return (
    <div class="base-table-actions" style={{ justifyContent: align }} onClick={withModifiers(() => {
    }, ['stop'])}>
      {list}
    </div>
  )
}

/**
 * 获取简单的文本，如果超过100个字符(默认100)则截断
 * @param title 标题
 * @param text 文本
 * @param textLength 截断长度，默认100
 */
export const useTableLongText = (title: string, text: string, textLength: number = 100) => {
  return (
    <div
      class="base-table-long-text"
      onClick={() => {
        useModal({
          title: title,
          centered: true,
          content: (
        <div class="base-table-modal-long-text ui-scrollbar">
              <div class="base-table-modal-long-text-content" innerHTML={text}></div>
            </div>
          )
        })
      }}
    >
      <div class="base-table-long-text-content" innerHTML={getSimpleText(text)?.slice(0, textLength)}></div>
      <a class="base-table-long-text-btn" href="javascript:void(0);">
        查看
      </a>
    </div>
  )
}

const usePreviewImages = (images: string[]) => {
  Modal.open({
    title: '图片列表',
    content: (
        <div class="base-table-images-preview ui-scrollbar">
        {images.map((item) => {
          return <img src={item}/>
        })}
      </div>
    )
  })
}

export const useTableImages = (images: string[], showThumbnail = false) => {
  if (!images?.length) return void 0
  return (
    <div
      class="base-table-images clickable"
      onClick={() => {
        if (images.length > 0) {
          usePreviewImages(images)
        }
      }}
    >
      {images?.map((item) => {
        return (
          <div class="base-table-images__item">
            <img src={withImageResize(item, { w: 100, h: 100 })}/>
          </div>
        )
      })}
    </div>
  )
}

export const useTableAddress = (address: {
  address: string
  name?: string
  longitude: number | string
  latitude: number | string
}) => {
  if (!address || !address.longitude || !address.latitude) return null
  return (
    <div
      class="color-text-inherit color-primary--hover clickable"
      onClick={() => {
        useMapView({
          name: address.name || '',
          address: address.address,
          longitude: address.longitude,
          latitude: address.latitude
        })
      }}
    >
      <iconpark-icon style="position:relative;top:2px;margin-right:4px;" name="local-two"></iconpark-icon>
      {address.address}
    </div>
  )
}
