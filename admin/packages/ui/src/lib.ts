import './styles/settings.scss'
import 'ant-design-vue/dist/reset.css'
import { PREFIX_CLS } from '@pkg/config'
import { ConfigProvider } from 'ant-design-vue'
import message from './components/message'
import Icon from './components/icon'
import InputNumber from './components/inputNumber'
import Slider from './components/slider'

ConfigProvider.config({ prefixCls: PREFIX_CLS })

export { default as Button } from './components/button/index'

export { default as Menu } from './components/menu/index'
export { default as Input } from './components/input/index'
export { default as List } from './components/list/index'
export { default as ListItem } from './components/listItem/index'
export { default as ListItemSubtitle } from './components/listItemSubtitle/index'
export { default as ListItemTitle } from './components/listItemTitle/index'
export { default as Modal } from './components/modal/index'
export { default as SourceView } from './components/sourceViewer/index'
export { default as ScrollTab, ScrollTabItem } from './components/scrollTab'
export { default as Select } from './components/select'
export { default as ThemeSwitch } from './components/themeSwitch'
export { default as Switch } from './components/switch'
export * from './components/checkbox'
export { default as Empty } from './components/empty'
export { default as Tabs } from './components/tabs'
export { default as PropertyTabs } from './components/propertyTabs'
export { default as ScrollContainer } from './components/scrollContainer'
export { default as Tag } from './components/tag'
export { default as InfoList } from './components/infoList'
export { default as JsonView } from './components/json-view'
export { default as Radio } from './components/radio'
export { default as TestFloat } from './components/test-float'
export { default as ColorPicker } from './components/colorPicker'
export { default as UploadImage } from './components/uploadImage'
export { default as ExpandList } from './components/expandList'

export {
  ConfigProvider,
  message,
  Icon,
  InputNumber,
  Slider
}

export const Result = (nodeContent: any) => {
  return nodeContent
}
export * from 'ant-design-vue'

// 装修组件的封装
export { default as DeckImage } from './deck/deckImage'
