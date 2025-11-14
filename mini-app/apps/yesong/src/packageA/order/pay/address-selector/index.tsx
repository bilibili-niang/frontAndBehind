import { Icon } from '@anteng/ui'
import { defineComponent, PropType, toRaw, computed } from 'vue'
import './style.scss'
import Taro from '@tarojs/taro'
import { useToast } from '@anteng/core'
import { WxAddress } from '../../../../types'
import { emptyAddress } from '../../../../hooks/useAddress'

export default defineComponent({
  name: 'c_address-selector',
  props: {
    address: {
      type: Object as PropType<WxAddress>
    },
    readonly: {
      type: Boolean,
      default: false
    }
  },
  emits: {
    change: (address: WxAddress) => true
  },
  setup(props, { emit, expose }) {
    const onChooseAddress = () => {
      if (props.readonly) return void 0
      Taro.chooseAddress({
        success: res => {
          Object.assign(data, res)
          emit('change', toRaw(data))
        },
        fail: () => {
          // TODO 支持 H5 设置收货地址，微信 H5 可以使用 wx.openAddress 能力
          if (process.env.TARO_ENV === 'h5') {
            useToast('h5暂未支持地址选择3')
          }
        }
      })
    }

    expose({
      chooseAddress: onChooseAddress
    })
    // props.address 可能会改变的
    const data = computed(() => {
      return Object.assign(emptyAddress(), { ...props.address, isEmpty: !props.address?.userName })
    })

    return () => {
      return (
        // <div class="c_address-selector" onClick={onChooseAddress}>
        <div class="c_address-selector">
          <Icon name="location" />
          {!props.readonly && (
            <div class="c_address-selector__btn">
              <Icon name="edit" />
              编辑
            </div>
          )}
          <div class="c_address-selector__content">
            {data.value?.userName ? (
              <>
                <div class="contact">
                  <div class="contact-name">{data.value?.userName}</div>
                  <div class="contact-phone number-font">{data.value?.telNumber}</div>
                </div>
                <div class="contact-address">
                  {data.value?.provinceName}&nbsp;
                  {data.value?.cityName}&nbsp;
                  {data.value?.countyName}&nbsp;
                  {data.value?.detailInfo}
                </div>
              </>
            ) : (
              <>
                <div class="contact">
                  <div class="contact-name">未选择收货地址</div>
                </div>
                <div class="contact-address">请添加收货人信息及地址</div>
              </>
            )}
          </div>
        </div>
      )
    }
  }
})
