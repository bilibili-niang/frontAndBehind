import { ref } from 'vue'
import { DeckComponentConfig } from './defineDeckComponent'
import { merge } from 'lodash'

import DeckComponent_CustomPage from './page/custom-page'
import DeckComponent_LaunchPage from './page/launch-page'
import DeckComponent_LoginPage from './page/login-page'
import DeckComponent_SearchPage from './page/search-page'
import DeckComponent_UserAgreement from './page/user-agreement'

import DeckComponent_Container from './common/container'

import DeckComponent_Placeholder from './common/placeholder'
import DeckComponent_Title from './common/title'
import DeckComponent_Image from './common/image'
import DeckComponent_Notice from './common/notice'
import DeckComponent_QuickLink from './common/quick-link'
import DeckComponent_Swiper from './common/swiper'
import DeckComponent_Video from './common/video'
import DeckComponent_FloatButton from './common/float-button'
import DeckComponent_RichText from './common/rich-text'
import DeckComponent_ImagesSideSlide from './common/images-side-slide'
import DeckComponent_SlidableTile from './common/slidable-tile'
import DeckComponent_Anchor from './common/anchor'
import DeckComponent_ViewTab from './common/view-tab'
import DeckComponent_ViewTabContainer from './common/view-tab/view-tab-container'
import DeckComponent_ImageModal from './common/image-modal'
import DeckComponent_JumpCard from './common/jump-card'

/** 已注册组件 */
export const registeredComponents = ref<Record<string, DeckComponentConfig>>({})

/** 注册装修组件 */
export const registerDeckComponent = (
  /** 组件定义 */
  comp: DeckComponentConfig,
  /** 组件定义覆盖 */
  overrideOptions?: Partial<DeckComponentConfig>
) => {
  const key = comp.type === 'page' && !/-page$/.test(comp.key) ? `${comp.key}-page` : comp.key
  registeredComponents.value[key] = merge({}, comp, overrideOptions)
}

registerDeckComponent(DeckComponent_CustomPage)
registerDeckComponent(DeckComponent_LaunchPage)
registerDeckComponent(DeckComponent_LoginPage)
registerDeckComponent(DeckComponent_SearchPage)
registerDeckComponent(DeckComponent_UserAgreement)

registerDeckComponent(DeckComponent_Container)

registerDeckComponent(DeckComponent_Title)
registerDeckComponent(DeckComponent_Image)
registerDeckComponent(DeckComponent_QuickLink)
registerDeckComponent(DeckComponent_Notice)
registerDeckComponent(DeckComponent_Swiper)
registerDeckComponent(DeckComponent_Placeholder)
registerDeckComponent(DeckComponent_FloatButton)
registerDeckComponent(DeckComponent_Video)
registerDeckComponent(DeckComponent_RichText)
registerDeckComponent(DeckComponent_ImagesSideSlide)
registerDeckComponent(DeckComponent_SlidableTile)
registerDeckComponent(DeckComponent_Anchor)
registerDeckComponent(DeckComponent_ViewTab)
registerDeckComponent(DeckComponent_ViewTabContainer)
registerDeckComponent(DeckComponent_ImageModal)
registerDeckComponent(DeckComponent_JumpCard)
