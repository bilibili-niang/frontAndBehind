import './style.scss'
import { Image } from '@tarojs/components'
export default (
  props: {
    primary?: boolean
    white?: boolean
    [key: string]: any
  },
  { attrs }
) => {
  if (props.primary) {
    return (
      <Image
        {...attrs}
        class="c_spin"
        src="https://dev-cdn.null.cn/upload/20240528/d5ce41fa2f9405a9375edce74efa0e23.svg"
      />
    )
  }
  if (props.white) {
    return (
      <Image {...attrs} class="c_spin" src="https://dev-cdn.null.cn/upload/1949c12b8a793aa33196176cdeb56d34.svg" />
    )
  }
  return (
    <Image
      {...attrs}
      class="c_spin"
      src="https://dev-cdn.null.cn/upload/20240522/aeae3cfa18803095d215b545b8bf0f2a.svg"
    />
  )
  // return <div class="c_spin" {...attrs}></div>
}
