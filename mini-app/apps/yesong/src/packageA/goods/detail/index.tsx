import { computed, defineComponent, onBeforeUnmount, onMounted, PropType, ref, watch } from 'vue'
import { BasePage, useAppStore, useShareAppMessage } from '@anteng/core'
import Taro, { usePageScroll, useRouter } from '@tarojs/taro'
import './style.scss'
import ActionBar from './action-bar'
import DetailImagesSwiper from '../../../components/detail-images-swiper'
import BaseInfo from './base-info'
import Skeleton from './skeleton'
import Empty from './empty'
import SpecInfo from './spec-info'
import OtherInfo from './other-info'
import MustKnow from './must-know'
import DetailInfo from './detail-info'
import { IGoodsDetail } from '../../../api/goods/types'
import { findLastIndex } from 'lodash-es'
import { useGoodsDetailStore, useGoodsDetailStoreDispose } from './store'
import { storeToRefs } from 'pinia'
import { GOODS_SHARE_ENABLE_OFF } from '../../../constants'
import SuitableShops from './suitable-shops'
import Recommended from '../../../components/recommended'
import Promotion from './promotion'

const recommendRule = ref(Taro.getStorageSync('recommendRule'))

export default defineComponent({
  name: 'GoodDetailPage',
  setup() {
    const appStore = useAppStore()
    const commonNavigatorHeight = appStore.commonNavigatorHeight

    // 路由可能缺失 gid（本地预览或直接进入），兜底一个本地商品ID，避免页面判空
    const goodsId = useRouter().params.gid || 'demo-goods-001'

    const goodsDetailStore = useGoodsDetailStore(goodsId)
    goodsDetailStore.getGoodsDetail()
    const { goodsDetail: detailRef, isLoading, errorMsg } = storeToRefs(goodsDetailStore)

    onBeforeUnmount(() => {
      useGoodsDetailStoreDispose(goodsDetailStore)
    })

    // 设置分享信息
    useShareAppMessage(() => {
      return {
        title: detailRef.value?.shareTitle ?? detailRef.value?.title,
        imageUrl: detailRef.value?.shareImage ?? detailRef.value?.coverImages?.[0]
      }
    })

    /** 是否允许分享 */
    const enableShare = computed(() => {
      return !(detailRef.value?.allowShare === GOODS_SHARE_ENABLE_OFF)
    })

    const PageContent = () => {
      if (isLoading.value) return <Skeleton />
      if (!detailRef.value) return <Empty description={errorMsg.value} />
      return <GoodDetailPage detail={detailRef.value} />
    }

    /* ---------------------------------- 电梯导航 ---------------------------------- */
    const pageTabs = computed(() => {
      if (recommendRule.value.commodityDetail === 0) {
        return [
          { title: '商品', value: 'tab-goods', visible: true },
          { title: '须知', value: 'tab-must-know', visible: !!detailRef.value?.mustKnow },
          { title: '详情', value: 'tab-details', visible: true }
        ].filter(item => item.visible)
      }
      return [
        { title: '商品', value: 'tab-goods', visible: true },
        { title: '须知', value: 'tab-must-know', visible: !!detailRef.value?.mustKnow },
        { title: '详情', value: 'tab-details', visible: true },
        { title: '推荐', value: 'recommend', visible: true }
      ].filter(item => item.visible)
    })

    const currentTabIndex = ref(0)
    const anchorQuery = Taro.createSelectorQuery()
    anchorQuery.selectAll('.anchor-item').boundingClientRect()
    anchorQuery.select('.anchor-content').boundingClientRect()
    anchorQuery.selectViewport().scrollOffset()
    const anchorBarStyle = ref('')
    const calcAnchorBarStyle = () => {
      anchorQuery.exec(res => {
        anchorBarStyle.value = `
            left: ${res[0][currentTabIndex.value]?.left - res[1]?.left}px;
            width:${res[0][currentTabIndex.value]?.width}px;
          `
      })
    }
    onMounted(() => calcAnchorBarStyle())
    watch(
      () => [currentTabIndex.value, pageTabs.value],
      () => {
        calcAnchorBarStyle()
      }
    )

    const tabQuery = Taro.createSelectorQuery()
    tabQuery.selectAll('.goods-detail__tab').boundingClientRect()
    tabQuery.selectViewport().scrollOffset()
    const ignoreScrollAnchor = ref(false)
    const onAnchorClick = (index: number) => {
      ignoreScrollAnchor.value = true
      setTimeout(() => {
        ignoreScrollAnchor.value = false
      }, 600)
      currentTabIndex.value = index
      tabQuery.exec(res => {
        Taro.pageScrollTo({
          scrollTop: res[0][currentTabIndex.value].top + res[1].scrollTop - commonNavigatorHeight - 10
        })
      })
    }
    const calcTabIndex = () => {
      if (ignoreScrollAnchor.value) return void 0
      tabQuery.exec(res => {
        let index = findLastIndex(res[0], (item: any) => item?.top - commonNavigatorHeight <= 10)
        index = index > 0 ? index : 0
        currentTabIndex.value = index
      })
    }
    usePageScroll(() => {
      calcTabIndex()
    })

    /* -------------------------------- 电梯导航 End -------------------------------- */

    return () => {
      return (
        <BasePage
          enableGlobalShare={false}
          enableShareAppMessage={enableShare.value}
          class="goods-detail-page"
          tabsPlaceholder
          // statusbarPlaceholder
          navigator={{
            title: isLoading.value ? '' : detailRef.value ? detailRef.value.title : '页面已失效',
            fixedTitle: (
              <div class="goods-detail__anchor">
                <div class="anchor-content">
                  {pageTabs.value.map((item, index) => {
                    return (
                      <div
                        class={['anchor-item', index === currentTabIndex.value && 'active']}
                        onClick={() => {
                          onAnchorClick(index)
                        }}
                      >
                        {item.title}
                      </div>
                    )
                  })}
                  <div class="anchor-bar" style={anchorBarStyle.value}></div>
                </div>
              </div>
            )
          }}
        >
          <PageContent />
        </BasePage>
      )
    }
  }
})

const GoodDetailPage = defineComponent({
  props: {
    detail: {
      type: Object as PropType<IGoodsDetail>,
      required: true
    }
  },
  setup(props) {
    const detailRef = computed(() => props.detail)

    const promotionPagination = useGoodsDetailStore().getPromotionPagination()

    return () => {
      return (
        <>
          <div class="goods-detail-page__content">
            <DetailImagesSwiper class="goods-detail__tab" images={detailRef.value.coverImages} />
            <BaseInfo>
              {{ promotion: () => <Promotion pagination={promotionPagination} goodsId={detailRef.value?.id} /> }}
            </BaseInfo>
            <SpecInfo goodsDetail={detailRef.value} />
            <OtherInfo goodsDetail={detailRef.value} />
            <SuitableShops />
            <MustKnow class="goods-detail__tab" goodsDetail={detailRef.value} />
            <DetailInfo class="goods-detail__tab" goodsDetail={detailRef.value} />
            <Recommended
              class={[recommendRule.value.commodityDetail !== 0 && 'recommend goods-detail__tab']}
              type={recommendRule.value.commodityDetail}
              categoryId={detailRef.value.categoryIds}
            />
          </div>
          <ActionBar goodsDetail={detailRef.value} />
        </>
      )
    }
  }
})
