import usePopup from '../usePopup'
import './style.scss'
import Taro from '@tarojs/taro'
import { Button, Navigator } from '@tarojs/components'

declare const wx: any

/** 微信小程序同意用户隐私保护指引 */
const usePrivacyAgreement = () => {
  return new Promise((resolve, reject) => {
    if (process.env.TARO_ENV === 'weapp' && wx.getPrivacySetting) {
      wx.getPrivacySetting({
        success: res => {
          // console.log('用户隐私：', res)
          if (res.needAuthorization) {
            try {
              openPrivacyAgreement(() => {
                resolve(null)
              })
            } catch (err) {
              resolve(null)
            }
          } else {
            resolve(null)
          }
        },
        fail: () => {
          resolve(null)
        }
      })
    } else {
      resolve(null)
    }
  })
}

const openPrivacyAgreement = (callback: () => void) => {
  const popup = usePopup({
    placement: 'center',
    content: (
      <div class="user-privacy">
        <div class="user-privacy__title">用户隐私保护指引</div>
        <div class="user-privacy__content">感谢您信任并使用我们的产品。</div>
        <div class="user-privacy__content">
          当您使用本产品时，请您务必仔细阅读、充分理解“用户隐私保护指引”各条款，包括但不限于：为您提供服务并保障您的相关信息，以及为您提供的访问、修改、删除和您相关的信息的方式。
        </div>
        <div class="user-privacy__tip">
          如您已阅读并同意
          <div
            class="user-privacy__link"
            onClick={() => {
              Taro.openPrivacyContract()
            }}
          >
            《用户隐私保护指引》
          </div>
          ，请点击“同意”开始使用我们的产品和服务。
        </div>
        <div class="user-privacy__actions">
          <div class="user-privacy__reject">
            <Navigator class="user-privacy__button" target="miniProgram" open-type="exit"></Navigator>
            <div>拒绝</div>
          </div>
          <div class="user-privacy__resolve">
            <Button
              class="user-privacy__button"
              open-type="agreePrivacyAuthorization"
              onClick={() => {
                popup.close()
                callback()
              }}
            ></Button>
            <div>同意</div>
          </div>
        </div>
      </div>
    ),
    maskCloseable: false
  })
}

export default usePrivacyAgreement
