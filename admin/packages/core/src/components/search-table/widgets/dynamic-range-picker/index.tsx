import { defineComponent, ref, type PropType, reactive, watch, nextTick } from 'vue'
import { commonSearchTableWidgetPropsDefine } from '../types'
import './style.scss'
import { Button, Icon, Input, JsonView, Popover, Switch, Tooltip, message } from '@pkg/ui'
import {
  DEFAULT_START_TIME,
  DynamicDateMode,
  DynamicDateShortcuts,
  parseDynamicDateRange,
  type DynamicDefine
} from './utils'
import { DynamicDateRange } from './DynamicDateRange'
import { CalendarView } from './Calendar'
import dayjs from 'dayjs'
import { computed } from 'vue'

export default defineComponent({
  name: 'fw_range-picker',
  props: commonSearchTableWidgetPropsDefine,
  setup(props) {
    const isFocus = ref(false)

    const onSelect = () => {
      isFocus.value = true
    }

    const onBlur = () => {
      isFocus.value = false
    }

    const value = ref(props.value)
    // const value = ref(props.value || 'past_3,future_5[12:00:00,18:00:00]')
    // const value = ref(props.value || 'future_5,tomorrow[12:00:00,18:00:00]')

    const alias = computed(() => {
      if (!value.value) {
        return ''
      }
      return DynamicDateShortcuts.find((item) => item.key === value.value)?.title
    })

    const range = computed(() => {
      return parseDynamicDateRange(value.value)
    })

    watch(
      () => props.value,
      (newVal: string) => {
        value.value = newVal
      }
    )

    const onChange = (newVal: string) => {
      value.value = newVal
      console.log('onChange', newVal)
      props.onChange?.(newVal)
    }

    const visible = ref(false)

    return () => {
      return (
        <div class={['btp__filter-widget clickable', isFocus.value && '--focus']}>
          <label>{props.label}</label>
          <Popover
            open={visible.value}
            onOpenChange={(open) => {
              visible.value = open
            }}
            placement="bottomLeft"
            content={
              <DynamicRangePicker
                value={value.value}
                onChange={onChange}
                onClose={() => {
                  visible.value = false
                }}
              />
            }
            trigger="click"
          >
            <button class="fw_dynamic-range-picker" onClick={onSelect} onBlur={onBlur}>
              <Tooltip>
                <div class="text-value">
                  {alias.value ? `${alias.value} 丨 ` : ''}
                  {range.value?.map((i) => dayjs(i).format('YYYY-MM-DD')).join(' ～ ')}
                </div>
              </Tooltip>
              {/* <Tooltip
                // 打开配置面板时，禁用提示
                visible={isFocus.value ? false : undefined}
                title={
                  <div style="white-space: nowrap;">
                    <div>规则：本月</div>
                    <div>实时值：2025-08-01 00:00:00 ～ 2025-08-31 23:59:59</div>
                  </div>
                }
              >
                <div>本月</div>
              </Tooltip> */}
            </button>
          </Popover>
        </div>
      )
    }
  }
})

const DynamicRangePicker = defineComponent({
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  emits: {
    change: (value: string) => true,
    close: () => true
  },
  setup(props, { emit }) {
    const instance = ref(new DynamicDateRange(props.value))

    const onConfirm = () => {
      emit('change', instance.value.value)
      emit('close')
    }

    const onCancel = () => {
      emit('close')
    }

    const ShortCuts = () => {
      return (
        <div class="g_dynamic-range-picker__short-cuts">
          <div class="title">快捷选择</div>
          <div class="list">
            {DynamicDateShortcuts.map((item) => {
              if (item.hidden) {
                return null
              }

              const isActive = instance.value.currentShortcut === item.key
              const type = isActive ? 'primary' : 'default'
              const onClick = () => {
                instance.value.onShortcutClick(item.key)
              }

              return (
                <Button class={['item', item.stretch && 'stretch']} key={item.key} type={type} onClick={onClick}>
                  {item.title}
                </Button>
              )
            })}
          </div>
        </div>
      )
    }

    watch(
      () => [instance.value.start, instance.value.end, instance.value.referenceTime, instance.value.currentShortcut],
      () => {
        instance.value.refresh()
      },
      { deep: true }
    )

    const debugData = computed(() => {
      return {
        start: {
          mode: instance.value.start.mode,
          n: instance.value.start.n,
          date: instance.value.start.date?.format('YYYY-MM-DD HH:mm:ss')
        },
        end: {
          mode: instance.value.end.mode,
          n: instance.value.end.n,
          date: instance.value.end.date?.format('YYYY-MM-DD HH:mm:ss')
        },
        referenceTime: instance.value.referenceTime.format('YYYY-MM-DD'),
        currentShortcut: instance.value.currentShortcut
      }
    })

    const DynamicControls1 = () => {
      const { currentShortcut } = instance.value
      const target = instance.value.start

      if (currentShortcut === 'past') {
        return (
          <div class="g_dynamic-range-picker__dynamic-controls start">
            <Tooltip title="请选择" open={target.mode === DynamicDateMode.STATIC && !target.date}>
              <Button
                class="button"
                type={target.mode === DynamicDateMode.STATIC ? 'primary' : 'default'}
                onClick={() => {
                  target.mode = DynamicDateMode.STATIC
                }}
              >
                {target.mode === DynamicDateMode.STATIC && target.date ? target.date.format('YYYY-MM-DD') : '具体日期'}
              </Button>
            </Tooltip>
            <CustomDays
              label="过去"
              checked={target.mode === DynamicDateMode.PAST}
              onClick={() => {
                target.mode = DynamicDateMode.PAST
              }}
              value={target.n}
              onChange={(value) => {
                target.n = value
              }}
            />
          </div>
        )
      } else if (currentShortcut === 'future') {
        return (
          <div class="g_dynamic-range-picker__dynamic-controls start">
            <Button
              class="button"
              type={target.mode === DynamicDateMode.TODAY ? 'primary' : 'default'}
              onClick={() => {
                target.mode = DynamicDateMode.TODAY
              }}
            >
              今日
            </Button>
            <Button
              class="button"
              type={target.mode === DynamicDateMode.TOMORROW ? 'primary' : 'default'}
              onClick={() => {
                target.mode = DynamicDateMode.TOMORROW
              }}
            >
              明日
            </Button>
            <CustomDays
              label="未来"
              checked={target.mode === DynamicDateMode.FUTURE}
              onClick={() => {
                target.mode = DynamicDateMode.FUTURE
              }}
              value={target.n}
              onChange={(value) => {
                target.n = value
              }}
            />
          </div>
        )
      }

      return null
    }

    const DynamicControls2 = () => {
      const { currentShortcut } = instance.value
      const target = instance.value.end

      if (currentShortcut === 'past') {
        return (
          <div class="g_dynamic-range-picker__dynamic-controls end">
            <Button
              class="button"
              type={target.mode === DynamicDateMode.YESTERDAY ? 'primary' : 'default'}
              onClick={() => {
                target.mode = DynamicDateMode.YESTERDAY
              }}
            >
              昨日
            </Button>
            <Button
              class="button"
              type={target.mode === DynamicDateMode.TODAY ? 'primary' : 'default'}
              onClick={() => {
                target.mode = DynamicDateMode.TODAY
              }}
            >
              今日
            </Button>
            <CustomDays
              label="过去"
              checked={target.mode === DynamicDateMode.PAST}
              onClick={() => {
                target.mode = DynamicDateMode.PAST
              }}
              value={target.n}
              onChange={(value) => {
                target.n = value
              }}
            />
          </div>
        )
      } else if (currentShortcut === 'future') {
        return (
          <div class="g_dynamic-range-picker__dynamic-controls end">
            <Button
              class="button"
              type={target.mode === DynamicDateMode.STATIC ? 'primary' : 'default'}
              onClick={() => {
                target.mode = DynamicDateMode.STATIC
              }}
            >
              具体日期
            </Button>
            <CustomDays
              label="未来"
              checked={target.mode === DynamicDateMode.FUTURE}
              onClick={() => {
                target.mode = DynamicDateMode.FUTURE
              }}
              value={target.n}
              onChange={(value) => {
                target.n = value
              }}
            />
          </div>
        )
      }
      return null
    }

    const CustomControls = () => {
      if (instance.value.currentShortcut !== 'custom') {
        return null
      }
      return (
        <div class="g_dynamic-range-picker__custom-controls">
          <CustomRule customDateTime={instance.value.customDateTime} />
        </div>
      )
    }

    const Title = () => {
      return <div>{parseDynamicDateRange(instance.value.value)?.join(' ～ ')}</div>
    }

    return () => {
      return (
        <div class="g_dynamic-range-picker">
          <div class="g_dynamic-range-picker__header">
            <h3>选择日期范围</h3>
            {/* <div class="color-disabled">
              <Tooltip
                title={
                  <div style="white-space: nowrap;">
                    <div>开启后支持自定义时间，否则默认：</div>
                    <div>起始日期 00:00:00，结束日期 23:59:59</div>
                  </div>
                }
              >
                &emsp;显示时间：
                <Switch
                  size="small"
                  checked={instance.value.customDateTime}
                  onChange={(value) => {
                    instance.value.customDateTime = value as boolean
                  }}
                />
              </Tooltip>
            </div> */}
            <div class="preview">
              <Title />
            </div>
            <div>
              <Button size="small" onClick={onCancel}>
                取消
              </Button>
              <Button style="margin-left: 8px;" size="small" type="primary" onClick={onConfirm}>
                确定
              </Button>
            </div>
          </div>
          <div class="g_dynamic-range-picker__content">
            <ShortCuts />
            <div class="g_dynamic-range-picker__calendar-wrap">
              <CustomControls />
              <div class="g_dynamic-range-picker__start-calendar">
                <div class="title">
                  <div>开始日期</div>
                  <DynamicControls1 />
                </div>
                <Calendar
                  // @ts-ignore
                  calendar={instance.value.calendar1}
                  onDateClick={(date) => {
                    instance.value.onDateClick(date)
                  }}
                />
              </div>
              <div class="g_dynamic-range-picker__end-calendar">
                <div class="title">
                  <div>结束日期</div>
                  <DynamicControls2 />
                </div>
                <Calendar
                  // @ts-ignore
                  calendar={instance.value.calendar2}
                  onDateClick={(date) => {
                    instance.value.onDateClick(date)
                  }}
                />
              </div>
            </div>
          </div>

          {/* <Popover open placement="bottomLeft" content={<JsonView defaultUnfold data={debugData.value} />}>
            <div>.</div>
          </Popover> */}
        </div>
      )
    }
  }
})

const Calendar = defineComponent({
  props: {
    calendar: {
      type: Object as PropType<CalendarView>,
      required: true
    }
  },
  emits: {
    dateClick: (date: dayjs.Dayjs | string) => true
  },
  setup(props, { emit }) {
    const dates = CalendarView.useComputedDates(props.calendar)

    const onItemClick = (item: (typeof dates.value)[number]) => {
      if (item.disabled) {
        return void 0
      }
      const date = item.day
      props.calendar.update(date)
      emit('dateClick', date)
    }

    return () => {
      return (
        <div class="g_dynamic-range-picker__calendar">
          <div class="month number-font">{props.calendar.date.format('M')}</div>
          <div class="header">
            <div class="control prev-year" onClick={() => props.calendar.prevYear()}>
              <Icon name="left" />
            </div>
            <div class="control prev-month" onClick={() => props.calendar.prevMonth()}>
              <Icon name="left" />
            </div>
            <div class="title">{props.calendar.Title}</div>
            <div class="control next-year" onClick={() => props.calendar.nextMonth()}>
              <Icon name="right" />
            </div>
            <div class="control next-year" onClick={() => props.calendar.nextYear()}>
              <Icon name="right" />
            </div>
          </div>
          <div class="days">
            <i>一</i>
            <i>二</i>
            <i>三</i>
            <i>四</i>
            <i>五</i>
            <i>六</i>
            <i>日</i>
          </div>
          <div class="dates number-font">
            {dates.value.map((item) => {
              return (
                <i
                  class={{
                    clickable: true,
                    beyond: item.before || item.after,
                    start: item.start,
                    end: item.end,
                    contain: item.contain,
                    disabled: item.disabled
                  }}
                  onClick={() => onItemClick(item)}
                >
                  {item.D}
                </i>
              )
            })}
          </div>
        </div>
      )
    }
  }
})

const CustomDays = defineComponent({
  props: {
    label: {
      type: String as PropType<'过去' | '未来'>,
      default: '过去'
    },
    checked: {
      type: Boolean,
      default: false
    },
    value: {
      type: Number
    }
  },
  emits: {
    click: () => true,
    change: (value: number) => true
  },
  setup(props, { emit }) {
    const value = ref<number | undefined>(props.value)
    watch(
      () => props.value,
      (newVal) => {
        value.value = newVal
      }
    )

    const inputRef = ref<HTMLInputElement>()
    const onClick = () => {
      emit('click')
      select()
    }

    const isActive = computed(() => {
      return props.checked
    })

    const isFocus = ref(false)

    const select = () => {
      nextTick(() => {
        inputRef.value?.focus()
        inputRef.value?.select()
      })
    }

    watch(
      () => isActive.value,
      () => {
        if (isActive.value) {
          select()
        }
      }
    )

    const onInput = (e: any) => {
      const v = Number(e.target.value)
      // 只允许输入正整数

      if (isNaN(v) || !(v > 0)) {
        value.value = undefined
        message.info('请输入正整数')
      } else {
        value.value = Math.abs(Math.round(v))
        emit('change', value.value!)
      }
    }

    return () => {
      return (
        <Button class="button" type={isActive.value ? 'primary' : 'default'} onClick={onClick}>
          <div class={['custom-days', isActive.value && 'active']}>
            {props.label}
            <div class="input-wrap number-font">
              <Tooltip title="请输入天数" open={isFocus.value}>
                <span class="text-plc">{isActive.value ? value.value || 'N' : 'N'}</span>
              </Tooltip>
              <input
                ref={inputRef}
                class="input"
                placeholder="N"
                type="number"
                value={isActive.value ? value.value : ''}
                onInput={onInput}
                onFocus={() => {
                  isFocus.value = true
                }}
                onBlur={() => {
                  isFocus.value = false
                }}
              />
            </div>
            天
          </div>
        </Button>
      )
    }
  }
})

const CustomDate = defineComponent({
  props: {
    date: {
      type: String
    }
  },
  emits: {
    change: (date: string) => true
  },
  setup(props) {
    return () => {
      return <Button></Button>
    }
  }
})

const CustomRule = defineComponent({
  props: {
    customDateTime: {
      type: Boolean,
      default: false
    },
    value: {
      type: Number
    }
  },
  emits: {
    change: (value: number) => true
  },
  setup(props) {
    const start = ref<DynamicDefine>({
      mode: DynamicDateMode.PAST,
      date: undefined,
      time: undefined,
      n: 7
    })

    const end = ref<DynamicDefine>({
      mode: DynamicDateMode.TODAY,
      date: undefined,
      time: undefined,
      n: undefined
    })

    const Controls = (type: 'start' | 'end') => {
      const target = type === 'start' ? start.value : end.value

      return (
        <>
          <Popover
            content={
              <div class="g_dynamic-range-picker__dynamic-controls" style="position: relative;">
                <Button
                  class="button"
                  type={target.mode === DynamicDateMode.YESTERDAY ? 'primary' : 'default'}
                  onClick={() => {
                    target.mode = DynamicDateMode.YESTERDAY
                  }}
                >
                  昨日
                </Button>
                <Button
                  class="button"
                  type={target.mode === DynamicDateMode.TODAY ? 'primary' : 'default'}
                  onClick={() => {
                    target.mode = DynamicDateMode.TODAY
                  }}
                >
                  今日
                </Button>
                <Button
                  class="button"
                  type={target.mode === DynamicDateMode.TOMORROW ? 'primary' : 'default'}
                  onClick={() => {
                    target.mode = DynamicDateMode.TOMORROW
                  }}
                >
                  明日
                </Button>
                <Popover
                  content={
                    <div>
                      <Input
                        type="date"
                        value={target.date?.format('YYYY-MM-DD')}
                        onChange={(value) => {
                          target.date = value
                        }}
                      />
                    </div>
                  }
                >
                  <Button
                    class="button"
                    type={target.mode === DynamicDateMode.STATIC ? 'primary' : 'default'}
                    onClick={() => {
                      target.mode = DynamicDateMode.STATIC
                    }}
                  >
                    具体日期
                  </Button>
                </Popover>
                <CustomDays
                  label="过去"
                  checked={target.mode === DynamicDateMode.PAST}
                  onClick={() => {
                    target.mode = DynamicDateMode.PAST
                  }}
                  value={target.n}
                  onChange={(value) => {
                    target.n = value
                  }}
                />
                <CustomDays
                  label="未来"
                  checked={target.mode === DynamicDateMode.FUTURE}
                  onClick={() => {
                    target.mode = DynamicDateMode.FUTURE
                  }}
                  value={target.n}
                  onChange={(value) => {
                    target.n = value
                  }}
                />
              </div>
            }
          >
            <div class="item clickable">
              {type === 'start' ? '开始' : '结束'}
              <div class="tag">
                {target.mode === DynamicDateMode.YESTERDAY
                  ? '昨日'
                  : target.mode === DynamicDateMode.TODAY
                    ? '今日'
                    : target.mode === DynamicDateMode.TOMORROW
                      ? '明日'
                      : target.mode === DynamicDateMode.STATIC
                        ? target.date?.format('YYYY-MM-DD') || '具体日期'
                        : ''}
                {target.mode === DynamicDateMode.PAST
                  ? `过去 ${target.n ?? 'n'} 天`
                  : target.mode === DynamicDateMode.FUTURE
                    ? `未来 ${target.n ?? 'n'} 天`
                    : ''}
              </div>
            </div>
          </Popover>
          {props.customDateTime && <div class="tag time clickable">{target.time || DEFAULT_START_TIME}</div>}
        </>
      )
    }

    const ReferenceDate = () => {
      return (
        <Tooltip title="参考日期">
          <div class="item default clickable">(今天)</div>
        </Tooltip>
      )
    }

    // const TimeRange = () => {
    //   if (!props.customDateTime) {
    //     return null
    //   }
    //   return (
    //     <Tooltip title="开始日期时间, 结束日期时间 ">
    //       <div class="item default clickable">[00:00:00,23:59:59]</div>
    //     </Tooltip>
    //   )
    // }

    return () => {
      return (
        <div class="g_dynamic-range-picker__custom-rule">
          {Controls('start')}
          <span style="margin: 0 8px;">～</span>
          {Controls('end')}
          {/* <ReferenceDate /> */}
          <TimeRange />
        </div>
      )
    }
  }
})
