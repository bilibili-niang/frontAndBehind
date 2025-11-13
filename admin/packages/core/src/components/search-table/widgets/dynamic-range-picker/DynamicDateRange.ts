import dayjs, { type Dayjs } from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
dayjs.extend(isBetween)

import { CalendarView } from './Calendar'

import {
  DEFAULT_END_TIME,
  DEFAULT_START_TIME,
  DynamicDateMode,
  DynamicDateShortcuts,
  parseDynamicDateRange,
  retrieve,
  type DynamicDefine
} from './utils'

export class DynamicDateRange {
  calendar1: CalendarView
  calendar2: CalendarView

  start: DynamicDefine = {
    mode: DynamicDateMode.PAST,
    n: 7,
    date: undefined
  }
  end: DynamicDefine = {
    mode: DynamicDateMode.TODAY,
    n: 7,
    date: undefined
  }

  /** 动态时间开关，开／关不会影响内部数据状态，仅改变对外 emit 的值（computed） */
  dynamicEnable: boolean = true

  /** 自定义时间开关，开启后支持配置时间，默认 起始00:00:00，结束23:59:59 */
  customDateTime: boolean = false

  /** 参考时间，默认此刻 */
  referenceTime: dayjs.Dayjs = dayjs()

  currentShortcut?: string = undefined

  constructor(value?: string) {
    const lastMonth = dayjs().subtract(1, 'month').startOf('month')
    const thisMonth = dayjs().startOf('month')

    this.calendar1 = new CalendarView(lastMonth)
    this.calendar2 = new CalendarView(thisMonth)

    this.calendar1.nextCalendar = this.calendar2
    this.calendar2.prevCalendar = this.calendar1

    if (value) {
      const res = retrieve(value)
      if (res) {
        this.start = res.start
        this.end = res.end
        this.referenceTime = res.referenceTime
        this.currentShortcut = res.currentShortcut
        this.refresh()
      }
    }
  }

  onShortcutClick(shortcut: string) {
    this.currentShortcut = shortcut

    if (!shortcut) {
      this.start.mode = DynamicDateMode.STATIC
      this.end.mode = DynamicDateMode.STATIC
    } else if (shortcut === DynamicDateMode.PAST) {
      this.start.mode = DynamicDateMode.PAST
      this.start.n = 7
      this.end.mode = DynamicDateMode.TODAY
    } else if (shortcut === DynamicDateMode.FUTURE) {
      this.start.mode = DynamicDateMode.TODAY
      this.end.mode = DynamicDateMode.FUTURE
      this.end.n = 7
    } else if (shortcut === DynamicDateMode.STATIC) {
      this.start = {
        date: undefined,
        mode: DynamicDateMode.PAST,
        n: 15
      }
      this.end = {
        date: undefined,
        mode: DynamicDateMode.FUTURE,
        n: 15
      }
    }

    this.refresh()
  }

  /** 日期点击 */
  onDateClick(date: dayjs.Dayjs | string) {
    const d = dayjs(date)

    if (this.currentShortcut === 'past') {
      if (this.start.mode === DynamicDateMode.STATIC) {
        // 判断是否在当前指定的结束日期之前，否则提示无法选中
        this.start.date = d
        return void 0
      }
    }

    if (this.currentShortcut === 'future') {
      if (this.end.mode === DynamicDateMode.STATIC) {
        // 判断是否在当前指定的开始日期之后，否则提示无法选中
        this.end.date = d
        return void 0
      }
    }

    // 如果点击没有被拦截中断，则取消快捷选择 => 静态时间
    this.currentShortcut = undefined
    this.start.mode = DynamicDateMode.STATIC
    this.start.mode = DynamicDateMode.STATIC

    if (this.start.date && !this.end.date) {
      this.end.date = d
    } else {
      this.start.date = d
      this.end.date = undefined
    }

    // 取消快捷选择
    this.currentShortcut = undefined

    //  确保 start 小于 end
    if (this.start.date && this.end.date && this.start.date?.isAfter(this.end.date)) {
      ;[this.start.date, this.end.date] = [this.end.date, this.start.date]
    }

    this.start.date = this.start.date?.startOf('day')
    this.end.date = this.end.date?.endOf('day')

    this.adjustView()
  }

  /** 刷新日期范围 */
  refresh() {
    this.adjustView()
  }

  // 调整日历视图，以确保显示效果最佳
  adjustView() {
    const range = this.range
    console.log(
      'range：',
      range.map((item) => item?.format('YYYY-MM-DD'))
    )
    this.calendar1.updateRange(...range)
    this.calendar2.updateRange(...range)

    const [start, end] = range

    if (start && end) {
      this.calendar1.update(start)
      this.calendar2.update(end)
      if (this.end.date?.isBefore(dayjs().startOf('month'))) {
        this.calendar1.update(start)
      }
    }
  }

  get range() {
    if (!this.currentShortcut) {
      return [this.start.date, this.end.date]
    }

    const s = DynamicDateShortcuts.find((item) => item.key === this.currentShortcut)
    if (s) {
      return s.getValue(this)
    }

    return [this.start.date, this.end.date]
  }

  get value() {
    return generateRule(this)
  }
}

const formatRuleItem = (item: DynamicDefine) => {
  if (item.mode === DynamicDateMode.STATIC) {
    return item.date?.format('YYYY-MM-DD')
  }

  if (item.mode === DynamicDateMode.PAST) {
    return `past_${item.n}`
  }

  if (item.mode === DynamicDateMode.FUTURE) {
    return `future_${item.n}`
  }

  return item.mode
}

const generateRule = (instance: DynamicDateRange) => {
  const { start, end, currentShortcut } = instance

  const startTime = start.time || DEFAULT_START_TIME
  const endTime = end.time || DEFAULT_END_TIME
  const time = startTime === DEFAULT_START_TIME && endTime === DEFAULT_END_TIME ? '' : `[${startTime},${endTime}]`

  if (currentShortcut === 'past') {
    return `${formatRuleItem(start)},${formatRuleItem(end)}${time}`
  }

  if (currentShortcut === 'future') {
    return `${formatRuleItem(start)},${formatRuleItem(end)}${time}`
  }

  if (currentShortcut === 'custom') {
    return `${formatRuleItem(start)},${formatRuleItem(end)}${time}`
  }

  if (currentShortcut) {
    return currentShortcut + time
  }

  // 静态时间
  if (!start?.date || !end?.date) {
    return ''
  }

  const startDate = start.date?.format('YYYY-MM-DD')
  const endDate = end.date?.format('YYYY-MM-DD')

  return `${startDate},${endDate}${time}`
}
