import Taro from '@tarojs/taro'
import contact from './common-actions/contact'
import imageModal from './common-actions/image-modal'
import Call from './common-actions/phone-call'

export const commonActions = {
  contact,
  imageModal,
  Call,
  'wx-channels-activity': {
    key: 'wx-channels-activity',
    title: '打开视频号-视频',
    handler: config => {
      Taro.openChannelsActivity(config)
    }
  },
  'wx-channels-profile': {
    key: 'wx-channels-profile',
    title: '打开视频号-主页',
    handler: config => {
      Taro.openChannelsUserProfile(config)
    }
  },
  'wx-channels-event': {
    key: 'wx-channels-event',
    title: '打开视频号-活动',
    handler: config => {
      Taro.openChannelsEvent(config)
    }
  },
  'wx-channels-live': {
    key: 'wx-channels-live',
    title: '打开视频号-直播',
    handler: config => {
      Taro.openChannelsLive(config)
    }
  }
}
