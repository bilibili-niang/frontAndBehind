import { Icon } from '@pkg/ui'
import { computed, defineComponent, PropType } from 'vue'
import './style.scss'
import { EmptyStatus, useModal } from '@pkg/core'
import { IGoodsDetail } from '../../../../api/goods/types'
import { GOODS_TYPE_ENTITY } from '../../../../constants'
import { useGoodsDetailStore } from '../store'

export default defineComponent({
  name: 'GoodsDetailOtherInfo',
  props: {
    goodsDetail: {
      type: Object as PropType<IGoodsDetail>,
      required: true
    }
  },
  setup(props) {
    const goodsDetailStoreEntities = useGoodsDetailStore()

    const onShipClick = () => {
      goodsDetailStoreEntities.updatePageAddress()
    }

    const propertiesRef = computed<
      {
        id: string
        name: string
        value: any
      }[]
    >(() => {
      const { properties = [], values = {} } = props.goodsDetail.basicDescAttributeJson ?? {}
      return properties.map(item => {
        return {
          ...item,
          value: values[`id_${item.id}`]
        }
      })
    })

    const onPropertyClick = () => {
      if (propertiesRef.value.length === 0) return void 0
      useModal({
        title: '商品参数',
        content: (
          <div class="ship-modal">
            {propertiesRef.value.map(item => {
              return (
                <div class="property-item">
                  <div class="label">{item.name}</div>
                  <div class="value">{Array.isArray(item.value) ? item.value.join('、') : item.value}</div>
                </div>
              )
            })}
            {propertiesRef.value.length === 0 && <EmptyStatus title="无参数" description="请以商品详情为准" />}
          </div>
        ),
        placement: 'bottom'
      })
    }

    /** 发货地，获取 省 + 市 */
    const shipmentAddress = computed(() => {
      try {
        return props.goodsDetail.freightTemplate.shippingDistrict
          .slice(0, 2)
          .map(item => {
            return item.value.replace(/(省|市|自治区|自治州|县|区)$/g, '')
          })
          .join(' ')
      } catch (err) {
        return '未知'
      }
    })

    /** 收货地，获取 市 + 区 */
    const contactAddress = computed(() => {
      return ''
    })

    return () => {
      if (props.goodsDetail.type !== GOODS_TYPE_ENTITY) {
        return null
      }
      return (
        <div class="goods-detail-other-info">
          <div class="info-item" onClick={onShipClick}>
            <div class="info-item__label">发货</div>
            <div class="info-item__content">
              <span>{shipmentAddress.value}</span>
              <span class="split">&nbsp;丨&nbsp;</span>
              <span>免运费</span>

              {/* {address.value?.cityName ? (
                <>
                  <span>送至&nbsp;</span>
                  <span class="address">{address.value?.cityName} {address.value?.countyName}</span>
                  <span>&nbsp;免运费</span>
                </>
              ) : (
                <span class="color-disabled">选择地址后查看运费</span>
              )} */}
            </div>
            <div class="info-item__suffix">
              <Icon name="right" />
            </div>
          </div>

          <div class="info-item" onClick={onPropertyClick}>
            <div class="info-item__label">参数</div>
            {propertiesRef.value.length === 0 ? (
              <>
                <div class="info-item__content properties empty">以商品详情信息为准</div>
              </>
            ) : (
              <>
                <div class="info-item__content properties">
                  {propertiesRef.value.map((item, index) => {
                    return (
                      <>
                        {index !== 0 && <span class="split">／</span>}
                        {item.name}
                      </>
                    )
                  })}
                </div>
                <div class="info-item__suffix">
                  <Icon name="right" />
                </div>
              </>
            )}
          </div>
        </div>
      )
    }
  }
})
