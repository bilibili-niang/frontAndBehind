// Mock user-related APIs for build-time usage
// Keep shapes minimal to satisfy store and views usage.

import { $fake } from '../fake'
import request from '../request'

export interface IUserInfo {
  id: string;
  avatar: string;
  nickname: string;
  phone?: string;
}

export interface IUserProfileSettingsItem {
  key: string; // e.g., "name", "avatar"
  sort: number;
  required?: boolean;
}

export interface IUserProfileSettingsConfig {
  status: boolean;
  content: IUserProfileSettingsItem[];
}

export interface ResponseData<T> {
  code: number;
  success: boolean;
  data: T;
  msg?: string;
}

// 获取用户资料（例如完善资料的内容）
export async function $getUserProfile(param: any) {
  return request({
    url: '/getUserProfile',
    method: 'get',
    params: param
  })
}

// 获取资料设置配置（控制哪些字段需要填写等）
export async function $getUserProfileSettingsConfig(): Promise<
  ResponseData<IUserProfileSettingsConfig>
> {
  return {
    code: 200,
    success: true,
    data: {
      status: true,
      content: [
        { key: 'name', sort: 1, required: true },
        { key: 'avatar', sort: 2, required: false },
        { key: 'phone', sort: 3, required: false },
      ],
    },
    msg: 'ok',
  }
}

export default $fake