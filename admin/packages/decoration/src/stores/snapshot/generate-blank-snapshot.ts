import { uuid } from '@anteng/core'
import { formatDate } from '../../utils/date'
import useCanvasStore from '../canvas'

export default () => {
  const date = new Date()

  return {
    id: uuid(),
    name: formatDate(date),
    date: formatDate(date),
    timestamp: +date,
    description: '',
    payload: {
      page: useCanvasStore().pageDefine?.default ?? null,
      // page: {
      //   basic: {
      //     name: '',
      //     backgroundEnable: false,
      //     background: 'rgba(255, 255, 255, 0)',
      //     shareType: 'default',
      //     shareConfig: {
      //       title: '',
      //       subtitle: '',
      //       image: ''
      //     }
      //   },
      //   navigator: {
      //     theme: 'basic',
      //     title: '导航栏标题',
      //     navigationBarTextStyle: 'black',
      //     backgroundColor: 'rgba(255, 255, 255, 1)',
      //     foreground: {
      //       enable: false,
      //       type: 'color',
      //       backgroundColor: 'rgba(105, 147, 255, 1)'
      //     }
      //   }
      // },
      components: []
    }
  }
}
