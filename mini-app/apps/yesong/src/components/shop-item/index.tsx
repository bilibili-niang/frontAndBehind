import { computed, defineComponent, withModifiers } from 'vue'
import './style.scss'
import { Icon } from '@pkg/ui'
import Taro from '@tarojs/taro'
import { useOpenLocation, useToast } from '@pkg/core'

export interface IShopItemOptions {
  id: string
  /** 门店名称 */
  name: string
  /** 门店开始营业时间 */
  openAt: string
  /** 门店结束营业时间 */
  closeAt: string
  /** 门店logo/图片 */
  image?: string
  /** 门店地址 */
  address: string
  /** 经度 */
  longitude: number | string
  /** 纬度 */
  latitude: number | string
  distance?: number | string
  /** 联系电话 */
  tell: string
}

export default defineComponent({
  name: 'ShopItem',
  props: {
    name: {
      type: String,
      required: true
    },
    openAt: {
      type: String,
      required: true
    },
    closeAt: {
      type: String,
      required: true
    },
    image: {
      type: String
    },
    address: {
      type: String,
      required: true
    },
    longitude: {
      type: [Number, String]
    },
    latitude: {
      type: [Number, String]
    },
    distance: {
      type: [Number, String]
    },
    tell: {
      type: String
    }
  },
  setup(props) {
    const distance = computed(() => {
      const dis = props.distance
      return typeof dis === 'number'
        ? dis < 1
          ? `${Math.round(dis * 1000)}m`
          : `${Math.round(dis * 100) / 100}km`
        : dis
    })

    const onLocationClick = () => {
      useOpenLocation({
        name: props.name,
        address: props.address,
        longitude: props.longitude,
        latitude: props.latitude
      })
    }
    const onTellClick = () => {
      if (!props.tell) {
        useToast('无门店联系电话')
        return void 0
      }
      Taro.makePhoneCall({
        phoneNumber: props.tell!
      })
    }

    return () => {
      return (
        <div class="c_shop-item">
          <div class="c_shop-item__content">
            <div class="c_shop-item__avatar">
              <Icon name="shop" />
            </div>
            <div class="c_shop-item__base">
              <div class="c_shop-item__name max-2-line">{props.name}</div>
              {props.openAt && props.closeAt ? (
                <div class="c_shop-item__time">
                  {props.openAt} ～ {props.closeAt}
                </div>
              ) : (
                <div class="c_shop-item__time">营业时间未定</div>
              )}
            </div>
            <div class="c_shop-item__actions">
              <div class="c_shop-item__action" onClick={withModifiers(onLocationClick, ['stop'])}>
                <Icon name="navigate-fill" />
                <div>导航</div>
              </div>
              <div class="c_shop-item__action" onClick={withModifiers(onTellClick, ['stop'])}>
                <Icon name="tell-fill" />
                <div>联系</div>
              </div>
            </div>
          </div>
          <div class="c_shop-item__address">
            <Icon name="location" />
            {parseFloat(distance.value!) > 0 && (
              <>
                <div class="c_shop-item__distance">距离 {distance.value}</div>
                <span style="opacity:0.4;">&nbsp;丨&nbsp;</span>
              </>
            )}

            <div class="max-1-line">{props.address}</div>
          </div>
        </div>
      )
    }
  }
})
