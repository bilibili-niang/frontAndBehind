import Progress from 'nprogress'
import { PREFIX_CLS } from '@anteng/uiconfig'
import './style.scss'

Progress.configure({
  template: `<div role="bar" class="bar ${PREFIX_CLS}-progress">
  <div class="peg"></div>
</div>
<div class="spinner">
  <svg t="1688635985532" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="7024" width="200" height="200"><path d="M512 0c282.8 0 512 229.2 512 512 0 49.5-40.1 89.6-89.6 89.6-48.5 0-87.9-38.5-89.5-86.5l-0.1-3.1c0-183.8-149-332.8-332.8-332.8S179.2 328.2 179.2 512c0 182 146 329.8 327.3 332.8h5.5c49.5 0 89.6 40.1 89.6 89.6 0 49.5-40.1 89.6-89.6 89.6C229.2 1024 0 794.8 0 512S229.2 0 512 0z" p-id="7025"></path></svg>
</div>`
})

export default Progress
