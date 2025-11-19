import { defineComponent } from 'vue'
import SuitableShops from '../../../../components/suitable-shops'
import { useGoodsDetailStore } from '../store'
import { storeToRefs } from 'pinia'
import { GOODS_TYPE_STORE_VERIFICATION } from '../../../../constants'

export default defineComponent({
  setup() {
    const goodsDetailStore = useGoodsDetailStore()
    const { goodsDetail } = storeToRefs(goodsDetailStore)
    return () => {
      // 仅门店核销类型商品显示
      if (goodsDetail.value?.type !== GOODS_TYPE_STORE_VERIFICATION) {
        return null
      }

      if (goodsDetail.value.stores.length === 0) {
        return null
      }

      return (
        <SuitableShops
          goodsId={goodsDetail.value.id}
          total={goodsDetail.value.storeNum}
          shops={goodsDetail.value.stores.map(item => {
            return {
              id: item.id,
              name: item.name,
              openAt: item.openingAt,
              closeAt: item.closingAt,
              address: item.address,
              longitude: item.longitude,
              latitude: item.latitude,
              distance: item.distance ? (item.distance as number) / 1000 : undefined,
              tell: item.contactInfo?.[0]?.contactPhone
            }
          })}
        />
      )
    }
  }
})
