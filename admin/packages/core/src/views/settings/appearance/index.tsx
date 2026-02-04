import { defineComponent } from 'vue'
import useAppStore from '../../../stores/app'
import { storeToRefs } from 'pinia'
import themeConfig from './theme.json'
import './style.scss'
import Colors from './colors'
import { PREFIX_CLS } from '@pkg/config'
import { Icon } from '@pkg/ui'

export default defineComponent({
  name: 'SettingsTheme',
  setup() {
    const appStore = useAppStore()
    const { setTheme } = appStore
    const { theme } = storeToRefs(appStore)

    const themeModes = [...Object.keys(themeConfig.theme)]
    const primaryColors = [...Object.keys(themeConfig.primaryColors)]

    const themeModeIcons = {
      dark: (
        <svg
          width="64"
          height="48"
          viewBox="0 0 64 48"
          fill="none"
          class="pui-components-settings-components-theme-index-theme-primary-wrapper pui-components-settings-components-theme-index-theme-primary-wrapper-selected"
        >
          <rect width="64" height="48" rx="4" fill="#2D2D2D"></rect>
          <path d="M0 4C0 1.79086 1.79086 0 4 0H23V48H4C1.79086 48 0 46.2091 0 44V4Z" fill="#333333"></path>
          <path d="M0 4C0 1.79086 1.79086 0 4 0H5V48H4C1.79086 48 0 46.2091 0 44V4Z" fill="#383838"></path>
          <rect x="30" y="6" width="26" height="6" rx="0.1" fill="#3B3B3B"></rect>
          <rect x="30" y="16" width="16" height="6" rx="0.1" fill="#3B3B3B"></rect>
          <rect x="30" y="26" width="22" height="6" rx="0.1" fill="#3B3B3B"></rect>
          <rect x="8" y="6" width="13" height="1" rx="0.1" fill="#424242"></rect>
          <rect x="8" y="11" width="6" height="1" rx="0.1" fill="#424242"></rect>
          <rect x="8" y="16" width="10" height="1" rx="0.1" fill="#424242"></rect>
        </svg>
      ),
      light: (
        <svg
          width="64"
          height="48"
          viewBox="0 0 64 48"
          fill="none"
          class="pui-components-settings-components-theme-index-theme-primary-wrapper"
        >
          <rect width="64" height="48" rx="4" fill="white"></rect>
          <path d="M0 4C0 1.79086 1.79086 0 4 0H23V48H4C1.79086 48 0 46.2091 0 44V4Z" fill="#D6D6D8"></path>
          <path d="M0 4C0 1.79086 1.79086 0 4 0H5V48H4C1.79086 48 0 46.2091 0 44V4Z" fill="#919294"></path>
          <rect x="30" y="6" width="26" height="6" rx="0.1" fill="#E6E7E9"></rect>
          <rect x="30" y="16" width="16" height="6" rx="0.1" fill="#E6E7E9"></rect>
          <rect x="30" y="26" width="22" height="6" rx="0.1" fill="#E6E7E9"></rect>
          <rect x="8" y="6" width="13" height="1" rx="0.1" fill="#919294"></rect>
          <rect x="8" y="11" width="6" height="1" rx="0.1" fill="#919294"></rect>
          <rect x="8" y="16" width="10" height="1" rx="0.1" fill="#919294"></rect>
        </svg>
      )
    }
    return () => {
      return (
        <div class={`${PREFIX_CLS}-theme`}>
          <div style="font-size: 14px; font-weight: 500; margin-bottom: 12px;">布局</div>
          <div class={`${PREFIX_CLS}-theme__layout`}>
            <div
              class={[`${PREFIX_CLS}-theme__layout-item clickable`, theme.value.layout === 'layoutA' && '--active']}
              onClick={() => {
                appStore.setTheme({ layout: 'layoutA' })
              }}
            >
              <div class="__bg">
                <i class="__a-1"></i>
                <i class="__a-2"></i>
              </div>
            </div>
            <div
              class={[`${PREFIX_CLS}-theme__layout-item clickable`, theme.value.layout === 'layoutB' && '--active']}
              onClick={() => {
                appStore.setTheme({ layout: 'layoutB' })
              }}
            >
              <div class="__bg">
                <i class="__b-1"></i>
                <i class="__b-2"></i>
              </div>
            </div>
            <div
              class={[`${PREFIX_CLS}-theme__layout-item clickable`, theme.value.layout === 'layoutC' && '--active']}
              onClick={() => {
                appStore.setTheme({ layout: 'layoutC' })
              }}
            >
              <div class="__bg">
                <i class="__c-1"></i>
                <i class="__c-2"></i>
              </div>
            </div>
          </div>
          <div style="font-size: 14px; font-weight: 500; margin-bottom: 12px;">背景模式</div>
          <div class={`${PREFIX_CLS}-theme__mode`}>
            {themeModes.map((mode) => (
              <div
                class={[`${PREFIX_CLS}-theme__mode-item clickable`, mode === theme.value.mode && '--active']}
                onClick={() => setTheme({ mode })}
              >
                {(themeModeIcons as any)[mode]}
              </div>
            ))}
          </div>
          <div style="font-size: 14px; font-weight: 500; margin-bottom: 12px;margin-top: 48px;">主题色</div>
          <div class={`${PREFIX_CLS}-theme__color`}>
            {primaryColors.map((color) => (
              <div
                class={[`${PREFIX_CLS}-theme__color-item clickable`, theme.value.primaryColor === color && '--active']}
                primary-color={color}
                onClick={() => setTheme({ primaryColor: color })}
              >
                {theme.value.primaryColor === color && <Icon name="check-small"></Icon>}
              </div>
            ))}
          </div>
          <div style="font-size: 14px; font-weight: 500; margin-bottom: 12px;margin-top: 48px;">预览</div>
          <div class="dev-fonts__list">
            <div>主要文字</div>
            <div>次要文字</div>
            <div>三级文字</div>
            <div>禁用文字</div>
          </div>
          <div class="dev-colors__list">
            {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map((level) => {
              return (
                <div
                  class="dev-colors__item"
                  style={{
                    backgroundColor: `var(--${PREFIX_CLS}-color-bg-${level})`
                  }}
                ></div>
              )
            })}
            {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map((level) => {
              return (
                <div
                  class="dev-colors__item"
                  style={{
                    backgroundColor: `var(--${PREFIX_CLS}-color-primary-${level})`
                  }}
                ></div>
              )
            })}
            {['01', '02', '03', '04', '05', '06', '07', '08', '09'].map((level) => {
              return (
                <div
                  class="dev-colors__item --alpha"
                  style={{
                    backgroundColor: `var(--${PREFIX_CLS}-color-primary-${level})`
                  }}
                ></div>
              )
            })}
          </div>
          <Colors />
        </div>
      )
    }
  }
})
