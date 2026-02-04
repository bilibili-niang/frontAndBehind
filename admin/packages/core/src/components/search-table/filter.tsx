import { computed, defineComponent, onMounted, type PropType, reactive, ref } from 'vue'
import './styles/grid.scss'
import './styles/filter.scss'

import type {
  CascaderProps,
  DatePickerProps,
  InputNumberProps,
  InputProps,
  SelectProps,
  TimePickerProps,
  TimeRangePickerProps
} from '@pkg/ui'
import { Button, Icon } from '@pkg/ui'

import Input from './widgets/input'
import InputNumber from './widgets/input-number'
import RangeNumber from './widgets/range-number'
import Select from './widgets/select'
// import RangePicker from './widgets/range-picker'
import RangePicker from './widgets/dynamic-range-picker'
import DatePicker from './widgets/date-picker'
import TimePicker from './widgets/time-picker'
import TimeRangePicker from './widgets/time-range-picker'
import { QueryDic } from './utils'
import Cascader from './widgets/cascader'
import { parseDynamicDateRange } from './widgets/dynamic-range-picker/utils'

const widgets = {
  input: Input,
  'input-number': InputNumber,
  'range-number': RangeNumber,
  select: Select,
  'date-picker': DatePicker,
  'range-picker': RangePicker,
  'time-picker': TimePicker,
  'time-range-picker': TimeRangePicker,
  cascader: Cascader
}

type FilterWidgetType = keyof typeof widgets

type FilterWidgetConfig = {
  input: InputProps
  'input-number': InputNumberProps
  'range-number': { [key: string]: any }
  select: SelectProps
  'date-picker': DatePickerProps
  'range-picker': DatePickerProps
  'time-picker': TimePickerProps
  'time-range-picker': TimeRangePickerProps
  cascader: CascaderProps
  'goods-selector': any
  'biz-dict': {
    code: string
  } & Exclude<SelectProps, ['options']>
}

type FlexCol =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21
  | 22
  | 23
  | 24

export type FilterItem<T> = keyof T extends infer U
  ? U extends keyof T
    ? {
      key: string
      label: string
      type?: U
      widget?: (props: any) => any
      config?: T[U]
      flex?: FlexCol
      fixed?: boolean
      hidden?: boolean
      withWrap?: boolean
      maxWidth?: number
      minWidth?: number
      // func?: QueryDic | keyof typeof QueryDic
    }
    : never
  : never

export type FilterDefine = {
  list: FilterItem<FilterWidgetConfig>[]
  format?: (rawParams: Record<string, any>) => Record<string, any>
  default?: Record<string, any>
}

export default defineComponent({
  name: '',
  props: {
    filter: {
      type: Object as PropType<FilterDefine>
    },
    defaultState: {
      type: Object
    }
  },
  emits: {
    search: (payload: any) => true,
    reset: () => true
  },
  setup(props, { emit, expose }) {
    const isFullDose = ref(false)
    const filteredList = computed(() => {
      return (props.filter?.list || []).filter((item) => {
        return !item.hidden
      })
    })
    const listRef = computed(() => {
      const list = filteredList.value

      if (isFullDose.value) {
        return list
      }
      const l: FilterDefine['list'] = list.filter((item) => !!item.fixed)
      if (l.length === 0) {
        return list.slice(0, 1)
      }
      return l
    })

    const state = reactive<Record<string, any>>(props.defaultState ?? {})

    const getWidget = (item: FilterItem<FilterWidgetConfig>) => {
      const { key, label, type, config, widget } = item
      const targetWidget = widget ?? (type ? (widgets as any)[type] : null)

      let withWrap = item.withWrap

      if (widget) {
        withWrap = withWrap ?? true
      }

      if (!targetWidget) {
        return (
          <div class="btp__filter-widget">
            <label style="color:orange">找不到控件 "{type}" 请检查配置</label>
          </div>
        )
      }

      const onChange = (value: any) => {
        state[key] = value
      }

      const Comp = <targetWidget label={label} config={config} value={state[key]} onChange={onChange}/>
      return withWrap ? (
        <div class="btp__filter-widget">
          <label>{label}</label>
          {Comp}
        </div>
      ) : (
        Comp
      )
    }

    const onSearch = () => {
      emit('search', getFilterState())
      emit('reset')
    }

    const getFilterState = () => {
      const payload: Record<string, any> = {}
      Object.keys(state).forEach((key) => {
        const value = state[key]
        const filterDefine = filteredList.value.find((item) => item.key === key)
        if (filterDefine?.type === 'range-picker') {
          let _value = value
          if (typeof value === 'string') {
            _value = parseDynamicDateRange(value)
          }
          payload[`${key}_${QueryDic.DATE_GE}`] = _value[0]
          payload[`${key}_${QueryDic.DATE_LE}`] = _value[1]
        } else {
          payload[key] = value
        }
      })
      return props.filter?.format?.(payload) ?? payload
    }

    const setFilterState = (newState: Record<string, any>, autoRefresh = true) => {
      for (const key in state) {
        delete state[key]
      }
      Object.assign(state, newState)
      if (autoRefresh) {
        onSearch()
      }
    }

    expose({
      getFilterState,
      setFilterState
    })

    const onReset = () => {
      for (const key in state) {
        delete state[key]
      }
      onSearch()
    }

    onMounted(() => {
      onSearch()
    })

    return () => {
      return (
        <div class={['btp__filter btp-grid', isFullDose.value && '--full']}>
          {listRef.value.map((item) => {
            return (
              <div
                class={['btp__filter-item', `btp-grid-col-${item.flex ?? 6}`]}
                style={{
                  minWidth: item.minWidth ? `${item.minWidth}px` : undefined,
                  maxWidth: item.maxWidth ? `${item.maxWidth}px` : undefined
                }}
              >
                {getWidget(item)}
              </div>
            )
          })}
          <div class="btp__filter-search">
            <Button
              class="btp__filter-btn"
              icon={<Icon name="search" style="vertical-align:middle;"/>}
              type="primary"
              onClick={onSearch}
            >
              搜索
            </Button>
            <Button class="btp__filter-btn --reset" onClick={onReset}>
              重置
            </Button>
            {(isFullDose.value ? true : listRef.value.length < (filteredList.value.length ?? 0)) && (
              <a
                class="btp__filter-fold"
                href="javascript:void(0);"
                onClick={() => (isFullDose.value = !isFullDose.value)}
              >
                <Icon name="down"/>
                {isFullDose.value ? '收起' : '全量筛选'}
              </a>
            )}
          </div>
        </div>
      )
    }
  }
})
