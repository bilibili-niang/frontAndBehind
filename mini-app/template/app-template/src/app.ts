import { createApp } from 'vue'
import { createPinia } from 'pinia'

import './app.scss'
import { uuid } from '@anteng/utils'

const App = createApp({
  onShow(options) {}
})

App.use(createPinia())

export default App

console.log(process.env.TARO_APP_REQUEST_BASE_URL)

uuid()
