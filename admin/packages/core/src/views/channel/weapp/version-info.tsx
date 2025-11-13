import {
  auditWeapp,
  getTrialWeappQRCode,
  getWeappVersionInfo,
  releaseWeapp,
  upgradeTrailWeapp
} from '../../../api/weapp'
import { Modal, message } from '@anteng/ui'
import { computed, defineComponent, onMounted, ref } from 'vue'
import { WEAPP_VERSION_STATUS_ACCESS, WEAPP_VERSION_STATUS_AUDITING } from './constant'
import uuid from '../../../utils/uuid'
import { useRequestErrorMessage } from '../../../hooks/useRequestErrorMessage'
import Spin from '../../../components/spin'
import { WECHATPAY_APPLY_STAUS_COMPLETED } from '../../../../../../apps/cs/center/src/views/finance/wechat-pay-apply/constants'

/** 版本号比较, 大于 1，小于 -1，等于 0 */
function compareVersion(v1: string, v2: string) {
  const arr1 = v1.split('.')
  const arr2 = v2.split('.')
  const len = Math.max(arr1.length, arr2.length)

  for (let i = 0; i < len; i++) {
    const num1 = parseInt(arr1[i]) || 0
    const num2 = parseInt(arr2[i]) || 0

    if (num1 > num2) {
      return 1
    } else if (num1 < num2) {
      return -1
    }
  }

  return 0
}

export default defineComponent({
  name: 'WeappVersionInfo',
  props: {
    accountId: {
      type: String,
      required: true
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

    const versionRef = ref()
    const getInfo = () => {
      getWeappVersionInfo(props.accountId)
        .then((res) => {
          versionRef.value = res.data
        })
        .catch((err) => {})
    }

    getInfo()

    const showTrailQRCode = () => {
      if (!versionRef.value.currentTrialVersion) {
        message.error('当前还没有体验版小程序')
        return void 0
      }
      Modal.open({
        title: '体验版二维码',
        content: <TrialQRCode version={versionRef.value.currentTrialVersion.id} />
      })
    }

    const QRCodeURL = computed(() => {
      if (!versionRef.value?.currentReleaseVersionQrCode) return null
      return `data:image/gif;base64,${versionRef.value.currentReleaseVersionQrCode}`
    })

    /** 是否可升级体验版版本 */
    const updateAvailable = computed(() => {
      const { latestReleaseTemplate, currentTrialVersion } = versionRef.value!
      if (latestReleaseTemplate?.userVersion && currentTrialVersion?.userVersion) {
        return compareVersion(latestReleaseTemplate.userVersion, currentTrialVersion.userVersion) === 1
      }
      return true
    })

    let upgradeLoading = false
    /** 升级体验版 */
    const upgrade = () => {
      if (upgradeLoading) return void 0
      upgradeLoading = true
      const msgId = uuid()
      message.loading({ key: msgId, content: '正在升级中，请稍候...' })
      upgradeTrailWeapp(props.accountId)
        .then((res: any) => {
          if (res.code === 200) {
            message.success({ key: msgId, content: res.msg || '升级成功' })
            getInfo()
          } else {
            message.error({ key: msgId, content: res.msg || '升级失败' })
          }
        })
        .catch((err) => {
          message.destroy(msgId)
          useRequestErrorMessage(err)
        })
        .finally(() => {
          upgradeLoading = false
        })
    }

    const audit = (flag = false) => {
      if (
        props.needWechatPay &&
        flag !== true &&
        props.account?.wechatPayApplyment?.status !== WECHATPAY_APPLY_STAUS_COMPLETED
      ) {
        return message.error({
          content: (
            <span class="color-error">
              当前小程序尚未开通微信支付能力，无法进行订单支付，请在小程序发布之前完成申请。
              <a
                style="margin-left: 12px;"
                onClick={() => {
                  audit(true)
                }}
              >
                继续提交审核
              </a>
            </span>
          )
        })
      }

      Modal.confirm({
        title: '提交审核',
        content: `将提交该体验版进行审核，审核预计需要1-7个工作日，确定要提交吗？`,
        onOk: async () => {
          const res: any = await auditWeapp(props.accountId).catch((err) => {
            useRequestErrorMessage(err)
          })
          if (res.code === 200) {
            message.success(res.msg || '提交成功')
          } else {
            message.error(res.msg || '提交失败')
          }
          // 刷新数据
          getInfo()
          return Promise.resolve()
        }
      })
    }

    /** 审核中 */
    const isAuditing = computed(() => {
      const { underAuditVersion } = versionRef.value!
      return underAuditVersion?.status === WEAPP_VERSION_STATUS_AUDITING
    })

    /** 可发布 */
    const releaseAvailable = computed(() => {
      const { waitReleaseVersion } = versionRef.value!
      return waitReleaseVersion?.status === WEAPP_VERSION_STATUS_ACCESS
    })

    const release = () => {
      Modal.confirm({
        title: '发布新版本',
        content: `将审核通过的版本发布到线上，此操作不支持撤回，确定要发布吗？`,
        onOk: async () => {
          const res: any = await releaseWeapp(props.accountId).catch((err) => {
            useRequestErrorMessage(err)
          })
          if (res.code === 200) {
            message.success(res.msg || '发布成功')
          } else {
            message.error(res.msg || '发布失败')
          }
          // 刷新数据
          getInfo()
          return Promise.resolve()
        }
      })
    }

    return () => {
      if (!versionRef.value) return null
      return (
        <div class="weapp-detail-block">
          <div class="weapp-detail-block__header">
            <h2>版本信息</h2>
          </div>
          <div class="weapp-version">
            <div class="weapp-basic-info__row">
              <div class="weapp-basic-info__label">线上版本</div>
              <div class="weapp-basic-info__value">
                {versionRef.value.currentReleaseVersion?.userVersion || <span class="color-disabled">尚未发布</span>}
              </div>
              <div class="weapp-basic-info__desc">
                线上所有用户使用的代码版本，该版本代码在新版本代码发布后被覆盖更新。
              </div>
              <div class="weapp-basic-info__action">
                <div class="weapp-qrcode" style={`background-image: url(${QRCodeURL.value})`}></div>
              </div>
            </div>
            <div class="weapp-basic-info__row">
              <div class="weapp-basic-info__label">体验版本</div>
              <div class="weapp-basic-info__value">
                {versionRef.value.currentTrialVersion?.userVersion || '未知'}&emsp;
                {updateAvailable.value && <a onClick={upgrade}>升级版本</a>}
              </div>
              <div class="weapp-basic-info__desc">
                版本发布成功前，支持使用指定微信号扫描预览二维码提前体验版本功能。请先输入预览者微信号，再点击预览二维码，用预览者微信号扫描二维码提前体验版本功能。
              </div>
              <div class="weapp-basic-info__action">
                <a onClick={audit}>提交审核</a>
                <a onClick={nonsupport}>管理体验成员</a>
                <a onClick={showTrailQRCode}>获取体验版二维码</a>
              </div>
            </div>
            <div class="weapp-basic-info__row">
              <div class="weapp-basic-info__label">审核版本</div>
              <div class="weapp-basic-info__value">
                {releaseAvailable.value || isAuditing.value ? (
                  versionRef.value?.underAuditVersion?.userVersion ||
                  versionRef.value?.waitReleaseVersion?.userVersion ||
                  ''
                ) : (
                  <span class="color-disabled">暂未提交审核版本</span>
                )}
                &emsp;
              </div>
              <div class="weapp-basic-info__desc">
                {releaseAvailable.value ? (
                  <span class="color-success">当前版本已审核通过，您可以随时发布到线上</span>
                ) : isAuditing.value ? (
                  <span class="color-warn">正在审核中，预计1-7个个工作日完成，审核通过后即可发布到线上</span>
                ) : (
                  <span class="color-error" innerHTML={versionRef.value?.underAuditRecord?.reason}></span>
                )}
              </div>
              <div class="weapp-basic-info__action">
                {releaseAvailable.value ? <a onClick={release}>发布</a> : null}
              </div>
            </div>
          </div>
        </div>
      )
    }
  }
})

const TrialQRCode = defineComponent({
  props: {
    version: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const loading = ref(false)
    const hasError = ref(false)
    const url = ref('')
    const getQRCode = () => {
      loading.value = true
      hasError.value = false
      getTrialWeappQRCode(props.version)
        .then((res: any) => {
          if (res.code === 200) {
            url.value = `data:image/gif;base64,${res.data}`
          } else {
            hasError.value = true
            message.error(res.msg || '获取体验版二维码失败')
          }
        })
        .catch((err) => {
          useRequestErrorMessage(err)
          hasError.value = true
        })
        .finally(() => {
          loading.value = false
        })
    }

    onMounted(getQRCode)
    return () => {
      return (
        <div class="weapp-info-trial-qrcode">
          <div class="qrcode-image">
            {hasError.value ? (
              <div>
                抱歉出错了，
                <a style="margin-top: 8px;" onClick={getQRCode}>
                  点击重试
                </a>
              </div>
            ) : url.value ? (
              <img src={url.value} />
            ) : (
              <Spin />
            )}
          </div>
          <strong>体验成员可以使用「微信」扫码查看小程序</strong>
        </div>
      )
    }
  }
})
