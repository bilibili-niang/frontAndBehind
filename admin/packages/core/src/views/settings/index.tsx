import { computed, defineComponent } from 'vue'
import useAppStore from '../../stores/app'
import { storeToRefs } from 'pinia'
import { Icon, Modal } from '@anteng/ui'
import './style.scss'
import './style.dark.scss'

import Appearance from './appearance'
import About from './about'
import User from './user'
import { PREFIX_CLS } from '@anteng/config'

export default defineComponent({
  name: 'AppSettings',
  setup() {
    const appStore = useAppStore()
    const { settingsVisible, settingsKey } = storeToRefs(appStore)

    const menus = [
      { key: 'appearance', name: '外观', icon: 'theme', render: <Appearance /> },
      { key: 'user', name: '用户', icon: 'people-top-card', render: <User /> }
    ]

    const currentKey = computed(() => {
      return settingsKey.value || menus[0].key
    })
    const currrentCate = computed(() => {
      return menus.find((item) => item.key === currentKey.value)
    })

    return () => {
      return (
        <Modal
          width={948}
          open={settingsVisible.value}
          maskClosable={true}
          footer={null}
          onChange={(visible) => {
            appStore.toggleSettingsVisible(visible)
          }}
        >
          <div class={`${PREFIX_CLS}-settings`}>
            <div class={`${PREFIX_CLS}-settings__menu`}>
              <div class={`${PREFIX_CLS}-settings__title`}>设置</div>
              <div class={`${PREFIX_CLS}-settings__category`}>
                {menus.map((item) => {
                  return (
                    <div
                      key={item.key}
                      class={[
                        `${PREFIX_CLS}-settings__category-item clickable`,
                        currentKey.value === item.key && '--active'
                      ]}
                      onClick={() => (settingsKey.value = item.key)}
                    >
                      <Icon class="icon" name={item.icon as any}></Icon>
                      <span class="ellipsis">{item.name}</span>
                    </div>
                  )
                })}
              </div>
            </div>
            <div class={`${PREFIX_CLS}-settings__content`}>
              <div class={`${PREFIX_CLS}-settings__content-header`}>
                <div class={`${PREFIX_CLS}-settings__sub-title`}>{currrentCate.value?.name}</div>
              </div>
              {currrentCate.value?.render}
            </div>
          </div>
        </Modal>
      )
    }
  }
})
