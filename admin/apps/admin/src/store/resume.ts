// 简历的store

import { defineStore } from 'pinia'

const resumeStore = defineStore('resume', {
  state: () => ({
    menu: 'resume',
    resumeData: {},
    installedList: {},
    usedList: {
      components: {}
    }
  })
})
export default resumeStore