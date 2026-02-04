import { getWebviewAuthFile, updatePrivacy, updateWebviewUrls } from '../../../api/weapp'
import { message } from '@pkg/ui'
import { defineComponent, ref } from 'vue'
import { useRequestErrorMessage } from '../../../hooks/useRequestErrorMessage'

const downloadTxtFile = (fileName: string, content: string) => {
  // 创建文件内容
  const fileContent = content

  // 创建一个Blob对象
  const blob = new Blob([fileContent], { type: 'text/plain' })

  // 创建一个a标签
  const link = document.createElement('a')

  // 设置a标签的href属性为Blob URL
  link.href = window.URL.createObjectURL(blob)

  // 设置下载文件的名称
  link.download = fileName

  // 将a标签隐藏起来
  link.style.display = 'none'

  // 将a标签添加到页面中
  document.body.appendChild(link)

  // 触发点击事件以下载文件
  link.click()

  // 清理创建的元素和URL对象
  document.body.removeChild(link)
  window.URL.revokeObjectURL(link.href)
}

export default defineComponent({
  name: 'WeappDevSettings',
  props: {
    accountId: {
      type: String,
      required: true
    }
  },
  emits: {
    nonsupport: () => true
  },
  setup(props, { emit }) {
    const nonsupport = () => emit('nonsupport')
    const isUpdatePrivacyLoading = ref(false)
    const handleUpdatePrivacy = async () => {
      if (isUpdatePrivacyLoading.value) return void 0
      isUpdatePrivacyLoading.value = true
      const res: any = await updatePrivacy(props.accountId).catch((err) => {
        useRequestErrorMessage(err)
        Promise.reject()
      })
      if (res.code === 200) {
        message.success(res.msg || '更新成功')
      } else {
        message.error(res.msg || '更新失败')
        Promise.reject()
      }
      isUpdatePrivacyLoading.value = false
      Promise.resolve()
    }

    const onDownloadAuthFile = () => {
      const closeLoadling = message.loading('获取下载链接中')
      getWebviewAuthFile(props.accountId)
        .then((res) => {
          if (res.code == 200) {
            message.success('校验文件已下载')
            downloadTxtFile(res.data.fileName, res.data.fileContent)
          } else {
            useRequestErrorMessage(res)
          }
        })
        .catch((err) => {
          useRequestErrorMessage(err)
        })
        .finally(() => {
          closeLoadling()
        })
    }

    const webviewURLs = [
      'https://cardcat.cn',
      'https://null.cn',
      'https://wx.haihuishou.com',
      'https://www.qipiao.net',
      'https://7moor.youpiaopiao.cn',
      'https://static.aihecong.com/',
      'https://jxi-fuli-m-cname1.jd.com',
      'https://jxi-fuli-login-cname1.jd.com'
    ]

    const onUpdateWebviewUrls = () => {
      const closeLoading = message.loading('设置中...')
      // message.error('该功能暂未开放')
      updateWebviewUrls(props.accountId, webviewURLs).finally(() => {
        closeLoading()
        message.success('设置成功')
      })
    }

    return () => {
      return (
        <div class="weapp-detail-block">
          <div class="weapp-detail-block__header">
            <h2>开发设置</h2>
            <span class="weapp-detail-block__header-action clickable">
              <iconpark-icon name="undo"></iconpark-icon>刷新
            </span>
          </div>
          <div class="weapp-basic-info">
            <div class="weapp-basic-info__row">
              <div class="weapp-basic-info__label">用户隐私保护指引</div>
              <div class="weapp-basic-info__value">
                <span class="color-disabled">／</span>
              </div>
              <div class="weapp-basic-info__desc">
                基于微信提供的
                <a
                  href="https://mp.weixin.qq.com/wxamp/wadevelopcode/privacy_example?token=772659368&lang=zh_CN"
                  target="_blank"
                >
                  标准化用户隐私保护指引
                </a>
                ，根据小程序实际情况更新并展示给用户。
                <a href="https://developers.weixin.qq.com/miniprogram/dev/framework/user-privacy/" target="_blank">
                  了解详情
                </a>
              </div>
              <div class="weapp-basic-info__action">
                <a onClick={handleUpdatePrivacy}>更新</a>
              </div>
            </div>
            <div class="weapp-basic-info__row">
              <div class="weapp-basic-info__label">小程序业务域名</div>
              <div class="weapp-basic-info__value">
                {webviewURLs.map((url) => {
                  return (
                    <div>
                      <a href={url}>{url}</a>
                    </div>
                  )
                })}
              </div>
              <div class="weapp-basic-info__desc">最多可以添加 200 个业务域名，已添加 {webviewURLs.length} 个</div>
              <div class="weapp-basic-info__action">
                <a onClick={onDownloadAuthFile}>下载校验文件</a>
                <a onClick={onUpdateWebviewUrls}>更新</a>
              </div>
            </div>
          </div>
        </div>
      )
    }
  }
})
