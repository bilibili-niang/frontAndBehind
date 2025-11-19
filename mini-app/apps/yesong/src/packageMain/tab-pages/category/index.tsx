import { BasePage, isThePage, safeParse, Spin, useAppStore, usePagination, usePopup } from '@anteng/core'
import { computed, defineComponent, ref, watch } from 'vue'
import './style.scss'
import { Image, ScrollView } from '@tarojs/components'
import { Icon, ScrollTab, ScrollTabItem, Search } from '@anteng/ui'
import EmptyStatus from '@anteng/core/src/components/empty-status'
import { storeToRefs } from 'pinia'
import { useCategoryStore, useGlobalStore } from '../../../stores'
import { navigateToGoodsDetail, navigateToSearch } from '../../../router'
import GoodsItem from '../../../components/goods-item'
import Taro, { nextTick, useRouter } from '@tarojs/taro'
import { ROUTE_CATEGORY } from '../../../router/routes'
import { requestGetGoodsCategoryGoods } from '../../../api/goods/category'
import { GOODS_CATEGORY_TYPE_ACTION } from '../../../constants'
import useAction from '../../../hooks/useAction'
import { findCategoryById } from './utils'
import { uuid } from '@anteng/utils'
import { findLastIndex, uniqBy } from 'lodash-es'
import axios from 'axios'

export default defineComponent({
  name: 'IndexCategoryPage',
  props: {
    isPage: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    console.log('%c 页面加载：category', 'color:#27ae60')

    const route = useRouter()

    /** 页面进入时指定的分类id */
    let initialCate = route.params.id || ''
    let childrenId = route.params.childrenId || ''

    /** 是否作为单独页面（在 /packageIndex/index 内则作为组件），会有某些区别进行特殊处理 */
    const isPage = props.isPage || isThePage(route.path, ROUTE_CATEGORY)
    const globalStore = useGlobalStore()
    const { currentTab } = storeToRefs(globalStore)

    // TODO 优化 activated 回调
    watch(
      () => currentTab.value,
      key => {
        if (key === 'category') {
          categoryStore.loadCategoryData()
        }
      }
    )

    const appStore = useAppStore()
    const { commonNavigatorHeight } = storeToRefs(appStore)

    const categoryStore = useCategoryStore()
    const { categoryData, isLoading } = storeToRefs(categoryStore)

    categoryStore.loadCategoryData()

    const currentCateIndex1 = ref(0)
    const currentCateIndex2 = ref(0)
    // 如果要新增一个「全部」按钮，初始值可以设置成 -1，获取 cate2 下的全部数据
    const currentCateIndex3 = ref(0)
    const tempCateIndex3 = ref(0)

    let hasAutoFocused = false
    const autoFocus = () => {
      if (hasAutoFocused || !categoryData.value) return void 0

      // 尝试聚焦到页面参数指定的分类
      if (initialCate) {
        const target = findCategoryById(categoryData.value, initialCate)
        if (target) {
          currentCateIndex1.value = target.path[0] || 0
          currentCateIndex2.value = target.path[1] || 0
          currentCateIndex3.value = target.path[2] || 0

          initialCate = ''
          hasAutoFocused = true
          if (childrenId) {
            cates2.value.find((it, index) => {
              if (it.id === childrenId) {
                toggleCate2(index)
              }
            })
          }
          return void 0
        }
      }

      // 默认聚焦到第一个有分类数据的分类
      const firstIndex = categoryData.value?.findIndex(item => item.childCategories?.length > 0) ?? 0
      if (firstIndex > -1) {
        currentCateIndex1.value = firstIndex
        hasAutoFocused = true
      }
    }

    const cates1 = computed(() => {
      return categoryData.value ?? []
    })

    const currentCate1 = computed(() => cates1.value[currentCateIndex1.value])

    const cates2 = computed(() => {
      return currentCate1.value?.childCategories ?? []
    })

    const currentCate2 = computed(() => currentCate1.value?.childCategories?.[currentCateIndex2.value])

    const cates3 = computed(() => {
      return currentCate2.value?.childCategories ?? []
    })

    const currentCate3 = computed(() => currentCate2.value?.childCategories?.[currentCateIndex3.value])

    const toggleCate1 = (index: number) => {
      cancel()
      currentCateIndex1.value = index
      currentCateIndex2.value = 0
      currentCateIndex3.value = 0
      tempCateIndex3.value = 0
      closePopup()
      allData.value = []
      allGoodsIds.splice(0)
      scrollTop.value = 0
      tempScrollTop = 0
      isExclusive.value = false
      handleRefreshData()
    }
    const toggleCate2 = (index: number) => {
      cancel()
      const target = cates2.value[index]
      // 二级分类支持点击动作
      if (target.type === GOODS_CATEGORY_TYPE_ACTION) {
        useAction(safeParse(target.url))
        return void 0
      }
      currentCateIndex2.value = index
      currentCateIndex3.value = 0
      tempCateIndex3.value = 0
      allData.value = []
      allGoodsIds.splice(0)
      scrollTop.value = 0
      tempScrollTop = 0
      isExclusive.value = false
      if (!currentCate3.value) {
        isExclusive.value = true
      }
      handleRefreshData()
    }
    const toggleCate3 = (index: number) => {
      currentCateIndex3.value = index
      if (!allData.value[currentCateIndex3.value]) {
        isExclusive.value = true
        handleRefreshData()
      } else {
        isExclusive.value = false
        ignoreScrollAnchor.value = true
        setTimeout(() => {
          ignoreScrollAnchor.value = false
        }, 600)
        scrollViewQuery.exec(res => {
          anchorQuery.exec(anchorRes => {
            scrollTop.value = tempScrollTop
            nextTick(() => {
              scrollTop.value =
                anchorRes[0][currentCateIndex3.value].top + res[1].scrollTop - res[0].top - anchorRes[1].height
            })
          })
        })
      }
    }

    const isFold = ref(true)
    let closePopup = () => {}
    const onExpand = () => {
      if (!isFold.value) {
        isFold.value = true
        closePopup()
        return void 0
      }
      isFold.value = false
      const { close } = usePopup({
        zIndex: 78,
        content: () => (
          <div class="cates-layer" style={{ paddingTop: commonNavigatorHeight.value + 'px' }}>
            <div class="category-page__cate-list">
              <div class="category-page__cate-content">
                {cates1.value.map((item, index) => {
                  return (
                    <div
                      class={['cate-item', index === currentCateIndex1.value && 'active']}
                      onClick={() => {
                        toggleCate1(index)
                      }}
                    >
                      <div class="cate-item__image ellipse">
                        {item.icon && <Image class="image ellipse" mode="aspectFill" src={item.icon} />}
                      </div>
                      <div class="cate-item__name">{item.name}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        ),
        placement: 'top',
        onClose: () => (isFold.value = true)
      })
      closePopup = close
    }

    const scrollViewId = `scroll-view-${uuid()}`
    const scrollTop = ref(0)
    let tempScrollTop = 0
    const scrollViewQuery = Taro.createSelectorQuery()
    scrollViewQuery.select(`.${scrollViewId}`).boundingClientRect()
    scrollViewQuery.select(`.${scrollViewId}`).scrollOffset()

    const ignoreScrollAnchor = ref(false)
    const anchorQuery = Taro.createSelectorQuery()
    anchorQuery.selectAll('.category-page__cate-anchor').boundingClientRect()
    anchorQuery.select('.category-page__content-header').boundingClientRect()

    const onScroll = e => {
      tempScrollTop = e.detail.scrollTop
      if (ignoreScrollAnchor.value) return void 0
      if (isExclusive.value) return void 0
      scrollViewQuery.exec(res => {
        anchorQuery.exec(anchorRes => {
          let index = findLastIndex(anchorRes[0], (item: any) => item.top - anchorRes[1].height - res[0].top <= 10)
          index = index > 0 ? index : 0
          currentCateIndex3.value = index
        })
      })
    }

    const customEmpty = () => {
      return <EmptyStatus title="空空如也" description="该分类暂无商品" />
    }
    const customErrorStatus = (Actions: any) => {
      return <EmptyStatus size="small" description="商品加载失败" actions={Actions} />
    }

    let cancel = () => {}

    const {
      data,
      fetchData,
      refreshData,
      Empty,
      EndTip,
      refresherTriggered,
      Loading,
      ErrorStatus,
      isEnd,
      resetPaginationData
    } = usePagination({
      requestHandler: params => {
        const source = axios.CancelToken.source()
        cancel = () => {
          source.cancel()
          resetPaginationData()
        }
        return requestGetGoodsCategoryGoods(
          {
            ...params,
            id: cates3.value[tempCateIndex3.value]?.id
          },
          source.token
        )
      },
      onRequestResolve: () => {
        allData.value[tempCateIndex3.value] = allData.value[tempCateIndex3.value] || []
        // TODO 折叠过滤掉重复数据
        const newData = data.value
        // .filter(item => !allGoodsIds.find(id => item.id === id))
        allGoodsIds.push(...newData.map(item => item.id))
        allData.value[tempCateIndex3.value].push(...newData)
        if (isEnd.value) {
          const nextCate = cates3.value[tempCateIndex3.value + 1]
          if (nextCate) {
            // console.log('加载结束了，准备加载下一分类：', nextCate.name)
            tempCateIndex3.value++
            // 清除分页信息 => { current: 1, records: [], ... }, isEnd: false, hasError: false
            resetPaginationData()
          }
        }
        nextTick(() => {
          scrollViewQuery.exec(res => {
            // 如果可继续滑动距离小于一屏，继续加载
            const screenHeight = appStore.systemInfo.screenHeight
            const isAtBottom = res[1].scrollTop + screenHeight >= res[1].scrollHeight - screenHeight / 2
            if (isAtBottom) {
              // console.log('继续加载下一页')
              fetchData()
            }
          })
        })
      }
    })

    const {
      data: exclusiveData,
      fetchData: fetchExclusiveData,
      refreshData: refreshExclusiveData,
      Empty: ExclusiveEmpty,
      EndTip: ExclusiveEndTip,
      refresherTriggered: exclusiveRefresherTriggered,
      Loading: ExclusiveLoading,
      ErrorStatus: ExclusiveErrorStatus
    } = usePagination({
      requestHandler: params => {
        const id = currentCate3.value?.id ?? currentCate2.value?.id
        return requestGetGoodsCategoryGoods({
          ...params,
          id: id
        })
      },
      customEmpty,
      customErrorStatus
    })

    /* ---------------------------------- 预备方案 ---------------------------------- */
    /**
     * 支持在一个列表里展示多个分类的数据，适用于分类数据足够多，且各分类商品重复率较低的情况
     * 全部数据, [...分类1, ...分类2, ...分类n]
     * 1. 判断第上一个分类 isEnd，若页面底部距离 < 40vh，立即触发下一个分类数据请求
     * 2. 点击分类标签时：
     *  a. 若该分类已经加载过，列表滚动到对应的位置。
     *  b. 该分类没有加载过，设置 isExclusive 为 true，列表将展示 data.value 数据
     *  c. 当分类又切换回已经加载过的分类时，设置 isExclusive 为 false， 列表展示 allData.value 数据
     *  d. 分类已加载：Array.isArray(allData.value[currentIndex3.value])
     */
    const allData = ref<(typeof data.value)[]>([])
    const allGoodsIds: string[] = []

    /** 当前分类数据独占 */
    const isExclusive = ref(false)

    const renderData = computed(() => {
      return isExclusive.value ? [data.value] : allData.value
    })

    /* ----------------------------------- End ---------------------------------- */

    const handleFetchData = () => {
      isExclusive.value ? fetchExclusiveData() : fetchData()
    }
    const handleRefreshData = (isRefresherPulling = false) => {
      if (currentCate2.value && (!currentCate3.value || cates3.value.length <= 1)) {
        isExclusive.value = true
      }
      if (isExclusive.value) {
        return refreshExclusiveData({
          clearDataImmediate: true,
          isRefresherPulling: isRefresherPulling
        })
      }
      allData.value = []
      currentCateIndex3.value = 0
      tempCateIndex3.value = 0
      resetPaginationData()
      refreshData({
        clearDataImmediate: true,
        isRefresherPulling: isRefresherPulling
      })
    }

    watch(
      () => categoryData.value,
      () => {
        autoFocus()
        handleRefreshData(true)
      },
      {
        immediate: true
      }
    )

    const Cate2 = () => {
      return (
        <div class="side-menu">
          <ScrollTab current={currentCateIndex2.value} vertical>
            {cates2.value.map((item, index) => {
              const active = index === currentCateIndex2.value
              return (
                <ScrollTabItem key={item.id}>
                  <div
                    class={['side-menu-item', active && 'active']}
                    onClick={() => {
                      toggleCate2(index)
                    }}
                  >
                    {item.icon && (
                      <Image key={item.id} class="side-menu-item__image" mode="heightFix" src={item.icon} />
                    )}
                    {item.name}
                    {active && (
                      <>
                        <div class="arc-before"></div>
                        <div class="arc-after"></div>
                      </>
                    )}
                  </div>
                </ScrollTabItem>
              )
            })}
          </ScrollTab>
        </div>
      )
    }

    const Cate3 = () => {
      return cates3.value.length > 1 ? (
        <ScrollTab current={currentCateIndex3.value}>
          <div class="category-page__tags">
            {/* <ScrollTabItem>
              <div
                class={['category-page__tag', !currentCate3.value && 'active']}
                onClick={() => {
                  currentCateIndex3.value = -1
                }}
              >
                全部
              </div>
            </ScrollTabItem> */}
            {cates3.value.map((item, index) => {
              const active = index === currentCateIndex3.value
              return (
                <ScrollTabItem>
                  <div
                    class={['category-page__tag', active && 'active']}
                    onClick={() => {
                      toggleCate3(index)
                    }}
                  >
                    {item.icon && <Image src={item.icon} mode="heightFix" class="category-page__tag-image" />}
                    {item.name}
                  </div>
                </ScrollTabItem>
              )
            })}
          </div>
        </ScrollTab>
      ) : null
    }

    const Main = () => {
      if (cates2.value.length === 0) {
        return (
          <div class="category-page__main">
            <EmptyStatus title="空空如也" description="该分类暂无商品" />
          </div>
        )
      }
      return (
        <div class="category-page__main">
          <Cate2 />
          <ScrollView
            class={['category-page__content-scroller', scrollViewId]}
            scrollY
            scrollTop={scrollTop.value}
            scrollWithAnimation={false}
            onScroll={onScroll}
            refresherEnabled={isExclusive.value}
            onRefresherrefresh={() => handleRefreshData(true)}
            onScrolltolower={handleFetchData}
            refresherTriggered={isExclusive.value ? exclusiveRefresherTriggered.value : refresherTriggered.value}
          >
            <div class="category-page__content">
              {/* <div
                onClick={() => {
                  useToast('你点击了广告位。')
                }}
              >
                <Image
                  class="category-page__banner"
                  src="https://dev-cdn.anteng.cn/upload/20240514/8f6516c361bdcf92433128f3a1a522a3.webp"
                  mode="widthFix"
                />
              </div> */}

              <div class="category-page__content-header">
                <Cate3 />
                {/* <div class="category-page__filter"></div> */}
              </div>
              <GoodsList />
            </div>
          </ScrollView>
        </div>
      )
    }

    const GoodsItemMapper = (item: (typeof data.value)[number], index, arr) => {
      return (
        <>
          <GoodsItem
            type="horizontal"
            name={item.title}
            nameMaxRows={2}
            image={item.coverImages?.[0]}
            price={item.priceMin}
            priceMax={item.priceMax}
            listPrice={item.underlinePrice}
            onClick={() => {
              navigateToGoodsDetail(item.id)
            }}
          />
          {index < arr.length - 1 && <div class="category-page__content-split"></div>}
        </>
      )
    }

    const GoodsList = () => {
      if (isExclusive.value) {
        return (
          <div class="category-page__goods">
            {uniqBy(exclusiveData.value, 'id').map(GoodsItemMapper)}
            <ExclusiveErrorStatus />
            <ExclusiveLoading />
            <ExclusiveEmpty />
            <ExclusiveEndTip />
          </div>
        )
      }
      return (
        <div class="category-page__goods">
          {renderData.value.map((group, index) => {
            return (
              <>
                <div class="category-page__cate-anchor">
                  {cates3.value[index]?.name}
                  {!isLoading.value && group.length === 0 && (
                    <div class="category-page__cate-empty">该分类暂无商品</div>
                  )}
                </div>
                {uniqBy(group, 'id').map(GoodsItemMapper)}
              </>
            )
          })}
          <ErrorStatus />
          <Loading small={allGoodsIds.length > 0} />
          {/* <Empty /> */}
          <EndTip />
        </div>
      )
    }

    const SearchBar = () => {
      return (
        <div class="category-page-search" style={{ height: appStore.menuButtonRect!.height + 2 + 'px' }}>
          <Search
            placeholder="搜索你感兴趣的内容"
            onClick={() => {
              navigateToSearch()
            }}
          />
        </div>
      )
    }

    return () => {
      if (!categoryData.value || categoryData.value.length === 0) {
        return (
          <BasePage
            class="category-page-wrap"
            tabsPlaceholder
            navigator={{
              navigatorStyle: isPage ? undefined : 'blank',
              title: <SearchBar />,
              hiddenH5Menu: true
            }}
          >
            {isLoading.value ? <EmptyStatus image={<Spin />} description="" /> : <EmptyStatus title="无分类" />}
          </BasePage>
        )
      }

      return (
        <BasePage
          class="category-page-wrap"
          navigator={{
            navigatorStyle: isPage ? undefined : 'blank',
            title: <SearchBar />,
            hiddenH5Menu: true,
            navigationBarTextStyle: 'black'
          }}
          tabsPlaceholder={!isPage}
        >
          <div class="category-page">
            <div class={['category-page__header', !isFold.value && 'expand']}>
              <div class="category-page__cate-list">
                <ScrollTab current={currentCateIndex1.value} ratio={0.3}>
                  <div class="category-page__cate-content">
                    {cates1.value.map((item, index) => {
                      return (
                        <ScrollTabItem>
                          <div
                            class={['cate-item', index === currentCateIndex1.value && 'active']}
                            onClick={() => {
                              toggleCate1(index)
                            }}
                          >
                            <div class="cate-item__image ellipse">
                              {item.icon && <Image class="image ellipse" src={item.icon} />}
                            </div>
                            <div class="cate-item__name">{item.name}</div>
                          </div>
                        </ScrollTabItem>
                      )
                    })}
                  </div>
                </ScrollTab>
              </div>
              <div class="all-cates">全部分类</div>
              <div class="category-page__folder" onClick={onExpand}>
                {isFold.value ? '展开' : '收起'}
                <Icon name="right" />
              </div>
            </div>

            <Main />
          </div>
        </BasePage>
      )
    }
  }
})
