import { defineComponent } from 'vue'
import './style.scss'
import usePopup from '../usePopup'
import Taro from '@tarojs/taro'
import useUserStore from '../../stores/user'

const LocationDeny = defineComponent({
  name: 'modal-location-deny',
  emits: {
    close: () => true
  },
  setup(props, { emit }) {
    const open = () => {
      Taro.openSetting({
        success: () => {
          useUserStore()
            .getUserLocation({ details: true })
            .then(() => {
              emit('close')
            })
        }
      })
    }
    return () => {
      return (
        <div class="modal-location-deny">
          <div class="modal-location-deny__image"></div>
          <div class="modal-location-deny__title">请先开启定位权限</div>
          <div class="modal-location-deny__desc">为了提供更好的服务体验，请开启定位权限，将为您推荐附近的内容。</div>
          <div class="modal-location-deny__button" onClick={open}>
            点击开启定位
          </div>
          <div class="modal-location-deny__cancel" onClick={() => emit('close')}>
            暂不开启
          </div>
        </div>
      )
    }
  }
})

const useOpenLocationPermission = () => {
  const userStore = useUserStore()
  if (userStore.userLocationDeny) {
    const popup = usePopup({
      placement: 'center',
      content: (
        <LocationDeny
          onClose={() => {
            popup.close()
          }}
        />
      )
    })
  }
}

export default useOpenLocationPermission
