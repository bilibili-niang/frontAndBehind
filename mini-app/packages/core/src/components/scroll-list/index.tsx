// 翻页列表组件,解放你的分页
// FIXME 用到该组件可能会爆警告,但不知为何
import './style.scss'
import { computed, defineComponent, inject, onMounted, PropType, Ref } from 'vue'
import { usePagination } from '@pkg/core'
import { ScrollView } from '@tarojs/components'

/*
 * ScrollList的ref值
 * refreshData 刷新
 * data 列表数据,响应式
 * */
export interface ScrollListRefType {
  refreshData: () => void
  data: Ref<any[]>
}

export default defineComponent({
  name: 'ScrollList',
  props: {
    height: {
      type: String
    },
    request: {
      type: Function,
      required: true,
      default: () => ({})
    },
    // params
    pars: {
      type: Object,
      default: () => ({})
    },
    usePagination: {
      type: Object as PropType<typeof usePagination>,
      default: {} as typeof usePagination
    },
    refresherEnabled: {
      type: Boolean,
      default: true
    },
    // 是否在进入页面的时候就查询,可能不需要进入页面时查询数据
    autoFetch: {
      type: Boolean,
      default: true
    },
    // 下拉刷新颜色 黑/白
    refresherDefaultStyle: {
      type: String,
      default: 'black'
    },
    showEmpty: {
      type: Boolean,
      default: true
    }
  },
  setup(props, { slots, expose }) {
    const scrollStyle = computed(() => {
      return {
        height: props.height
      }
    })

    const {
      data,
      refreshData: refresh,
      refresherTriggered,
      fetchData,
      ErrorStatus,
      Empty,
      Loading,
      EndTip
    } = usePagination({
      requestHandler: pagination =>
        props?.request({
          ...pagination,
          descs: 'create_time',
          ...props?.pars
        }),
      ...props.usePagination
    })
    onMounted(() => {
      if (props.autoFetch) {
        fetchData()
      }
    })

    expose({
      refreshData: () => {
        // 静默刷新
        refresh({ isRefresherPulling: false })
      },
      data
    })
    const asTabPage = inject('asTabPage', false) ?? false

    return () => {
      return (
        <ScrollView
          refresherDefaultStyle={props.refresherDefaultStyle}
          class={['page-turning-list', asTabPage && 'as-tab-page']}
          scrollY
          refresherBackground="transparent"
          refresherTriggered={refresherTriggered.value}
          onRefresherrefresh={refresh}
          refresherEnabled={props.refresherEnabled}
          onScrolltolower={fetchData}
          style={scrollStyle.value}
        >
          {/*该类名可以控制内容布局为横向还是竖向*/}
          <div class="page-turning-list-item-content">
            {/*可能存在顶部插槽*/}
            {slots?.topSlots?.()}
            {data.value.map((it, index) => {
              return slots.default?.(it, index)
            })}
            {/*内容横向布局时可能存在占位内容*/}
            {slots?.bottomSlots?.()}
          </div>
          <div class="bottom-tips-content">
            {props.showErrorStatus ? <ErrorStatus /> : ''}
            <Loading />
            {props.showEmpty ? <Empty /> : ''}
            <EndTip />
          </div>
          <div class="bottom-block" />
        </ScrollView>
      )
    }
  }
})
