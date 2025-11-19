// Core generic API mocks used across apps and core setup.

export interface ResponseData<T> {
  code: number;
  success: boolean;
  data: T;
  msg?: string;
}

export interface ResponsePaginationData<T> {
  code: number;
  success: boolean;
  data: {
    list: T[];
    total: number;
  };
  msg?: string;
}

// 获取商户 ID
export async function $getMerchantId(appId?: string): Promise<ResponseData<string>> {
  return {
    code: 200,
    success: true,
    data: "1717732945099657218",
    msg: appId ? `mock-merchant-for-${appId}` : "ok",
  };
}

// OCR 资质识别（占位）
export async function $OCR_License(): Promise<ResponseData<{ result: string }>> {
  return {
    code: 200,
    success: true,
    data: { result: "mock" },
    msg: "ok",
  };
}

// 行业数据与工具
export type IndustryItem = { id: string; name: string; parentId?: string };

export const standardIndustryData: IndustryItem[] = [
  { id: "100", name: "零售" },
  { id: "200", name: "餐饮" },
  { id: "300", name: "服务业" },
];

export async function $getIndustry(): Promise<ResponseData<IndustryItem[]>> {
  return { code: 200, success: true, data: standardIndustryData, msg: "ok" };
}

export function getIndustryName(id: string): string | undefined {
  return standardIndustryData.find((x) => x.id === id)?.name;
}

// 业务字典（用于 useBizDict）
export type BizDictItem = {
  id: string;
  dictKey: string;
  dictValue: string;
};

export async function $getBizDict(
  params?: Partial<{ dictCode: string }>
): Promise<ResponsePaginationData<BizDictItem>> {
  const code = params?.dictCode ?? "mock";
  const list: BizDictItem[] = [
    { id: `${code}-1`, dictKey: "1", dictValue: "选项一" },
    { id: `${code}-2`, dictKey: "2", dictValue: "选项二" },
  ];
  return {
    code: 200,
    success: true,
    data: { list, total: list.length },
    msg: "ok",
  };
}

// 微信 JSSDK 配置（用于 setup）
export async function $getWechatJsSDKConfig(): Promise<
  ResponseData<{ appId: string; timestamp: number; nonceStr: string; signature: string }>
> {
  return {
    code: 200,
    success: true,
    data: {
      appId: "wx-mock-appid",
      timestamp: Math.floor(Date.now() / 1000),
      nonceStr: "mock-nonce",
      signature: "mock-signature",
    },
    msg: "ok",
  };
}

export * from './fake'
// 真实登录相关 API（与假数据共存，但在具体调用处应使用真实实现）
export { wxAuthLogin, wxBind, loginWithToken } from './real/auth'