import useAppStore from '../stores/app'
import request, { type RequestPagination } from './request'

/** 获取用户资料配置 */
export const $getUserProfileSettings = () => {
  return request({
    url: '/null-cornerstone-system/userInfoSetting',
    method: 'get',
    params: {
      scene: useAppStore().scene
    }
  })
}

/** 初始化用户资料配置 */
export const $initUserProfileSettings = (initialData: any[] = []) => {
  return request({
    url: '/null-cornerstone-system/userInfoSetting',
    method: 'post',
    data: {
      scene: useAppStore().scene,
      content: initialData
    }
  })
}

/** 更新用户资料配置 */
export const $updateUserProfileSettings = (id: string, data: { status: number; content: any[] }) => {
  return request({
    url: `/null-cornerstone-system/userInfoSetting/${id}`,
    method: 'put',
    data: {
      scene: useAppStore().scene,
      ...data
    }
  })
}

/** 删除用户人脸信息 */
export const $deleteUserProfileFaceImage = (id: string) => {
  return request({
    url: `/null-cornerstone-system/userInfo/${id}/deleteFace`,
    method: 'PUT'
  })
}

/** 获取用户资料列表（已登录过的用户） */
export const $getUserProfileList = (params: RequestPagination) => {
  return request({
    // url: '/null-cornerstone-system/userInfo',
    url: '/null-cornerstone-system/userInfo/list',
    params: {
      scene: useAppStore().scene,
      ...params
    }
  })
}

/** 获取用户列表 */
export const $getUserList = (params: RequestPagination) => {
  return request({
    url: '/null-cornerstone-system/user',
    params: {
      // scene: useAppStore().scene,
      ...params
    }
  })
}

/** 创建用户信息 */
export const $createUserProfile = (
  phone: string,
  profile: {
    name: string
    [key: string]: any
  }
) => {
  return request({
    url: '/null-cornerstone-system/userInfo/add',
    method: 'POST',
    data: {
      phone,
      scene: useAppStore().scene,
      infoContent: profile
    }
  })
}

/** 编辑用户信息 */
export const $updateUserProfile = (
  id: string,
  // userId: string,
  profile: {
    name: string
    [key: string]: any
  }
) => {
  return request({
    url: `/null-cornerstone-system/userInfo/${id}`,
    method: 'put',
    data: {
      scene: useAppStore().scene,
      // userId: userId,
      infoContent: profile
    }
  })
}

/** 删除用户资料 */
export const $deleteUserProfile = (id: string) => {
  return request({
    url: `/null-cornerstone-system/userInfo/${id}`,
    method: 'DELETE',
    data: {
      scene: useAppStore().scene
    }
  })
}
