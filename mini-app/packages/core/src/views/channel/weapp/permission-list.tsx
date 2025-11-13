import { defineComponent } from 'vue'

export default defineComponent({
  name: 'WeappPermissionList',
  setup() {
    const permissions = [
      '获取小程序码',
      '小程序开发与数据分析',
      '小程序客服管理',
      '开放平台账号管理',
      '小程序基本信息管理',
      '小程序认证名称检测',
      '附近的小程序管理',
      '小程序插件管理',
      '微信物流服务',
      '小程序云开发管理',
      '小程序直播管理',
      '小程序广告管理',
      '微信服务平台管理',
      '标准版交易组件商品管理',
      '标准版交易组件订单物流与售后管理',
      '标准版交易组件接入',
      '小程序违规与交易投诉管理',
      '小程序安全风控管理',
      '试用小程序快速认证',
      '标准版交易组件优惠券管理',
      '自定义版交易组件管理',
      '小程序链接管理',
      '小程序联盟推客管理',
      '小程序支付管理服务',
      '小程序购物订单',
      '视频号小店商品管理',
      '视频号小店物流管理',
      '视频号小店订单与售后管理',
      '视频号小店优惠券管理',
      '视频号商品橱窗管理',
      '视频号小店资金管理',
      '小程序推广员',
      '小程序交易保障',
      '小程序备案服务'
    ]
    return () => {
      return (
        <div class="weapp-detail-block">
          <h2 style="margin-top: 24px;">已授权权限</h2>
          <div class="weapp-permissions">
            {permissions.map((item) => {
              return (
                <div class="weapp-permission-item">
                  <iconpark-icon name="ok"></iconpark-icon>
                  {item}
                </div>
              )
            })}
            <div class="weapp-permission-item --placeholder"></div>
            <div class="weapp-permission-item --placeholder"></div>
            <div class="weapp-permission-item --placeholder"></div>
            <div class="weapp-permission-item --placeholder"></div>
            <div class="weapp-permission-item --placeholder"></div>
          </div>
        </div>
      )
    }
  }
})
