export default {
  $id: '123',
  settings: {
    base: {
      name: '致全体小学生的一份问卷',
      description:
        '为了给您提供更好的服务，希望您能抽出几分钟时间，将您的感受和建议告诉我们，我们非常重视每位用户的宝贵意见，期待您的参与！现在我们就马上开始吧！',
      collectionTime: ['', '']
    },
    display: {
      showIndex: true,
      showPagination: true,
      returnable: true
    },
    share: {
      enable: true,
      title: '',
      subtitle: '',
      image: ''
    }
  },
  styles: {
    index: {
      backgroundImage: 'https://dev-cdn.ice.cn/upload/5e97376a7d789a59c3dd7db2602ccf30.jpg',
      title: '',
      description: '',
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
      backgroundImage: 'https://dev-cdn.ice.cn/upload/5e97376a7d789a59c3dd7db2602ccf30.jpg',
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
  },
  items: [
    {
      $id: 'qy83IO5EnvEV',
      key: 'radio',
      name: '你的性别是？',
      description: '',
      required: true,
      config: {
        value: '',
        description: '',
        extraEnable: false,
        extra: {
          type: '',
          required: false,
          placeholder: '',
          minLength: null,
          maxLength: null
        },
        options: [
          {
            value: '男生'
          },
          {
            value: '女生'
          },
          {
            value: '保密',
            extraEnable: true,
            extra: {
              required: false,
              placeholder: ''
            }
          }
        ]
      }
    },
    {
      $id: '1UlPCi8v8j2C',
      key: 'input',
      name: '你的年龄是？',
      description: '',
      required: true,
      config: {
        placeholder: ''
      }
    },
    {
      $id: 'rTIB4sZs7Pj0',
      key: 'checkbox',
      name: '你想成为什么样的人？',
      description: '<p>你可以选择 3 个感兴趣的，或者输入其他内容</p>',
      required: true,
      config: {
        value: '',
        description: '',
        extraEnable: false,
        limit: {
          min: null,
          max: null
        },
        extra: {
          type: '',
          required: false,
          placeholder: '',
          minLength: null,
          maxLength: null
        },
        options: [
          {
            value: '医生'
          },
          {
            value: '警察'
          },
          {
            value: '消防员'
          },
          {
            value: '太空人',
            description: '爷爷奶奶可高兴了，赏我爱吃的大嘴巴子'
          },
          {
            value: '其他',
            extraEnable: true,
            extra: {
              required: true,
              placeholder: '请输入你的想法'
            }
          }
        ]
      }
    },
    {
      $id: 'HuAvpjfgyoOj',
      key: 'nps',
      name: '你觉得你的学习成绩怎么样？',
      description: '',
      required: true,
      config: {
        min: {
          value: 0,
          text: '非常差'
        },
        max: {
          value: 10,
          text: '非常好'
        }
      }
    },
    {
      $id: 'ql9SSmOAfNuY',
      key: 'select',
      name: '你最喜欢的科目是？',
      description: '',
      required: true,
      config: {
        value: '',
        description: '',
        options: [
          {
            value: '语文'
          },
          {
            value: '数学'
          },
          {
            value: '英语'
          },
          {
            value: '我都不喜欢'
          }
        ]
      }
    },
    {
      $id: '1uVJsaz7SzwW',
      key: 'input',
      name: '还有其他想说的吗？',
      description: '',
      required: false,
      config: {
        placeholder: ''
      }
    }
  ]
}
