// Mock user-aggregation APIs (wechat binding, profile update)

export interface ResponseData<T> {
  code: number;
  success: boolean;
  data: T;
  msg?: string;
}

// 获取微信 OpenId（或绑定状态）
export async function $getWechatOpenId(appId?: string): Promise<ResponseData<string | null>> {
  // 未绑定则返回 null；已绑定可返回一个 mock 值
  return {
    code: 200,
    success: true,
    data: null,
    msg: appId ? `mock-openid-for-${appId}` : "ok",
  };
}

// 更新用户资料（昵称、头像等）
export async function requestUpdateUserProfile(
  payload: Partial<{ nickname: string; avatar: string; phone: string }>
): Promise<ResponseData<{}>> {
  // 直接返回成功，具体合并逻辑由 store 端处理
  return {
    code: 200,
    success: true,
    data: {},
    msg: "ok",
  };
}