import { useLoadMore, usePagination } from '@anteng/core'
import { computed, defineComponent, PropType, ref } from 'vue'
import GoodsList from '../../../components/goods-list'
import { requestGetGroupGoods } from '../../../api'
import { GoodsItemOptions } from '../../../components/goods-item'
import { DeckComponentConfig } from '../types'

export default defineComponent({
  props: {
    comp: {
      type: Object as PropType<
        DeckComponentConfig<{
          goodsGroupId: string
        }>
      >,
      required: true
    }
  },
  setup(props) {
    const groupId = ref(props.comp.config.goodsGroupId)

    const { data, fetchData, Loading } = usePagination({
      showLoading: true,
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

    const { onLoadMore, LoadMoreAnchor } = useLoadMore()

    onLoadMore(() => {
      fetchData()
    })

    return () => {
      if (goodsList.value.length === 0) return null
      return (
        <div>
          <GoodsList list={goodsList.value} />
          <Loading />
          <LoadMoreAnchor />
        </div>
      )
    }
  }
})
