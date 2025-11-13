export interface PropertyTab {
  /** 标签的唯一标识 */
  key: string
  /** 标签显示的标题 */
  title: string
  /** 标签图标名称 */
  icon?: string
  /** 标签内容渲染函数 */
  render: () => any
}

export interface PropertyTabsProps {
  /** 标签列表 */
  tabs: PropertyTab[]
  /** 默认激活的标签key */
  defaultActiveKey?: string
  /** 标签切换时的回调函数 */
  onChange?: (activeKey: string) => void
}

export interface PropertyTabsInstance {
  /** 当前激活的标签key */
  activeKey: string
  /** 切换到指定标签 */
  setActiveKey: (key: string) => void
}