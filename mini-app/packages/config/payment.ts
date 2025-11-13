/* -------------------------------- 此文件前后台通用 -------------------------------- */

export enum PaymentScene {
  /** 小程序支付 */
  Weapp = 0,
  /** 收银台 */
  Cashier = 1
}

/** 支付场景 */
export const PAYMENT_SCENE_OPTIONS = [
  { label: '微信小程序', value: PaymentScene.Weapp },
  { label: '收银台', value: PaymentScene.Cashier }
]

/** 副支付方式 */
export enum SubPaymentMethod {
  /** 微信支付 */
  WechatPay = 0,
  /** 支付宝 */
  AliPay = 1,
  /** 云闪付 */
  UnionPay = 2,
  /** 现金 */
  Cash = 3,
  /** 付款码支付 */
  MerchantScan = 4,
  /** 用户扫码 */
  UserScan = 5
}

export const SUB_PAYMENT_OPTIONS = [
  {
    label: '微信支付',
    value: SubPaymentMethod.WechatPay,
    icon: 'https://dev-cdn.null.cn/upload/58c13670c547b48c29726594028284bb.svg',
    payScene: PaymentScene.Weapp
  },
  {
    label: '支付宝',
    value: SubPaymentMethod.AliPay,
    icon: 'https://dev-cdn.null.cn/upload/aba4797bfdfece6a941979370e703f31.svg'
  },
  {
    label: '云闪付',
    value: SubPaymentMethod.UnionPay,
    icon: 'https://cdn.null.cn/upload/3fe3c51a6e0355f60164cfd6ac24d71e.svg'
  },
  {
    label: '现金',
    value: SubPaymentMethod.Cash,
    icon: 'https://cdn.null.cn/upload/0f87d24338d69f30e1b5ba628ae4b19d.svg',
    payScene: PaymentScene.Cashier
  },
  {
    label: '商户扫码',
    value: SubPaymentMethod.MerchantScan,
    icon: 'https://dev-cdn.null.cn/upload/a00b079d39a083f0d598e12e3e5554e0.svg'
  },
  {
    label: '用户扫码',
    value: SubPaymentMethod.UserScan,
    icon: 'https://dev-cdn.null.cn/upload/0dd4d0f0e09b3467da0b6d36e837c890.svg'
  }
]

export enum PaymentChannel {
  /** 微信支付直连商户 */
  WechatPay = 0,
  /** 微信支付收付通二级商户 */
  WechatPaySubMerchant = 1,
  /** 通联直连商户 */
  AllinPay = 2,
  /** 店小银直连商户 */
  Mypays = 3,
  /** 通联收付通二级商户 */
  AllinPaySubMerchant = 4
}

export const PAYMENT_CHANNEL_OPTIONS = [
  {
    label: '微信支付直连商户',
    value: PaymentChannel.WechatPay,
    icon: 'https://dev-cdn.null.cn/upload/58c13670c547b48c29726594028284bb.svg',
    capabilities: [
      {
        label: '小程序支付',
        subPaymentMethod: SubPaymentMethod.WechatPay,
        payScene: PaymentScene.Weapp
      },
      {
        label: 'Native 支付',
        subPaymentMethod: SubPaymentMethod.UserScan,
        payScene: PaymentScene.Cashier
      },
      {
        label: '付款码支付',
        subPaymentMethod: SubPaymentMethod.MerchantScan,
        payScene: PaymentScene.Cashier
      }
    ]
  },
  {
    label: '微信支付收付通二级商户',
    value: PaymentChannel.WechatPaySubMerchant,
    icon: 'https://dev-cdn.null.cn/upload/58c13670c547b48c29726594028284bb.svg',
    capabilities: [
      {
        label: '小程序支付',
        subPaymentMethod: SubPaymentMethod.WechatPay,
        payScene: PaymentScene.Weapp
      },
      {
        label: 'App 支付'
      },
      {
        label: 'Native 支付',
        subPaymentMethod: SubPaymentMethod.UserScan,
        payScene: PaymentScene.Cashier
      },
      {
        label: '付款码支付',
        subPaymentMethod: SubPaymentMethod.MerchantScan,
        payScene: PaymentScene.Cashier
      }
    ]
  },
  {
    label: '通联直连商户',
    value: PaymentChannel.AllinPay,
    icon: 'https://cdn.null.cn/upload/b89500703125fdf8b99b964feb406621.svg',
    capabilities: [
      {
        label: '云微支付',
        subPaymentMethod: SubPaymentMethod.UnionPay,
        payScene: PaymentScene.Weapp
      },
      {
        label: '统一支付',
        subPaymentMethod: SubPaymentMethod.WechatPay,
        payScene: PaymentScene.Weapp
      },
      {
        label: '统一被扫',
        subPaymentMethod: SubPaymentMethod.MerchantScan,
        payScene: PaymentScene.Cashier
      },
      {
        label: '统一主扫',
        subPaymentMethod: SubPaymentMethod.UserScan,
        payScene: PaymentScene.Cashier
      }
    ]
  },
  {
    label: '通联收付通二级商户',
    value: PaymentChannel.AllinPaySubMerchant,
    icon: 'https://cdn.null.cn/upload/b89500703125fdf8b99b964feb406621.svg',
    capabilities: [
      {
        label: '云微支付',
        subPaymentMethod: SubPaymentMethod.UnionPay,
        payScene: PaymentScene.Weapp
      },
      {
        label: '统一支付',
        subPaymentMethod: SubPaymentMethod.WechatPay,
        payScene: PaymentScene.Weapp
      },
      {
        label: '统一被扫',
        subPaymentMethod: SubPaymentMethod.MerchantScan,
        payScene: PaymentScene.Cashier
      },
      {
        label: '统一主扫',
        subPaymentMethod: SubPaymentMethod.UserScan,
        payScene: PaymentScene.Cashier
      }
    ]
  },
  {
    label: '店小银直连商户',
    value: PaymentChannel.Mypays,
    icon: 'https://cdn.null.cn/upload/c559ad65f4253fc05c2dafffcb7f7ceb.svg',
    capabilities: [
      {
        label: '聚合JSAPI',
        subPaymentMethod: SubPaymentMethod.WechatPay,
        payScene: PaymentScene.Weapp
      },
      {
        label: '聚合MICRO',
        subPaymentMethod: SubPaymentMethod.MerchantScan,
        payScene: PaymentScene.Cashier
      },
      {
        label: '聚合Native',
        subPaymentMethod: SubPaymentMethod.UserScan,
        payScene: PaymentScene.Cashier
      }
    ]
  }
]

/** 统一支付方式 (⊙_⊙)? */
export enum UnifiedPayMethod {
  /** 微信支付 */
  WechatPay = 0,
  /** 用户余额 */
  Balance = 1,
  /** 储值卡 */
  ValueCard = 2,
  /** 支付宝 */
  AliPay = 3,
  /** 云闪付 */
  UnionPay = 4,
  /** 现金 */
  Cash = 5,
  /** 商户扫码 */
  MerchantScan = 6,
  /** 用户扫码 */
  UserScan = 7
}

/** 统一支付记录渠道类型：这个是前端定义的，用来判断是主支付方式还是副支付方式 */
export enum UnifiedPayRecordMethodType {
  MainPaymentMethod = 0,
  SubPaymentMethod = 1
}

/** 统一支付方式选项 (⊙_⊙)? */
export const UNIFIED_PAYMENT_OPTIONS = [
  {
    label: '微信支付',
    value: UnifiedPayMethod.WechatPay,
    type: UnifiedPayRecordMethodType.SubPaymentMethod
  },
  {
    label: '用户余额',
    value: UnifiedPayMethod.Balance,
    type: UnifiedPayRecordMethodType.MainPaymentMethod
  },
  {
    label: '储值卡',
    value: UnifiedPayMethod.ValueCard,
    type: UnifiedPayRecordMethodType.MainPaymentMethod
  },
  {
    label: '支付宝',
    value: UnifiedPayMethod.AliPay,
    type: UnifiedPayRecordMethodType.SubPaymentMethod
  },
  {
    label: '云闪付',
    value: UnifiedPayMethod.UnionPay,
    type: UnifiedPayRecordMethodType.SubPaymentMethod
  },
  {
    label: '现金',
    value: UnifiedPayMethod.Cash,
    type: UnifiedPayRecordMethodType.SubPaymentMethod
  },
  {
    label: '商户扫码',
    value: UnifiedPayMethod.MerchantScan,
    type: UnifiedPayRecordMethodType.SubPaymentMethod
  },
  {
    label: '用户扫码',
    value: UnifiedPayMethod.UserScan,
    type: UnifiedPayRecordMethodType.SubPaymentMethod
  }
]
