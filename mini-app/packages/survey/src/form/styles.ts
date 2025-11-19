/** 问卷设置 */
export interface SurveyFormStyles {
  index: {
    backgroundImage: string
    paddingTop: number
    title: {
      text: string
      color: string
    }
    tipEnable: boolean
    tip: {
      text: string
      color: string
    }
    button: {
      text: string
      color: string
      backgroundColor: string
    }
  }
  content: {
    primaryColor: string
    backgroundColor: string
    title: {
      color: string
    }
    content: {
      color: string
    }
  }
  end: {
    backgroundImage: string
    paddingTop: number
    title: {
      text: string
      color: string
    }
    tipEnable: boolean
    tip: {
      text: string
      color: string
    }
    color: string
    button: {
      text: string
      color: string
      backgroundColor: string
    }
    ads: string
  }
}

export const generateDefaultFormStyles = (): SurveyFormStyles => ({
  index: {
    backgroundImage: 'https://dev-cdn.anteng.cn/upload/5e97376a7d789a59c3dd7db2602ccf30.jpg',
    paddingTop: 180,
    title: {
      text: '',
      color: '#000000'
    },
    tipEnable: true,
    tip: {
      text: '',
      color: '#000000'
    },
    button: {
      text: '',
      color: '#ffffff',
      backgroundColor: '#6366f1'
    }
  },
  content: {
    primaryColor: '#6366f1',
    backgroundColor: '#ffffff',
    title: {
      color: '#000000'
    },
    content: {
      color: '#121212'
    }
  },
  end: {
    backgroundImage: 'https://dev-cdn.anteng.cn/upload/5e97376a7d789a59c3dd7db2602ccf30.jpg',
    paddingTop: 180,
    title: {
      text: '',
      color: '#000000'
    },
    tipEnable: true,
    tip: {
      text: '',
      color: '#000000'
    },
    color: '#000000',
    button: {
      text: '',
      color: '#ffffff',
      backgroundColor: '#6366f1'
    },
    ads: ''
  }
})
