import { BasePage, useAppStore, usePagination } from '@pkg/core'
import { computed, defineComponent, ref } from 'vue'
import './style.scss'
import { ScrollView } from '@tarojs/components'
import { Search } from '@pkg/ui'
import { useRouter } from '@tarojs/taro'
import GoodsList from '../../../components/goods-list'
import { navigateToSearch } from '../../../router'
import { $getGoodsList, requestGetSearchResults } from '../../../api'
import { GoodsItemOptions } from '../../../components/goods-item'
import { storeToRefs } from 'pinia'

definePageConfig({
  navigationStyle: 'custom',
  disableScroll: true
})

export default defineComponent({
  name: 'GoodsListPage',
  props: {
    // 如果作为选择器,则换个请求接口
    asSelector: {
      type: Boolean,
      default: false
    },
    select: {
      type: Function,
      default: () => ({})
    }
  },
  emits: ['change'],
  setup(props, { emit }) {
    const route = useRouter()
    const initialKeywords = decodeURIComponent(route.params.keywords ?? '')
    const appStore = useAppStore()
    const { commonPageHeightStyle } = storeToRefs(appStore)

    const styleRef = computed(() => {
      return {
        height: `${appStore.menuButtonRect!.height + 2}px`
      }
    })

    const keywords = ref(initialKeywords)

    const onSearchClick = () => {
      navigateToSearch({ redirect: true, keywords: keywords.value })
    }
    const { fetchData, data, refreshData, refresherTriggered, CommonPaginationStatus } = usePagination({
      requestHandler: pagination => {
        return props?.asSelector
          ? $getGoodsList({ ...pagination, keywords: keywords.value })
          : requestGetSearchResults({ ...pagination, keywords: keywords.value })
      }
    })

    fetchData()

    const goodsList = computed(() => {
      return data.value.map(item => {
        const goods: GoodsItemOptions = {
          id: item.id,
          name: item.title,
          price: item.priceMin,
          priceMax: item.priceMax,
          listPrice: item.underlinePrice,
          image: item.coverImages?.[0]
        }
        return goods
      })
    })

    return () => {
      return (
        <BasePage
          navigator={{
            showMenuButton: false,
            title: (
              <div style={styleRef.value} class="p_goods-list__search" onClick={onSearchClick}>
                {props?.asSelector ? <div></div> : <Search value={keywords.value} placeholder="搜索你感兴趣的内容" />}
                <div
                  class="clear"
                  onClick={() => {
                    keywords.value = ''
                  }}
                ></div>
              </div>
            )
          }}
          class="p_goods-list"
        >
          <ScrollView
            scrollY
            refresherEnabled
            refresherTriggered={refresherTriggered.value}
            onRefresherrefresh={() => refreshData()}
            class="p_goods-list__scroll"
            style={commonPageHeightStyle.value}
          >
            <div class="p_goods-list__content">
              <GoodsList
                list={goodsList.value}
                asSelector={props.asSelector}
                select={e => {
                  emit('change', e)
                }}
              />
              <CommonPaginationStatus />
            </div>
          </ScrollView>
        </BasePage>
      )
    }
  }
})
