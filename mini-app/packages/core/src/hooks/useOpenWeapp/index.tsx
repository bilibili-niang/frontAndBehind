import Taro from '@tarojs/taro'
import useModal from '../useModal'
import './style.scss'
import { uuid } from '@anteng/utils'
import useToast from '../useToast'
export const useOpenWeapp = (options: {
  title?: string
  appLogo?: string
  appName?: string
  appId: string
  path?: string
  fail?: (error: any) => void
  success?: (res: any) => void
  complete?: (res: any) => void
  envVersion?: string
}) => {
  if (process.env.TARO_ENV === 'h5') {
    const {
      title = '打开第三方小程序',
      appName = '第三方',
      appId,
      path,
      appLogo = 'https://dev-cdn.null.cn/upload/18412487137823edf62eae72585dae7e.svg'
    } = options

    const _path = path ? formatAppPath(path) : undefined

    console.log(path, _path)

    const buttonId = `open-button-${uuid()}`

    const modal = useModal({
      title: title,
      height: 'auto',
      onClose: () => {
        options.complete?.({})
      },
      content: () => {
        return (
          <div class="use-open-weapp">
            <div class="apps">
              <div class="app">
                <div
                  class="logo"
                  style="background-image:url(https://dev-cdn.null.cn/upload/90fbc7a0026ebcc46b86ec5765474b63.svg)"
                ></div>
                <div class="name">微信</div>
              </div>
              <div class="dots">
                <i></i>
                <i></i>
                <i></i>
              </div>
              <div class="app">
                <div
                  class="logo"
                  style={{
                    backgroundImage: `url(${appLogo})`
                  }}
                ></div>
                <div class="name">{appName}小程序</div>
              </div>
            </div>
            <div class="tip">如未自动打开，请点击下方按钮</div>
            <div id="mp-btn" class="button">
              立即前往
              <wx-open-launch-weapp
                id={buttonId}
                style="position: absolute;z-index: 20;top: 0;left: 0;right: 0;bottom: 0;display: block;width: 100%;height: 100%;"
                path={_path}
                appid={appId}
              >
                <script type="text/wxtag-template">
                  <div style="display:block;width:100px;height:100px;opacity:0;-webkit-tap-highlight-color:rgba(0,0,0,0);-webkit-tap-highlight-color:transparent;"></div>
                </script>
              </wx-open-launch-weapp>
            </div>
          </div>
        )
      }
    })

    setTimeout(() => {
      const btn = document.getElementById(buttonId)!
      btn.addEventListener('launch', function (e) {
        modal.close()
        console.log('success', e)
        options.success?.(e)
      })
      btn.addEventListener('error', function (e: any) {
        modal.close()
        useToast(e.detail?.errMsg || '打开失败')
        options.fail?.(e)
      })
    })
  } else {
    const { appId, path, success, fail, complete, envVersion = 'release' } = options
    Taro.navigateToMiniProgram({
      appId,
      path,
      success,
      fail,
      complete,
      envVersion: envVersion as any
    })
  }
}

/**
 * 格式化路径，确保以 .html 结尾，同时保留查询参数
 * @param {string} path - 原始路径
 * @returns {string} 格式化后的路径
 */
function formatAppPath(path: string) {
  // 使用 URL 对象解析路径，方便处理查询参数
  try {
    const url = new URL(path, window.location.origin)
    let pathname = url.pathname

    // 检查路径是否以 .html 结尾
    if (!pathname.endsWith('.html')) {
      pathname += '.html'
    }

    // 重新组装路径，保留查询参数和哈希
    return `${pathname}${url.search}${url.hash}`
  } catch (error) {
    // 如果路径不是有效的 URL，假设它是相对路径并添加 .html
    if (!path.endsWith('.html')) {
      path += '.html'
    }
    return path
  }
}

// 示例用法
// const paths = [
//   '/pages/index', // 缺少 .html
//   '/pages/detail?foo=bar', // 缺少 .html 但有查询参数
//   '/pages/about.html', // 已经包含 .html
//   '/pages/contact?name=John#section', // 包含 .html 和查询参数及哈希
//   'https://example.com/pages/home?search=test' // 完整 URL
// ]

// paths.forEach(p => {
//   console.log(formatAppPath(p))
// })
