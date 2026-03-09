import { computed, defineComponent, onBeforeUnmount, ref } from 'vue'
import './style.scss'
import { formatPrice } from '@pkg/utils'
import { Image } from '@tarojs/components'
import { useGoodsDetailStore } from '../store'
import { Icon } from '@pkg/ui'
import { storeToRefs } from 'pinia'
import { GOODS_ON_SALE_MODE_TIMING } from '../../../../constants'
import { useAppStore, useCountdown, useModal, usePopup, useToast, withLogin } from '@pkg/core'
import dayjs from 'dayjs'
import { useGoodsStore, utmStore } from '../../../../stores'
import { useShareMenu } from '../../../../components/share'
import '@nutui/nutui-taro/dist/packages/swipe/index.css'
import Taro from '@tarojs/taro'
import SwiperForPoster from '../../../../components/swiper-for-poster/index'
import { $getWxacodeUnlimit } from '@pkg/core/src/api'
import { base64src } from '../../../posterMaking/create/PosterBuilder/utils/tools'
import PosterBuilder from '../../../posterMaking/create/PosterBuilder/index.vue'

const SaleTime = defineComponent({
  setup() {
    const appStore = useAppStore()

    const goodsDetailStore = useGoodsDetailStore()
    const { goodsDetail } = storeToRefs(goodsDetailStore)

    /** 限制销售时间 */
    const isTimeLimit = computed(() => {
      return goodsDetail.value?.onsaleMode === GOODS_ON_SALE_MODE_TIMING
    })

    const timeLimitType = computed(() => {
      const now = appStore.lazyNow
      const start = dayjs(goodsDetail.value!.onsaleStartAt)
      const end = dayjs(goodsDetail.value!.onsaleEndAt)
      if (now.isBefore(start)) {
        return 0
      }
      if (now.isAfter(start) && now.isBefore(end)) {
        return 1
      }
      return 2
    })

    const refTime = computed(() => {
      return timeLimitType.value === 0
        ? goodsDetail.value!.onsaleStartAt
        : timeLimitType.value === 1
        ? goodsDetail.value!.onsaleEndAt
        : goodsDetail.value!.onsaleEndAt
    })

    const { countdownTime, stopCountdown, onCountdownEnd, countdownSeconds } = useCountdown(refTime, {
      format: 'DD HH mm ss'
    })

    onBeforeUnmount(() => {
      stopCountdown()
    })

    onCountdownEnd(() => {
      // 开售、售卖状态结束时才刷新数据
      if (timeLimitType.value === 0 || timeLimitType.value === 1) {
        appStore.resetLazyNow()
        goodsDetailStore.silentRefresh()
      }
    })

    return () => {
      if (!goodsDetail.value) return null
      if (!isTimeLimit.value) return null
      return (
        <div class="goods-detail-sale-time">
          <Image
            class="main-icon a"
            src="https://dev-cdn.ice.cn/upload/20240425/4bbe548ebfbd6528eb8ed3eee2c18c99.png"
          />
          <div class="status">
            <div class="text">
              {timeLimitType.value === 0 ? '距离开售' : timeLimitType.value === 1 ? '距离结束' : '抢购已结束'}
            </div>
            <div class="count-down">
              {countdownTime.value.split(' ').map((item, index) => {
                if (index === 0) {
                  // 天数大于0才显示
                  return Number(item) > 0 ? <>{parseInt(item)}天&nbsp;</> : null
                }
                return (
                  <>
                    {index > 1 && <div class="count-down-split">:</div>}
                    <div class="count-down-item">{item}</div>
                  </>
                )
              })}
            </div>
          </div>
        </div>
      )
    }
  }
})

export default defineComponent({
  setup(props, { slots }) {
    const goodsStore = useGoodsStore()
    const goodsDetailStore = useGoodsDetailStore()
    const { goodsDetail, isOffSale } = storeToRefs(goodsDetailStore)
    const currentIndex = ref(0)

    const priceSortedSkus = computed(() => {
      return goodsDetail.value!.goodsSkus.slice(0).sort((a, b) => a.price - b.price)
    })

    // 海报的列表
    const list = computed(() => {
      const { posters } = goodsDetail.value
      const tempTarget = Object.keys(posters).map(it => {
        return posters[it]
      })
      return tempTarget.filter(it => it?.url)
    })
    const PosterRef = ref({
      init: () => 0
    })
    // 是否允许生成canvas
    const allowCanvas = ref(false)
    // canvas的配置
    const posterConfig = () => {
      const nowData = list.value[currentIndex.value]
      return {
        width: 750,
        height: 1334,
        backgroundColor: '#ffffff',
        debug: false,
        images: [
          {
            x: 0,
            y: 0,
            width: 750,
            height: 1334,
            url: nowData.url,
            borderRadiusGroup: [0, 0, 0, 0],
            zIndex: 20
          },
          {
            x: Number(nowData.qrcodeX) * 2,
            y: Number(nowData.qrcodeY) * 2,
            width: nowData.qrcodeSize * 2,
            height: nowData.qrcodeSize * 2,
            url: qrCode.value || 'https://dev-cdn.ice.cn/upload/88f732391832df89cd317167b66efa77.png',
            borderRadiusGroup: [16, 16, 16, 16],
            // 不能太低
            zIndex: 999
          }
        ]
      }
    }

    const showPoster = () => {
      // 创建离屏canvass并获取它的本地图片路径
      const shareImg = () => {
        allowCanvas.value = true
        PosterRef.value?.init()
        Taro.showLoading({
          title: '',
          mask: true
        })
        setTimeout(function () {
          Taro.hideLoading()
        }, 2000)
      }

      if (list.value.length > 0) {
        usePopup({
          placement: 'content',
          backward: false,
          content: () => (
            <div class="share-popup-content">
              <div class="share-title">长按保存到手机相册(点击空白处关闭)</div>
              <div class="swiper-content">
                <SwiperForPoster
                  qrPath={qrCode.value}
                  save={current => {
                    currentIndex.value = current
                    shareImg()
                  }}
                  class="media-content"
                  list={list.value}
                />
              </div>
            </div>
          )
        })
      } else {
        useToast('当前商品没有海报')
      }
    }
    // 请求到的二维码base位图片
    const qrCode = ref('')

    const utmEleStore = utmStore()
    const { getUtmData, env, generateSpecifiedContentShortChain } = utmEleStore

    // 需要去请求一下该商品的小程序二维码
    const init = () => {
      generateSpecifiedContentShortChain(
        getUtmData({
          page: 'packageA/goods/detail',
          goodsId: goodsDetail.value.id + '',
          utmSource: '海报分享',
          utmCampaign: '商品详情页海报'
        })
      ).then(res => {
        $getWxacodeUnlimit({
          page: 'pagesB/goodDetail/GoodDetail',
          scene: `utmCode=${res.data.shortCode}`,
          env
        }).then(re => {
          base64src(`data:image/png;base64,${re.data}`)
            .then(filePath => {
              qrCode.value = filePath + ''
            })
            .catch(e => {
              console.log('获取图片地址失败', e)
            })
        })
      })
    }

    init()
    return () => {
      if (!goodsDetail.value) return null
      return [
        isOffSale.value ? null : <SaleTime />,
        <div class="goods-detail-base-info">
          {allowCanvas.value && (
            <PosterBuilder
              class="test-fixed"
              ref={PosterRef}
              onSuccess={e => {
                Taro.showShareImageMenu({
                  path: e.tempFilePath,
                  complete: () => {
                    allowCanvas.value = false
                  },
                  fail: () => {}
                })
              }}
              onFail={() => {
                useToast('该图片格式不支持分享')
                allowCanvas.value = false
              }}
              config={posterConfig()}
            />
          )}
          <div class="price-info">
            <div class="price-share-poster">
              <div class="current-price number-font">
                <div class="yen">&yen;</div>
                <div class="value">{formatPrice(priceSortedSkus.value[0].price)}</div>
                {priceSortedSkus.value.length > 0 && <div class="minimum">起</div>}
                {/* 价格标签 */}
                {goodsStore.sellingPriceText && <div class="price-tag">{goodsStore.sellingPriceText}</div>}

                {priceSortedSkus.value[0].underlinePrice > priceSortedSkus.value[0].price && (
                  <div class="list-price">
                    <div class="line-through">
                      {goodsStore.dashPriceText} &yen;{priceSortedSkus.value[0].underlinePrice}
                    </div>
                  </div>
                )}
              </div>
              {/*TODO 海报*/}
              {goodsDetail.value.allowShare == 1 && list.value.length > 0 ? (
                // {false ? (
                // 允许分享,后台有配置海报,展示海报分享按钮,不登录我拿什么信息填utm
                <div
                  class="share-poster"
                  onClick={withLogin(() => {
                    // 这里的url有http才会展示
                    if (!(list.value?.[0]?.url + '')?.includes('http')) {
                      return useShareMenu({
                        type: 'room',
                        id: goodsDetail.value.id,
                        handler: null
                      })
                    } else {
                      return useShareMenu({
                        type: 'room',
                        id: goodsDetail.value.id,
                        handler: showPoster
                      })
                    }
                  })}
                >
                  <Icon name="share" class="share-icon"></Icon>
                </div>
              ) : (
                <div></div>
              )}

              {/*TODO 海报*/}
              {goodsDetail.value.allowShare == 1 && list.value.length === 0 && (
                // {false && (
                // 允许分享,但是后台没有配置海报 handler 传入null,不显示海报分享按钮
                <div
                  class="share-poster"
                  onClick={withLogin(() => {
                    useShareMenu({
                      type: 'room',
                      id: goodsDetail.value.id,
                      handler: null
                    })
                  })}
                >
                  <Icon name="share" class="share-icon"></Icon>
                </div>
              )}
            </div>
          </div>
          <div class="spliter"></div>
          {slots?.promotion?.()}
          <div class="goods-name">{goodsDetail.value.title}</div>
          <div class="sales-count">已售 {goodsDetail.value.soldNum} 件</div>
        </div>
      ]
    }
  }
})

// 优惠券模块
const CouponModule = defineComponent({
  name: 'CouponModule',
  setup() {
    const showCouponPopup = () => {
      const { close } = useModal({
        content: () => (
          <div class="coupon-popup">
            <div class="coupon-popup-header">
              <div class="popup-title">优惠明细</div>
              <div class="close-btn" onClick={() => close()}>
                <Icon name="close" />
              </div>
            </div>
            <div class="coupon-popup-content">
              <div class="price-detail">
                <div class="estimated-purchase-price">
                  <div class="total-price">¥428</div>
                  <div class="price-tips">预估到手价</div>
                </div>

                <div class="price-calc">
                  <div class="calc-title">新人福利券满50元可用</div>
                  <div class="calc-row">
                    <div class="price-content">
                      <div class="price-row">
                        <div class="price">
                          <div class="price-text">¥520</div>
                          <div class="price-label">商品售价</div>
                        </div>
                        <div class="minus">-</div>
                        <div class="discount">
                          <div class="discount-text">¥318</div>

                          <div class="tag-list">
                            <div class="tag">满减优惠</div>
                            <div class="tag">限时优惠</div>
                            <div class="tag">满499减40</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="activity-title">优惠活动</div>
              <div class="coupon-popup-item">
                <div class="coupon-left">
                  <div class="coupon-price">
                    ¥<div class="big">40</div>
                  </div>
                  <div class="coupon-desc">商品满减券</div>
                </div>
                <div class="coupon-right">
                  <div class="coupon-name">新人福利券(限领1张)</div>
                  <div class="coupon-condition">指定商品可用</div>
                  <div class="coupon-time">有效期2023.01.01 - 12.31</div>
                  <div class="coupon-btn">去领取</div>
                </div>
              </div>
              <div class="coupon-popup-item">
                <div class="coupon-left">
                  <div class="coupon-price">
                    ¥<div class="big">25</div>
                  </div>
                  <div class="coupon-desc">店铺满减券</div>
                </div>
                <div class="coupon-right">
                  <div class="coupon-name">消费满200元可用</div>
                  <div class="coupon-condition">全店商品可用</div>
                  <div class="coupon-time">有效期2023.01.01 - 12.31</div>
                  <div class="coupon-btn">去领取</div>
                </div>
              </div>
              <div class="coupon-popup-item">
                <div class="coupon-left">
                  <div class="coupon-price">
                    ¥<div class="big">8</div>
                  </div>
                  <div class="coupon-desc">商品满减券</div>
                </div>
                <div class="coupon-right">
                  <div class="coupon-name">新人福利券无门槛使用</div>
                  <div class="coupon-condition">限领取2张</div>
                  <div class="coupon-time">有效期2023.01.01 - 12.31</div>
                  <div class="coupon-btn disabled">已领取</div>
                </div>
              </div>
            </div>
          </div>
        )
      })
    }

    return () => {
      return (
        <div class="coupon-module">
          <div class="coupons-container">
            <div class="coupon-item">满200减20</div>
            <div class="coupon-item">满500减40</div>
            <div class="coupon-item">满100加200</div>
          </div>
          <div class="get-coupon" onClick={showCouponPopup}>
            领券
            <Icon name="right" />
          </div>
        </div>
      )
    }
  }
})
