import { Icon, Tooltip, message } from '@anteng/ui'
import { defineComponent } from 'vue'
import { CUSTOMER_TYPE_OPTIONS, PRINCIPAL_TYPE_OPTIONS } from './constant'
import { WECHATPAY_APPLY_STAUS_COMPLETED } from '../../../../../../apps/cs/center/src/views/finance/wechat-pay-apply/constants'
import { useWechatPayApply } from '../../../../../../apps/cs/center/src/views/finance/wechat-pay-apply'

// TODO 提取成公共函数
const copy = (content: string) => {
  const input = document.createElement('input')
  input.value = content
  document.body.appendChild(input)
  input.select()
  document.execCommand('Copy')
  document.body.removeChild(input)
  message.success('复制成功')
}

export default defineComponent({
  name: 'WeappBasicInfo',
  props: {
    basicInfo: {
      type: Object
    },
    account: {
      type: Object
    },
    needWechatPay: {
      type: Boolean,
      default: false
    }
  },
  emits: {
    nonsupport: () => true
  },
  setup(props, { emit }) {
    const nonsupport = () => emit('nonsupport')
    return () => {
      const weapp = props.basicInfo
      if (!weapp) {
        return null
      }
      return (
        <div class="weapp-detail-block">
          <div class="weapp-detail-block__header">
            <h2>基本信息</h2>
            <span class="weapp-detail-block__header-action clickable">
              <iconpark-icon name="undo"></iconpark-icon>刷新
            </span>
          </div>
          <div class="weapp-basic-info">
            <div class="weapp-basic-info__row">
              <div class="weapp-basic-info__label">AppID</div>
              <div class="weapp-basic-info__value">
                {weapp.appid}&emsp;<a onClick={() => copy(weapp.appid)}>复制</a>
              </div>
              <div class="weapp-basic-info__desc">小程序ID，不可修改</div>
            </div>
            <div class="weapp-basic-info__row">
              <div class="weapp-basic-info__label">小程序名称</div>
              <div class="weapp-basic-info__value">{weapp.nicknameInfo?.nickname}</div>
              <div class="weapp-basic-info__desc">
                小程序发布前，可修改2次名称
                <br />
                由于审核要求，请谨慎填写名称，小程序发布成功后不能修改名称
              </div>
              <div class="weapp-basic-info__action">
                <a onClick={nonsupport}>修改</a>
              </div>
            </div>

            <div class="weapp-basic-info__row">
              <div class="weapp-basic-info__label">小程序头像</div>
              <div class="weapp-basic-info__value">
                <div
                  class="weapp-basic-info__avatar"
                  style={`background-image: url(${weapp.headImageInfo?.headImageUrl})`}
                />
              </div>
              <div class="weapp-basic-info__desc">
                一个月内可申请修改 {weapp.headImageInfo?.modifyQuota} 次已修改 {weapp.headImageInfo?.modifyUsedCount} 次
              </div>
              <div class="weapp-basic-info__action">
                <a onClick={nonsupport}>修改</a>
              </div>
            </div>

            <div class="weapp-basic-info__row">
              <div class="weapp-basic-info__label">小程序简介</div>
              <div class="weapp-basic-info__value">{weapp.signatureInfo?.signature}</div>
              <div class="weapp-basic-info__desc">
                一个月内可申请修改 {weapp.signatureInfo?.modifyQuota} 次已修改 {weapp.signatureInfo?.modifyUsedCount} 次
              </div>
              <div class="weapp-basic-info__action">
                <a onClick={nonsupport}>修改</a>
              </div>
            </div>

            <div class="weapp-basic-info__row">
              <div class="weapp-basic-info__label">
                服务类目
                <Tooltip title="请从您已设置的类目中选出小程序提交审核时需要的类目，最多可选择5个类目。微信审核时若您的小程序内容涉及未选中的类目，则小程序可能审核失败。">
                  <iconpark-icon name="helper"></iconpark-icon>
                </Tooltip>
              </div>
              <div class="weapp-basic-info__value color-disabled">-</div>
              <div class="weapp-basic-info__desc">
                已添加 0 个类目，最多可添加5个类目
                <br />
                一个月内可申请修改 5 次，已修改 0 次
              </div>
              <div class="weapp-basic-info__action">
                <a onClick={nonsupport}>修改</a>
              </div>
            </div>

            <div class="weapp-basic-info__row">
              <div class="weapp-basic-info__label">主体信息</div>
              <div class="weapp-basic-info__value">{weapp.principalName}</div>
              <div class="weapp-basic-info__desc">
                {PRINCIPAL_TYPE_OPTIONS.find((item) => item.value === weapp.principalType)?.label}
              </div>
              <div class="weapp-basic-info__action">
                <a onClick={nonsupport}>详情</a>
              </div>
            </div>

            <div class="weapp-basic-info__row">
              <div class="weapp-basic-info__label">微信认证</div>
              <div class="weapp-basic-info__value">
                {weapp.customer_type === 0 ? (
                  <span class="color-disabled"> 未认证</span>
                ) : (
                  <span class="color-success flex-center" style="justify-content:flex-start;">
                    <iconpark-icon name="ok"></iconpark-icon>&ensp;已认证
                  </span>
                )}
              </div>
              <div class="weapp-basic-info__desc">
                {CUSTOMER_TYPE_OPTIONS.find((item) => item.value === weapp.customerType)?.label}
              </div>
              <div class="weapp-basic-info__action">
                <a onClick={nonsupport}>详情</a>
              </div>
            </div>

            {props.needWechatPay && props.account?.wechatPayApplyment?.status === WECHATPAY_APPLY_STAUS_COMPLETED && (
              <div class="weapp-basic-info__row">
                <div class="weapp-basic-info__label">微信支付能力</div>
                <div class="weapp-basic-info__value">
                  <span class="color-success flex-center" style="justify-content:flex-start;">
                    <iconpark-icon name="ok"></iconpark-icon>&ensp;已开通
                  </span>
                </div>

                <div class="weapp-basic-info__desc">已开通微信支付能力</div>
                <div class="weapp-basic-info__action">
                  <a
                    onClick={() => {
                      const { getData, onRead } = useWechatPayApply(props.account?.wechatPayApplyment?.id, weapp.appid)
                      const close = message.loading('加载中，请稍候...')
                      getData()
                        ?.then(() => {
                          onRead()
                        })
                        .finally(() => {
                          close()
                        })
                    }}
                  >
                    详情
                  </a>
                </div>
              </div>
            )}

            <div class="weapp-basic-info__row">
              <div class="weapp-basic-info__label">
                小程序备案
                <Tooltip title="根据2023年8月4日工信部发布的《工业和信息化部关于开展移动互联网应用程序备案 工作的通知》，小程序开发者应通过其分发平台履行备案手续。">
                  <iconpark-icon name="helper"></iconpark-icon>
                </Tooltip>
              </div>
              <div class="weapp-basic-info__value color-disabled">未备案</div>
              <div class="weapp-basic-info__desc">
                自2023年9月1日起，无发布记录的小程序，需完成备案才可发布
                <br />
                为保障您的经营顺利开展，请尽快完成备案
              </div>
              <div class="weapp-basic-info__action">
                <a href="https://developers.weixin.qq.com/miniprogram/product/record_guidelines.html" target="_blank">
                  查看备案指引
                </a>
                <a href="https://mp.weixin.qq.com/" target="_blank">
                  前往备案
                </a>
              </div>
            </div>
          </div>
        </div>
      )
    }
  }
})
