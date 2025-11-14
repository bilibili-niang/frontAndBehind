import Taro from '@tarojs/taro'

const useAutoAdjustNavTextStyle = (style: 'white' | 'black') => {
  Taro.useDidShow(() => {
    Taro.setBackgroundTextStyle({
      textStyle: style === 'white' ? 'light' : 'dark'
    })
  })
}

export default useAutoAdjustNavTextStyle
