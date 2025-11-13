import { Button, Modal, message, Popover, QRCode } from '@anteng/ui'
import './style.scss'

type PreviewPageOptions = {
  /** 页面链接 */
  url: string
  /** 标题: 默认 "预览页面" */
  title?: string
}

const copy = (content: string) => {
  const input = document.createElement('input')
  input.value = content
  document.body.appendChild(input)
  input.select()
  document.execCommand('Copy')
  document.body.removeChild(input)
  message.success('复制成功')
}

const open = (url: string) => {
  window.open(
    url,
    'xxx',
    `scrollbars=0,resizable=0,top=${window.screen?.height / 2 - 333},left=${
      window.screen?.width / 2 - 187
    },width=563,height=1000`
  )
}

const usePreviewPage = (options: PreviewPageOptions) => {
  Modal.open({
    title: options.title,
    centered: true,
    content: (
      <div class="use-preview-page">
        <div class="use-preview-page__link">
          <a class="link clickable max-2-rows" href="javascript:void(0);" onClick={() => open(options.url)}>
            {options.url}
          </a>
          <div class="action">
            <Button type="primary" size="small" onClick={() => copy(options.url)}>
              复制
            </Button>
            <Popover
              placement="rightTop"
              content={
                <div style="background:#fff;padding:8px;border-radius:4px;">
                  <QRCode value={options.url} />
                </div>
              }
            >
              <Button type="primary" size="small">
                二维码
              </Button>
            </Popover>
          </div>
        </div>
        <iframe src={options.url} frameborder="0" seamless></iframe>
      </div>
    )
  })
}

export default usePreviewPage
