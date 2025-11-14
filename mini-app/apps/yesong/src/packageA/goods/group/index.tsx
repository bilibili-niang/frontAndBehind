import { BasePage, useAppStore, usePagination } from '@anteng/core'
import { computed, defineComponent, ref } from 'vue'
import GoodsList from '../../../components/goods-list'
import { IGoodsGroup, requestGetGoodsGroupDetail, requestGetGroupGoods } from '../../../api'
import { GoodsItemOptions } from '../../../components/goods-item'
import { ScrollView } from '@tarojs/components'
import { storeToRefs } from 'pinia'
import { useRouter } from '@tarojs/taro'
import Coupon from './coupon'

export default defineComponent({
  setup() {
    const router = useRouter()
    const groupId = ref(router.params.id ?? '')

    const appStore = useAppStore()
    const { commonPageHeightStyle } = storeToRefs(appStore)

    const groupDetailRef = ref<IGoodsGroup>()
    const getDetail = () => {
      requestGetGoodsGroupDetail(groupId.value)
        .then(res => {
          if (res.code === 200) {
            groupDetailRef.value = res.data
          }
        })
        .catch(() => {})
    }

    getDetail()

    const { data, fetchData, refresherTriggered, refreshData, Empty, EndTip, ErrorStatus, Loading } = usePagination({
      requestHandler: params => {
        return requestGetGroupGoods({
          ...params,
          groupId: groupId.value
        })
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
        <BasePage navigator={{ title: groupDetailRef.value?.name ?? '' }}>
          <ScrollView
            style={commonPageHeightStyle.value}
            scrollY
            refresherEnabled
            refresherTriggered={refresherTriggered.value}
            onRefresherrefresh={() => refreshData()}
            onScrolltolower={fetchData}
          >
            <div class="p_goods-list__content">
              <Coupon groupId={groupId.value} />
              <GoodsList list={goodsList.value} />
              <ErrorStatus />
              <Empty />
              <Loading />
              <EndTip />
            </div>
          </ScrollView>
        </BasePage>
      )
    }
  }
})
