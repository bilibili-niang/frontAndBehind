import Container from '../components/container'

import FloatButton from '../components/float-button'
import Image from '../components/image'
import Swiper from '../components/swiper'
import ImagesSideSlide from '../components/images-side-slide'
import SlidableTile from '../components/slidable-tile'
import RickText from '../components/rich-text'
import Anchor from '../components/anchor'
import ViewTab from '../components/view-tab'
import ViewTabContainer from '../components/view-tab/view-tab-container'
import ImageModal from '../components/image-modal'
import Video from '../components/video'
import Placeholder from '../components/placeholder'
import Title from '../components/title'
import SubTitle from '../components/sub-title'
import QuickLink from '../components/quick-link'
import Notice from '../components/notice'
import JumpCard from '../components/jump-card'

export { FloatButton, Image, ImagesSideSlide, SlidableTile, RickText, Anchor, ViewTab }

/** 通用装修组件，跨业务项目，没有任何具体业务，完全通过 action 控制行为动作，
 *
 * 否则视为业务组件，应该在具体项目内部使用 registerDeckComponent 进行注册 */
export const commonDeckComponents = {
  container: Container,
  title: Title, // 标题
  'sub-title': SubTitle, // 主标题组件（含副标题）
  image: Image, // 图片
  'images-card': Image, // 图片卡片,没啥区别
  swiper: Swiper, // 轮播图
  'quick-link': QuickLink, // 金刚区
  notice: Notice, // 消息通知
  'jump-card': JumpCard, // 跳转卡片
  'float-button': FloatButton, // 悬浮按钮
  'images-side-slide': ImagesSideSlide, // 多图排列
  'slidable-tile': SlidableTile, // 动态瓷片区
  'rich-text': RickText, // 图文
  anchor: Anchor, // 电梯导航
  'view-tab': ViewTab, // 分页切换
  'view-tab-container': ViewTabContainer, // 分页容器
  'image-modal': ImageModal, // 图片弹窗
  video: Video, // 视频
  placeholder: Placeholder // 空白占位
}

export const comps = new Map()

Object.keys(commonDeckComponents).forEach(key => {
  comps.set(key, commonDeckComponents[key])
})

/** 注册装修组件 */
export const registerDeckComponent = (key: string, comp: any) => {
  if (comps.get(key)) {
    console.warn(`装修组件 ${key} 已被覆盖`)
  }
  comps.set(key, comp)
}
