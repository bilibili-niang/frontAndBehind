import { defineComponent, reactive } from 'vue'
import './style.scss'
import { Button, Input } from '@pkg/ui'
import { PREFIX_CLS, TENCENT_MAP_KEY } from '@pkg/config'

export type AddressData = {
  /** 地名 */
  name: string
  /** 地址 */
  address: string
  /** 地址 */
  city: string
  /** 经度 */
  longitude: number
  /** 维度 */
  latitude: number
}

export default defineComponent({
  name: 'AddressSelector',
  props: {
    latitude: {
      type: [String, Number]
    },
    longitude: {
      type: [String, Number]
    }
  },
  emits: ['success'],
  setup(props, { emit }) {
    const state = reactive({
      latlng: {
        lat: null,
        lng: null
      },
      poiaddress: '',
      poiname: '',
      cityname: ''
    })

    const onConfirm = () => {
      emit('success', {
        name: state.poiname,
        address: state.poiaddress,
        city: state.cityname,
        longitude: state.latlng.lng,
        latitude: state.latlng.lat
      })
    }

    window.addEventListener(
      'message',
      function (event) {
        if (event.data?.module == 'locationPicker') {
          console.log('location', event.data)
          Object.assign(state, event.data)
        }
      },
      false
    )

    // onMounted(initMap)
    return () => {
      const coord = props.latitude && props.longitude && `${props.latitude},${props.longitude}`
      const link = coord
        ? `https://apis.map.qq.com/tools/locpicker?search=1&type=1&key=${TENCENT_MAP_KEY}&referer=null&coord=${coord}`
        : `https://apis.map.qq.com/tools/locpicker?search=1&type=1&key=${TENCENT_MAP_KEY}&referer=null`
      return (
        <div class={`${PREFIX_CLS}-address-selector`}>
          <div class={`${PREFIX_CLS}-address-selector__container`}>
            <iframe id="mapPage" width="100%" height="100%" frameborder="0" src={link}></iframe>
          </div>
          {state.latlng.lat === null ? (
            <div class={`${PREFIX_CLS}-address-selector__info`}>
              请拖动地图后选择所需地址选项, 如有需要可以修改地名、地址
            </div>
          ) : (
            <>
              <div class={`${PREFIX_CLS}-address-selector__info`}>
                <div style="display:flex;align-items:center;white-space:nowrap;">
                  具体地名：
                  <Input
                    value={state.poiname}
                    onInput={(e) => {
                      state.poiname = e.target.value!
                    }}
                  />
                </div>
                <div style="display:flex;align-items:center;white-space:nowrap;">
                  详细地址：
                  <Input
                    value={state.poiaddress}
                    onInput={(e) => {
                      state.poiaddress = e.target.value!
                    }}
                  />
                </div>
                <small>
                  经纬度坐标：{state.latlng.lng}, {state.latlng.lat}
                </small>
              </div>
              <div class={`${PREFIX_CLS}-address-selector__footer`}>
                <Button style="margin-left: auto;" type="primary" onClick={onConfirm}>
                  确定
                </Button>
              </div>
            </>
          )}
        </div>
      )
    }
  }
})
