import { Input } from '@pkg/ui'
import useModal from '../useModal'

export const useScanDevice = () => {
  useModal({
    content: () => {
      return (
        <div>
          <div>请使用扫码设备扫描用户付款码</div>
          <Input focused />
          <div>
            <button>取消</button>
          </div>
        </div>
      )
    }
  })
}
