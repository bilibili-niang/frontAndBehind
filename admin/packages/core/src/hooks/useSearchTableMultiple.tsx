// @example apps/cs/tongqiyun/src/views/policy/informationList/creat/index.tsx
// 传入表单用来构建选择器
// @example apps/cs/tongqiyun/src/views/policy/informationList/creat/index.tsx
import { h, ref } from 'vue'
import useModal from './useModal'
import request from '../api/request'
import Spin from '../components/spin'
import { isEmpty } from 'lodash'

export type UseSearchTableMultipleOptions = {
  /** 标题 */
  title?: string
  /** 唯一键字段，默认 'id' */
  idKey?: string
  /** 传入组件,该组件由 useSearchTable.Table 构建,需要开启改组件的 multiple,multipleValue,requestUrl */
  component: any
  /** 组件的额外 props，会与内部注入的 props 合并 */
  componentProps?: Record<string, any>
  /** 明确的详情请求地址（优先级最高），用于回显时按 id 拉取详情 */
  detailRequestUrl?: string
  /** 选择完成回调（点击弹窗确认时触发），返回选中行 */
  onFinish?: (rows: any[]) => void
  /** 单选回调（组件内部 onSelect）——与资讯分类用法一致，触发后会自动关闭弹窗 */
  onSelect?: (row: any) => void
  /** 选择变化时回调（增删/清空/完成添加都会触发） */
  onChange?: (rows: any[]) => void
  /** 显示名称获取函数，默认从 title/name/label/text/idKey 取 */
  getItemLabel?: (row: any) => string
  /** 获取详情的接口，优先于 componentProps.requestUrl */
  detailRequestUrl?: string
}

/**
 * 通用多选选择器（组件版）
 * - 接收一个可用作选择器的组件（需支持 asSelector/multiple/multipleValue/onSelect）
 * - 内部注入“全选本页/反选本页”与跨页选择合并逻辑
 */
export default function useSearchTableMultiple(options: UseSearchTableMultipleOptions) {
  // 基础默认值合并
  const idKey = options.idKey ?? 'id'
  const opts: Required<Pick<UseSearchTableMultipleOptions, 'title' | 'component' | 'componentProps' | 'getItemLabel'>> &
    Omit<UseSearchTableMultipleOptions, 'title' | 'component' | 'componentProps' | 'getItemLabel'> = {
    title: '',
    component: options.component,
    componentProps: {},
    // 获取数据回显的指定字段,不够了在这里加,或者传入一个function
    getItemLabel: (row: any) =>
      row?.dictValue || row?.title || row?.name || row?.label || row?.text || row?.idKey || row || '',
    ...options
  }
  const selectedIds = ref<string[]>([])
  const selectedRows = ref<any[]>([])
  // 保存弹窗关闭方法，便于从 multipleHandler 里关闭
  let destroyModal: (() => void) | undefined
  const getLabel = (row: any) => opts.getItemLabel?.(row) ?? ''
  // Schema 小部件的 onChange（来自 SelectorMultiple(props)）
  let widgetOnChange: undefined | ((v: any) => void)
  const emitChange = () => {
    opts.onChange?.(selectedRows.value)
    widgetOnChange?.(selectedRows.value)
  }

  const multipleHandler = (v: any) => {
    if (v === 'over') {
      opts.onFinish?.(selectedRows.value)
      emitChange()
      destroyModal?.()
      return
    }
    if (Array.isArray(v)) {
      // 全选本页：若本页全部已选则反选，否则合并
      const ids = v.map((p) => p?.[idKey]).filter(Boolean) as string[]
      const set = new Set<string>(selectedIds.value)
      const allSelected = ids.length > 0 && ids.every((id) => set.has(id))
      if (allSelected) {
        ids.forEach((id) => set.delete(id))
      } else {
        ids.forEach((id) => set.add(id))
      }
      selectedIds.value = Array.from(set)
      const rowMap = new Map<string, any>()
      ;[...selectedRows.value, ...v].forEach((row) => {
        const k = row?.[idKey]
        if (k && selectedIds.value.includes(k)) rowMap.set(k, row)
      })
      selectedRows.value = Array.from(rowMap.values())
      emitChange()
    } else {
      const row = v?.record
      const id = row?.[idKey]
      if (!id) return
      if (selectedIds.value.includes(id)) {
        selectedIds.value = selectedIds.value.filter((x) => x !== id)
        selectedRows.value = selectedRows.value.filter((x) => x?.[idKey] !== id)
      } else {
        selectedIds.value.push(id)
        selectedRows.value.push(row)
      }
      emitChange()
    }
  }

  const open = () => {
    const Comp = opts.component
    const modal = useModal({
      title: opts.title,
      width: 1000,
      content: h(Comp as any, {
        ...(opts.componentProps || {}),
        asSelector: true,
        multiple: multipleHandler,
        multipleValue: selectedIds,
        // 供组件展示/计算选中项
        selectedRows,
        // 组件内部“完成添加”按钮可直接调用此回调
        onFinish: (rows?: any[]) => {
          opts.onFinish?.(rows ?? selectedRows.value)
          modal?.destroy?.()
        },
        onSelect: (row: any) => {
          // 单选场景，直接关闭弹窗
          modal?.destroy?.()
          opts.onSelect?.(row)
        }
      }),
      footer: () => null,
      onOk: () => {
        opts.onFinish?.(selectedRows.value)
        emitChange()
      }
    })
    destroyModal = modal?.destroy
  }

  // 从已选中移除单个
  const removeById = (id: string) => {
    selectedIds.value = selectedIds.value.filter((x) => x !== id)
    selectedRows.value = selectedRows.value.filter((x) => x?.[idKey] !== id)
    emitChange()
  }

  // 清空
  const clear = () => {
    selectedIds.value = []
    selectedRows.value = []
    emitChange()
  }

  // 仅初始化一次
  // 注意：该标记位于 hook 闭包中，确保当前 useSearchTableMultiple 实例中的 SelectorMultiple
  // 只会进行一次初始化。如果需要外部触发重新初始化，可考虑传入 resetToken 并在内部 watch。
  let initialized = false
  // 外部驱动的重置 token（当 token 变化时，允许重新 init 一次）
  let lastResetToken: any = undefined
  // 局部加载状态，仅用于本组件占位内容
  const loading = ref(false)

  // 类似 CommonSelector 的占位展示，带多项移除与点击打开
  const SelectorMultiple = (props: any) => {
    // 记录最新的 onChange，以便在选择变更时回填给 SchemaForm
    widgetOnChange = props?.onChange

    // 初始化：根据 props.value 为控件注入初始选中值
    // - 支持两种格式：
    //   1) string：形如 '1,2,3' 的逗号分隔 id 字符串
    //   2) any[]：形如 ['1','2'] 的 id 数组
    // - 行对象仅以 {[idKey]: id} 兜底，便于后续通过 getItemLabel 回显名称
    // 根据传入 id 或 id 数组，调用详情接口补全行数据
    const fetchDetails = async (val: string | string[]) => {
      const toIds = Array.isArray(val) ? val.filter(Boolean) : [String(val)].filter(Boolean)
      if (toIds.length === 0) return

      // 详情回显 URL 优先级：detailRequestUrl > requestUrl（多处来源）,但是detailRequestUrl总是最优先的
      const requestUrl =
        (opts as any)?.detailRequestUrl ||
        (opts as any)?.componentProps?.detailRequestUrl ||
        ((opts as any)?.component?.props?.detailRequestUrl?.default as string | undefined) ||
        (opts as any)?.requestUrl ||
        (opts as any)?.componentProps?.requestUrl ||
        ((opts as any)?.component?.props?.requestUrl?.default as string | undefined)

      if (!requestUrl || (!Array.isArray(val) && !val)) return
      try {
        loading.value = true
        const requestFun = (id: string) => {
          // 不确定该接口需要传入哪些id,所以params,body都传递一下
          return request({
            url: requestUrl + `/${id}`,
            method: 'GET',
            params: { id }
          })
        }
        // 并发逐个请求，兼容仅支持单 id 查询的接口
        // const tasks = toIds.map((id) => request(requestUrl, { method: 'GET', params: { id } }))
        const results = await Promise.allSettled(toIds.map(requestFun))

        const list: any[] = []
        results.forEach((r) => {
          if (r.status === 'fulfilled') {
            const res: any = r.value
            if (Array.isArray(res?.data)) list.push(...res.data)
            else if (Array.isArray(res?.data?.records)) list.push(...res.data.records)
            else if (res?.data) list.push(res.data)
          }
        })

        if (list.length) {
          const rowMap = new Map<string, any>()
          // 先放入现有最小对象，避免丢失选择
          selectedRows.value.forEach((r) => {
            const k = r?.[idKey]
            if (k) rowMap.set(String(k), r)
          })
          // 用详情数据覆盖
          list.forEach((r) => {
            const k = r?.[idKey]
            if (k) rowMap.set(String(k), r)
          })
          // 仅保留当前 ids 顺序
          selectedRows.value = toIds.map((k) => rowMap.get(String(k))).filter(Boolean)
        }
      } catch (e) {
        console.log('e')
        console.error(e)
      } finally {
        loading.value = false
      }
    }

    const init = () => {
      const val = props?.value
      if (Array.isArray(val)) {
        // 数组：默认认为是 id 数组（避免包多一层数组）
        const ids = val.map((v) => String(v)).filter(Boolean)
        selectedIds.value = ids
        // 用 id 生成最小行对象，实际展示时若只拿 id 也能正常回显
        selectedRows.value = ids.map((id) => ({ [idKey]: id })) || ids

        // 尝试通过 requestUrl 拉取详情以完善显示
        fetchDetails(ids)
      } else if (typeof val === 'string') {
        // 字符串：支持逗号分隔的 id 列表或单个 id
        const str = val.trim()
        if (str.includes(',')) {
          const ids = str
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
          selectedIds.value = ids
          selectedRows.value = ids.map((id) => ({ [idKey]: id }))
          fetchDetails(ids)
        } else if (str) {
          const id = String(str)
          selectedIds.value = [id]
          selectedRows.value = [{ [idKey]: id }]
          fetchDetails(id)
        }
      }
    }

    // 若外部传入 resetToken 且发生变化，则允许重新初始化一次
    const currentToken = (props as any)?.resetToken
    if (currentToken !== lastResetToken) {
      lastResetToken = currentToken
      initialized = false
    }

    // 仅在首次（或 token 变化后）且有可用值时执行，避免覆盖用户交互
    if (!initialized && !isEmpty(props?.value)) {
      initialized = true
      init()
    }

    return (
      <div
        class={['selector-placeholder', selectedRows.value.length > 0 && 'highlight']}
        onClick={(e: any) => {
          e?.stopPropagation?.()
          open()
        }}
      >
        <div class="disable-mask" style={{ pointerEvents: 'none' }}>
          <div class="dashLine" />
        </div>
        <div class="selector-content clickable" style={{ position: 'relative', padding: '2px 6px' }}>
          <div class="icon">
            <iconpark-icon name={'click'} />
          </div>
          {loading.value && (
            <div
              style={{
                position: 'absolute',
                inset: '0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(0,0,0,0.12)',
                borderRadius: '6px'
              }}
              onClick={(e: any) => e.stopPropagation()}
            >
              <Spin />
            </div>
          )}
          {selectedRows.value.length === 0 ? (
            <span>请点击选择</span>
          ) : (
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {selectedRows.value.map((row) => (
                <span
                  class="tag tag-multiple-options-ssp"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '0 6px',
                    background: 'var(--null-color-primary-100)',
                    borderRadius: '4px',
                    height: '22px'
                  }}
                  title={getLabel(row)}
                >
                  <span
                    class="null-text-base"
                    style={{ maxWidth: '10em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                  >
                    {getLabel(row)}
                  </span>
                  <iconpark-icon
                    name="close"
                    style={{ marginLeft: '4px', cursor: 'pointer' }}
                    onClick={(e: any) => {
                      e.stopPropagation()
                      const id = row?.[idKey]
                      if (id) removeById(String(id))
                    }}
                  />
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  return {
    open,
    SelectorMultiple,
    selectedIds,
    selectedRows,
    removeById,
    clear
  }
}
