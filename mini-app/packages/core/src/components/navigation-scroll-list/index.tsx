/*
* 带顶部tab栏切换的滑动列表,解放你的导航栏列表组件
* n-scroll-navigation-content 顶部tab栏目背景色,默认#fff
.n-scroll-navigation-content {
  background: none !important;
}
* 修改激活样式底部颜色:
.n-scroll-navigation-content {
  .active {
    &::before {
      background-color: rgba(98, 124, 255, 1) !important;
    }
  }
}
* */
import './style.scss'
import { defineComponent, PropType, ref } from 'vue'
import { usePagination } from '../../hooks'
import { AxiosPromise } from 'axios'
import { ScrollTab, ScrollTabItem } from '@pkg/ui'
import { Swiper, SwiperItem } from '@tarojs/components'
import { ScrollList, ScrollListRefType } from '@pkg/core'

// ref的类型
export interface navigationIRefType extends ScrollListRefType {
  currentTab: number
  toggleTab: (i: number) => void
  refreshData: () => void
  ScrollRefs: Partial<ScrollListRefType>[]
  listData: any
}

/*
 * @description 导航栏数组
 * request item的request优先于props的request
 *
 * value 唯一索引,上下两个swiper的关联
 *
 * render 接受的第一个参数是你请求列表的item,第二个参数是你传入的 navigateTo
 *
 * navigateTo render可能会允许点击跳转
 *
 * height 指定了item的高度,它就不会使用props的height
 * */
export interface navigationItemType<T = any> {
  // item的request优先于props的request
  request: (pars?: any) => AxiosPromise<T>
  label: string
  // value传入数组的index即可
  value: number
  render: (item?: any, ...rest: any[]) => any
  // 指定了item的高度,它就不会使用props的height
  height?: string
  // render可能会允许点击跳转
  navigateTo?: (item: any) => void
}

export default defineComponent({
  name: 'NavigationScrollList',
  props: {
    // 导航栏数组
    navigationList: {
      type: Array as PropType<Partial<navigationItemType>[]>,
      default: () => [{}]
    },
    height: {
      type: String,
      default: '90vh'
    },
    // 也是request,优先级低
    request: {
      type: Function,
      required: true,
      default: () => false
    },
    // params 将会传递给每一个request
    pars: {
      type: Object,
      default: () => ({})
    },
    // scrollList的配置项
    usePagination: {
      type: Object as PropType<typeof usePagination>,
      default: {} as typeof usePagination
    }
  },
  setup(props, { slots, expose }) {
    // 为每个tab维护独立的ScrollRef
    const ScrollRefs = ref<Partial<ScrollListRefType>[]>(props.navigationList.map(() => ({})))
    const currentTab = ref(props.navigationList[0].value)
    //切换当前激活tab
    const toggleTab = index => {
      currentTab.value = index
    }
    expose({
      currentTab,
      toggleTab,
      refreshData: () => {
        // 刷新所有ScrollList的数据
        ScrollRefs.value.forEach(ref => {
          ref?.refreshData?.()
        })
      },
      // 暴露所有ScrollRef以便外部访问
      ScrollRefs,
      // 获取当前激活tab的数据
      get listData() {
        return ScrollRefs.value[currentTab.value]?.data
      }
    })

    return () => {
      return (
        <div class="n-scroll-list-content">
          <div class="n-scroll-navigation-content">
            <ScrollTab current={currentTab.value}>
              <div class="n-scroll-navigation-tabs">
                {props.navigationList.map((it, index) => {
                  return (
                    <ScrollTabItem>
                      <div
                        class={['n-scroll-navigation-tabs-item', index === currentTab.value && 'active']}
                        onClick={() => {
                          toggleTab(index)
                        }}
                      >
                        {it.label}
                      </div>
                    </ScrollTabItem>
                  )
                })}
              </div>
            </ScrollTab>
          </div>
          {/* 在tab栏和scrollList之间的展示,可能会存在 */}
          {slots?.centerContent?.()}
          <Swiper
            current={currentTab.value}
            onChange={e => {
              currentTab.value = e.target.current
            }}
            class="n-scroll-swiper"
            style={{
              height: props.height
            }}
          >
            {props.navigationList.map((it, index) => {
              return (
                <SwiperItem>
                  <ScrollList
                    pars={props.pars}
                    height={it?.height || props.height}
                    ref={el => {
                      if (el) ScrollRefs.value[index] = el
                    }}
                    request={it.request || props?.request}
                  >
                    {z => it.render(z, it?.navigateTo)}
                  </ScrollList>
                </SwiperItem>
              )
            })}
          </Swiper>
        </div>
      )
    }
  }
})
