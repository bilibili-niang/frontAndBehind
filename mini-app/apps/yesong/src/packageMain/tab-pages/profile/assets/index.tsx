import { defineComponent } from 'vue'
import './style.scss'

export default defineComponent({
  name: 'ProfilePageAssets',
  setup() {
    return () => {
      return (
        <div class="profile-assets">
          <div class="assets-item">
            <div class="assets-content">—</div>
            <div class="assets-name">余额</div>
          </div>
          <div class="assets-item">
            <div class="assets-content">—</div>
            <div class="assets-name">积分</div>
          </div>
          <div class="assets-item">
            <div class="assets-content">—</div>
            <div class="assets-name">优惠券</div>
          </div>
          <div class="assets-item">
            <div class="assets-content">—</div>
            <div class="assets-name">礼品卡</div>
          </div>
        </div>
      )
    }
  }
})
