export type IconfontName = 'close' | 'check' | 'menu' | 'back' | 'right' | (string & {})

export default (props: { name?: IconfontName; style?: any; class?: any }, { attrs }) => {
  return (
    <div
      {...attrs}
      style={props.style}
      class={['icon', 'iconfont', `icon-${props?.name || 'texture'}`, props.class]}
    ></div>
  )
}
