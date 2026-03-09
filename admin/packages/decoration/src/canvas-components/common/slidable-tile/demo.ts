export default {
  autoplayEnable: true,
  autoplay: 3.5,
  list: [
    {
      title: '附近热点',
      subtitle: '福利大放送',
      icon: {
        url: 'https://dev-cdn.dev-cdn.ice.cn/upload/4d0934d2b8e54fc74331f7f3ce48a6fe.png',
        width: 200,
        height: 200
      },
      backgroundColor: 'rgba(0, 168, 65, 1)',
      action: {
        key: 'value-card-list',
        config: { __preCondition: { isLogin: { enable: false, message: '', handler: 'login' } } },
        remark: ''
      },
      primaryIcon: {
        type: 'hide',
        replacedIcon: null,
        size: { width: 50, height: 50 },
        offset: { x: 0, y: 0 }
      },
      primaryContent: {
        type: 'custom',
        customImage: {
          width: 1200,
          height: 675,
          url: 'https://dev-cdn.dev-cdn.ice.cn/upload/4ac8003d32c21da1472fd8dcfbf6a4be.webp'
        },
        linearGradientEnable: true,
        linearGradient: { deg: 180, from: 'rgba(255, 0, 0, 0.1)', to: 'rgba(255, 255, 255, 1)' },
        title: {
          text: ' ',
          color: 'rgba(255, 0, 43, 1)',
          icon: {
            url: 'https://dev-cdn.dev-cdn.ice.cn/upload/3baeacd1e2cfb5f1435e1c1581484612.png',
            width: 1051,
            height: 246
          }
        },
        subtitle: { text: '储值卡福利大放送', text2: '不止五折！', color: 'rgba(255, 0, 44, 0.5)' },
        actionEnable: true,
        action: { text: '去抢购', arrow: true, color: 'rgba(255, 0, 44, 1)' }
      }
    },
    {
      title: '羽毛球',
      subtitle: '羽跃穿梭',
      icon: {
        width: 480,
        height: 480,
        url: 'http://dev-cdn.ice-test.oss-cn-hangzhou.aliyuncs.com/upload/693eb0e85460227994b39e6f9935553d.png'
      },
      backgroundColor: '#fff',
      action: null,
      primaryIcon: {
        type: 'replace',
        replacedIcon: {
          width: 1115,
          height: 786,
          url: 'https://dev-cdn.dev-cdn.ice.cn/upload/a159d50a45d96c2307a2dfb7e3157c44.png'
        },
        size: { width: 110, height: 110 },
        offset: { x: 12, y: 5 }
      },
      primaryContent: {
        type: 'default',
        customImage: null,
        linearGradientEnable: true,
        linearGradient: { deg: 180, from: 'rgba(0, 116, 255, 0.1)', to: '#fff' },
        title: { text: null, color: 'rgba(0, 95, 212, 1)', icon: { url: '', width: 0, height: 0 } },
        subtitle: { text: null, text2: null, color: 'rgba(0, 105, 204, 0.75)' },
        actionEnable: true,
        action: { text: '去订场', arrow: true, color: 'rgba(0, 133, 255, 1)' }
      }
    },
    {
      title: '篮球',
      subtitle: '球场攻坚',
      icon: {
        width: 480,
        height: 480,
        url: 'http://dev-cdn.ice-test.oss-cn-hangzhou.aliyuncs.com/upload/54873d9772c12847d0e90e9befeb5d51.png'
      },
      backgroundColor: '#fff',
      action: null,
      primaryIcon: {
        type: 'replace',
        replacedIcon: {
          width: 460,
          height: 560,
          url: 'https://dev-cdn.dev-cdn.ice.cn/upload/87c9869270e566e5cd69a80be108df01.png'
        },
        size: { width: 80, height: 80 },
        offset: { x: -4, y: 4 }
      },
      primaryContent: {
        type: 'default',
        customImage: null,
        linearGradientEnable: true,
        linearGradient: { deg: 180, from: 'rgba(255, 96, 0, 0.1)', to: '#fff' },
        title: {
          text: '小黑子的篮球',
          color: 'rgba(224, 86, 0, 1)',
          icon: {
            url: 'https://dev-cdn.dev-cdn.ice.cn/upload/4ecf11535bd48dee163cb023616a5bdf.png',
            width: 378,
            height: 357
          }
        },
        subtitle: { text: null, text2: '练习时长两年半', color: 'rgba(255, 96, 0, 0.75)' },
        actionEnable: true,
        action: { text: '唱跳Rap', arrow: false, color: 'rgba(255, 96, 0, 1)' }
      }
    }
  ]
}
