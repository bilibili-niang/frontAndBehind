import dayjs from 'dayjs'
import { computed } from 'vue'

const ALLOW_FUTURE = true

/**
 * 日历视图
 * 仅用于展示，不参与动态范围逻辑计算
 */
export class CalendarView {
  date: dayjs.Dayjs
  prevCalendar?: CalendarView
  nextCalendar?: CalendarView
  start?: dayjs.Dayjs
  end?: dayjs.Dayjs

  constructor(date: dayjs.Dayjs | string) {
    this.date = dayjs(date)
  }
  update(date: dayjs.Dayjs | string, options?: { silent?: boolean }) {
    this.date = dayjs(date)
    if (!options?.silent) {
      this.updateSiblingCalendar()
    }
  }

  /** 联动更新相邻日历，避免显示同一个年月，且日历 1 总小于 日历 2 至少一个月 */
  private updateSiblingCalendar() {
    const currentDate = this.date.clone()

    if (this.prevCalendar) {
      const isSame =
        this.date.year() === this.prevCalendar.date.year() && this.date.month() === this.prevCalendar.date.month()
      const isBefore = this.date.isBefore(this.prevCalendar.date)

      if (isSame || isBefore) {
        const expectedPrevMonth = currentDate.clone().subtract(1, 'month')
        this.prevCalendar.update(expectedPrevMonth, { silent: true })
      }
    }

    if (this.nextCalendar) {
      const isSame =
        this.date.year() === this.nextCalendar.date.year() && this.date.month() === this.nextCalendar.date.month()
      const isAfter = this.date.isAfter(this.nextCalendar.date)

      if (isSame || isAfter) {
        const expectedNextMonth = currentDate.clone().add(1, 'month')
        this.nextCalendar.update(expectedNextMonth, { silent: true })
      }
    }
  }

  getDates() {
    const firstDay = this.date.startOf('month')
    const lastDay = this.date.endOf('month')

    const dates: {
      day: dayjs.Dayjs
      D: string
      before: boolean
      after: boolean
      start: boolean
      end: boolean
      contain: boolean
      disabled: boolean
    }[] = []

    const firstDayStartOfWeek = firstDay.startOf('week')

    const counts = 7 * 6
    for (let i = 0; i < counts; i++) {
      const day = firstDayStartOfWeek.add(i, 'day')

      const before = day.isBefore(firstDay)
      const after = day.isAfter(lastDay)
      const beyond = before || after

      const disabled = !ALLOW_FUTURE && day.startOf('day').isAfter(dayjs())

      dates.push({
        day: day,
        D: day.format('D'),
        before: before,
        after: after,
        start: !beyond && !!(this.start && day.isSame(this.start, 'date')),
        end: !beyond && !!(this.end && day.isSame(this.end, 'date')),
        contain: !beyond && !!(this.start && this.end && day.isBetween(this.start, this.end, 'date')),
        disabled
      })
    }

    return dates
  }

  nextYear() {
    this.update(this.date.add(1, 'year'))
  }

  prevYear() {
    this.update(this.date.subtract(1, 'year'))
  }

  nextMonth() {
    this.update(this.date.add(1, 'month'))
  }

  prevMonth() {
    this.update(this.date.subtract(1, 'month'))
  }

  updateRange(start?: dayjs.Dayjs, end?: dayjs.Dayjs) {
    this.start = start
    this.end = end
  }

  get Title() {
    return this.date.format('YYYY 年 MM 月')
  }

  static useComputedDates(calendar: CalendarView) {
    return computed(() => {
      return calendar.getDates()
    })
  }
}
