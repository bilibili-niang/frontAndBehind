export interface ActionImageDefine {
  url: string
  width?: number
  height?: number
  /** 点击整图时的动作 */
  action?: any
  /** 热区图片类型 */
  type?: 'hotspot' | 'single'
  /** 热区集合 */
  spots?: Array<{
    x: number
    y: number
    w: number
    h: number
    action?: any
  }>
}