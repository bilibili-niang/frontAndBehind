import { defineComponent } from 'vue'
import './style.scss'
import { useAppStore } from '@pkg/core'
import { Icon } from '@pkg/ui'

export default defineComponent({
  name: 'GoodsDetailSkleton',
  setup() {
    const appStore = useAppStore()
    return () => {
      return (
        <div class="goods-detail-skeleton">
          <div class="skeleton-good-detail">
            <div style={{ height: `${appStore.commonNavigatorHeight}px` }}></div>
            <div class="img"></div>
            <div class="main">
              <div class="block block1"></div>
              <div class="block block2 skeleton"></div>
              <div class="block block3 skeleton"></div>
              <div class="block block4 skeleton"></div>
              <div class="block block5 skeleton"></div>
              <div class="block block6 skeleton"></div>
              <div class="block block7 skeleton"></div>
              <div class="block block8 skeleton"></div>
              <div class="block block9 skeleton"></div>
            </div>
            <div class="goods-detail-action-bar">
              <div class="content">
                <div class="minor-action">
                  <Icon name="home" />
                  <div>首页</div>
                </div>
                {process.env.TARO_ENV !== 'h5' && (
                  <div class="minor-action">
                    <Icon name="profile" />
                    <div>客服</div>
                  </div>
                )}
                <div class="minor-action">
                  <Icon name="cart" />
                  <div>购物车</div>
                </div>
                <div class="main-action"></div>
                <div class="main-action primary"></div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  }
})
