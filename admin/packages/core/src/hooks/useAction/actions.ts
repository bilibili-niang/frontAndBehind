import type { ActionDefine } from './utils'

import weapp from './actions/weapp'
import copy from './actions/copy'
import h5 from './actions/h5'

import { type Schema } from '@anteng/jsf'
import { ref } from 'vue'
import wxChannelsActivity from './actions/wx-channels-activity'
import wxChannelsProfile from './actions/wx-channels-profile'
import wxChannelsEvent from './actions/wx-channels-event'
import wxChannelsLive from './actions/wx-channels-live'
import { cloneDeep } from 'lodash'
import contact from './actions/contact'
import jd from './actions/jd'
import imageModal from './actions/image-modal'
import { openShop } from './actions/cashier'
import SurveyDetail from './actions/surveyDetail'
import SurveyList from './actions/surveyList'

export const commonActions = ref<ActionDefine[]>([])

export const businessActions = ref<ActionDefine[]>([])

export const registerActions = (type: 'common' | 'business' | 'link' | 'interaction', actions: ActionDefine[]) => {
  const list = {
    common: commonActions,
    business: businessActions,
    link: linkActions,
    interaction: interactionActions
  }[type]
  actions.forEach((action) => {
    if (list.value.find((item) => item.key === action.key)) {
      console.error(`重复定义action：${action.key}，已忽略`)
      return void 0
    }
    list.value.push(action)
  })
}

export const linkActions = ref<ActionDefine[]>([
  h5,
  weapp,
  jd,
  openShop
  // { key: 'weoa', title: '打开公众号', schema: { type: 'object' } }
])

export const interactionActions = ref<ActionDefine[]>([
  // { key: 'toast', title: '提醒', schema: { type: 'object' } },
  imageModal,
  contact,
  copy,
  {
    key: 'call',
    title: '拨打电话',
    icon: 'phone-call',
    schema: {
      title: '拨打电话',
      type: 'object',
      properties: {
        phoneNumber: {
          type: 'string',
          title: '手机号码',
          config: {
            placeholder: '请输入手机号码'
          }
          // 校验手机号
          // validator: 'phone'
        }
      }
    },
    default: {
      phoneNumber: ''
    }
  },
  // { key: 'popup', title: '弹窗', schema: { type: 'object' } },
  { key: 'menu', title: '快捷菜单' },
  wxChannelsActivity,
  wxChannelsProfile,
  wxChannelsEvent,
  wxChannelsLive,
  SurveyDetail,
  SurveyList
])

const preConditionSchemas: Record<string, Schema> = {}

export const preConditionSchema: Schema = {
  title: '前置条件',
  type: 'object',
  properties: {
    isLogin: {
      title: '校验登录',
      type: 'object',
      widget: 'suite',
      enableKey: 'enable',
      enableKeyAsProperty: true,
      properties: {
        message: {
          title: '提示语',
          type: 'string',
          config: {
            placeholder: '选填，默认不提示'
          }
        },
        handler: {
          title: '未登录处理',
          type: 'string',
          widget: 'select',
          config: {
            options: [
              { label: '无操作', value: 'none' },
              { label: '弹出/跳转登录页面', value: 'login' }
            ]
          }
        }
      }
    },
    ...preConditionSchemas
  }
}

export const preConditionDefault: Record<string, any> = {
  isLogin: {
    enable: false,
    message: '',
    handler: 'login'
  }
}

/** 注册前置条件 */
export const registerPreCondition = (key: string, schema: Schema) => {
  if (schema.default) {
    preConditionDefault[key] = cloneDeep(schema.default)
  }
  preConditionSchemas[key] = schema
  Object.assign(preConditionSchema.properties!, preConditionSchemas)
}
