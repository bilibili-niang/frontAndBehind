import { renderAnyNode } from '@anteng/utils'
import usePopup from '../usePopup'
import './style.scss'

// TODO 这里把 toast 和 modal 区分开，因为小程序 scroll-view 的缺陷 popup 内部做了特殊处理（list、tempList）
// toast 触发更频繁，且内部必定不存在 scroll-view 组件，不需要 tempList 处理
const useToast = (message: any) => {
  const popup = usePopup({
    content: (
      <div class="anteng-toast">
        <div class="anteng-toast-content">{renderAnyNode(message)}</div>
      </div>
    ),
    placement: 'center',
    maskVisible: false,
    maskCloseable: false,
    zIndex: 9999,
    className: 'anteng-toast-popup'
  })
  setTimeout(() => {
    popup.close()
  }, 2000)
}

export default useToast
