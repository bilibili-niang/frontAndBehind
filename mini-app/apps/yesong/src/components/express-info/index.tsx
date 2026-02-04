import { computed, defineComponent, PropType } from 'vue'
import { WxAddress } from '../../types'
import { useExpress, useExpressModal } from '../../hooks'
import { useCopyText, useToast } from '@pkg/core'
import { EXPRESS_STATUS_OPTIONS } from '../../constants'
import { Icon } from '@pkg/ui'
import './style.scss'
import { onMounted } from 'vue'

export default defineComponent({
  name: 'ExpressInfo',
  props: {
    expressName: {
      type: String,
      default: '物流承运方'
    },
    expressNo: {
      type: String,
      required: true
    },
    address: {
      type: Object as PropType<WxAddress>
    }
  },
  setup(props) {
    const { expressRef, refresh, isLoading, errMsg } = useExpress({
      courierNo: props.expressNo,
      phone: props.address?.telNumber as string,
      lazyLoad: true
    })

    onMounted(() => {
      refresh()
    })

    const onExpressClick = () => {
      if (!expressRef.value) {
        useToast('未查询到物流信息')
        return void 0
      }
      useExpressModal({
        courierNo: expressRef.value!.number,
        phone: props.address?.telNumber as string
      })
    }

    const ContactInfo = computed(() => {
      if (!props.address) return null
      const { provinceName, cityName, countyName, detailInfo, userName, telNumber } = props.address
      return (
        <div class="c_goods-express__contact">
          <div class="dot"></div>
          <div class="address">
            送至&nbsp;
            {provinceName}
            {cityName}
            {countyName}
            {detailInfo}
          </div>
          <div class="user">
            {userName} {telNumber}
          </div>
        </div>
      )
    })

    return () => {
      if (!props.expressNo)
        return (
          <div>
            <div class="c_goods-express__progress">
              <div class="dot"></div>
              <div class="dash-line"></div>
              <div class="status">未发货</div>
              <div class="desc">将在物流发货后更新物流信息。</div>
            </div>
            {ContactInfo.value}
          </div>
        )
      return (
        <div>
          <div class="c_goods-express__info">
            {expressRef.value?.expressCompanyLogo ? (
              <div
                class="logo"
                style={{
                  backgroundImage: `url(${expressRef.value?.expressCompanyLogo})`
                }}
              ></div>
            ) : (
              <div class="logo-placeholder"></div>
            )}

            <div class="name">{expressRef.value?.expressCompanyName ?? props.expressName}</div>
            <div>{expressRef.value?.number ?? props.expressNo}</div>
            <div
              class="copy"
              onClick={() => {
                useCopyText(expressRef.value?.number ?? props.expressNo)
              }}
            >
              复制
            </div>
          </div>
          <div class="c_goods-express__progress" onClick={onExpressClick}>
            <div class="dot"></div>
            <div class="dash-line"></div>
            {expressRef.value ? (
              <>
                <div class="status">
                  {EXPRESS_STATUS_OPTIONS.find(item => item.value == (expressRef.value?.logisticsStatus as any))?.label}
                  <div class="date">
                    {expressRef.value?.theLastTime?.replace(
                      /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/,
                      '$2-$3 $4:$5'
                    )}
                  </div>
                  <div class="more">
                    详细信息
                    <Icon name="right" />
                  </div>
                </div>
                <div class="desc">{expressRef.value?.theLastMessage}</div>
              </>
            ) : (
              <>
                <div class="status">
                  {isLoading.value ? '正在更新' : '暂无物流信息'}
                  <div class="date"></div>
                  <div class="more">
                    详细信息
                    <Icon name="right" />
                  </div>
                </div>
                <div class="desc">
                  {isLoading.value ? '物流信息加载中...' : errMsg.value || '物流信息获取失败！请稍后再试'}
                </div>
              </>
            )}
          </div>
          {ContactInfo.value}
        </div>
      )
    }
  }
})
