import { Modal } from '@pkg/ui'
export interface IUseWebViewOptions {
  title?: string
  link: string
  width?: number
  height?: number
}
const useWebView = (options: IUseWebViewOptions) => {
  Modal.open({
    title: options.title,
    width: options.width ?? 600,
    content: (
      <div style={`height:${options.height ?? 400}px;border-radius:10px;overflow:hidden;`}>
        <iframe style="width:100%;height:100%" src={options.link}></iframe>
      </div>
    )
  })
}

export default useWebView
