import { RequestPagination } from '@pkg/core'
import request from '../request'
import type { IGoodsDetail, IGoodsShowRule } from './types'
import { GoodsListByRule } from './types'
import dayjs from 'dayjs'
import {
  COMMON_STATUS_ON,
  GOODS_ON_SALE_MODE_TIMING,
  GOODS_TYPE_ENTITY,
  GOODS_USABLE_TIME_RANGE,
  GOODS_VALID_TIME_RANGE
} from '../../constants'
import { buildImgUrl } from '../../utils'

/** 获取商品详情（本地 mock：基于页面使用字段生成） */
export const getGoodsDetail = (id: string) => {
  // 构建售卖与可购时间（确保页面状态为“在售且今日可购买”）
  const now = dayjs()
  const onsaleStartAt = now.subtract(1, 'day').format('YYYY-MM-DD HH:mm:ss')
  const onsaleEndAt = now.add(7, 'day').format('YYYY-MM-DD HH:mm:ss')
  const buyStartAt = now.startOf('day').add(8, 'hour').format('YYYY-MM-DD HH:mm:ss')
  const buyEndAt = now.startOf('day').add(22, 'hour').format('YYYY-MM-DD HH:mm:ss')

  // 图片地址兜底：环境未配置或外链不可达时，使用内联占位图
  const ensureImg = (n: number) => {
    // 始终使用本地内联占位图，避免外部请求被拦截或 400
    const svg = encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='800'>\n` +
      `<rect width='100%' height='100%' fill='#f2f2f2'/>\n` +
      `<text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#999' font-size='42'>商品主图 ${n}</text>\n` +
      `</svg>`
    )
    return `data:image/svg+xml;charset=utf-8,${svg}`
  }

  // 规格与 SKU 组合
  const colors = [
    { id: 'c_red', name: '红色', image: ensureImg(1) },
    { id: 'c_blue', name: '蓝色', image: ensureImg(2) },
    { id: 'c_green', name: '绿色', image: ensureImg(3) }
  ]
  const sizes = [
    { id: 's_s', name: 'S' },
    { id: 's_m', name: 'M' }
  ]

  const makeSkuId = (cId: string, sId: string) => `${id}-${cId}-${sId}`
  const goodsSkus = colors.flatMap((c, ci) =>
    sizes.map((s, si) => {
      const skuId = makeSkuId(c.id, s.id)
      const base = 19.9 + ci * 5 + si * 3
      return {
        id: skuId,
        goodsId: id,
        specCode: `${c.id},${s.id}`,
        underlinePrice: Number((base + 10).toFixed(2)),
        price: Number(base.toFixed(2)),
        cost: Number((base - 5).toFixed(2)),
        stock: 50 - ci * 10 - si * 5,
        weight: 500,
        sort: ci * 10 + si,
        path: `${c.id},${s.id}`,
        specs: [
          { k: '颜色', kId: 'spec-color', v: c.name, vId: c.id, image: c.image },
          { k: '尺码', kId: 'spec-size', v: s.name, vId: s.id }
        ]
      }
    })
  )

  // 基础属性（用于“参数”弹窗）
  const basicDescAttributeJson = {
    properties: [
      { id: 'brand', name: '品牌' },
      { id: 'material', name: '材质' },
      { id: 'origin', name: '产地' },
      { id: 'package', name: '包装规格' }
    ],
    values: {
      id_brand: '言松精选',
      id_material: ['纯棉', '环保面料'],
      id_origin: '中国·福建',
      id_package: '1 件/包'
    }
  }

  // 发货地（用于“发货”）
  const freightTemplate = {
    basicFee: 0,
    freeDistrict: [],
    id: 'ft-001',
    name: '全国包邮',
    shippingDistrict: [
      { code: '350000', value: '福建省' },
      { code: '350200', value: '厦门市' }
    ],
    type: 1
  }

  // 限售区域（供“销售区域限制提示”使用）
  const restrictedArea = [
    ['350000', '350200', '350213'], // 福建 厦门 翔安区
    ['310000', '310100'] // 上海 市辖区
  ]

  const data: IGoodsDetail = {
    // 基础展示
    id,
    title: `精选家居好物·${id}`,
    // 填充随机长度的数组
    coverImages: Array.from({ length: 10 }).map(() => buildImgUrl()),
    soldNum: 1287,
    shareTitle: '良品上新，限时优惠',
    shareSubtitle: '家居好物，舒适生活',
    shareImage: ensureImg(15),

    // 售卖与购买时间
    onsaleMode: GOODS_ON_SALE_MODE_TIMING,
    onsaleStartAt,
    onsaleEndAt,
    buyStartAt,
    buyEndAt,

    // 购买/限购
    limitBy: 0,
    limitMode: 1,
    limitNumMin: 1,
    limitNumMax: 5,

    // 商品类型与状态
    type: GOODS_TYPE_ENTITY,
    status: COMMON_STATUS_ON,

    // 规格与 SKU
    goodsSkus,

    // 可用/不可用时间与有效期
    availableDate: GOODS_USABLE_TIME_RANGE,
    availableDateStartAt: '09:00',
    availableDateEndAt: '22:00',
    availableTimes: 0,
    expireType: GOODS_VALID_TIME_RANGE,
    expireStartAt: now.format('YYYY-MM-DD'),
    expireEndAt: now.add(365, 'day').format('YYYY-MM-DD'),
    expireDays: 0,
    expireProcess: 0,

    unavailableDate: COMMON_STATUS_ON,
    unavailableDateWeekday: [7],
    unavailableDateHoliday: COMMON_STATUS_ON,
    unavailableDateRange: COMMON_STATUS_ON,
    unavailableDateStartAt: now.add(30, 'day').format('YYYY-MM-DD'),
    unavailableDateEndAt: now.add(37, 'day').format('YYYY-MM-DD'),

    // 物流与参数
    freightTemplate,
    basicDescAttributeIds: {},
    basicDescAttributeJson,

    // 其他必需字段占位
    aheadDays: 0,
    allowShare: 1,
    brandId: 0,
    canRefund: 1,
    categoryIds: [],
    code: `CODE-${id}`,
    detail: '<p>这是一段用于占位的商品详情富文本。</p>',
    feeList: {},
    groupId: 0,
    mustKnow: '请以页面显示为准',
    needAhead: 0,
    needIdcard: 0,
    needName: 0,
    needReservation: 0,
    onsaleNow: 1,
    otherDescAttributeIds: {},
    otherDescAttributeJson: {},
    posters: {},
    posterType: 0,
    qrcodeSource: 0,
    qrcodeType: 0,
    refundAudit: 0,
    refundMode: 0,
    reservationAddress: '',
    saleUnit: '件',
    sort: 0,
    specAttributeId: 0,
    stores: [],
    storeType: 0,
    storeNum: 0,
    verificationTips: '请在有效期内使用',
    supplierId: 'supplier-001',
    // 销售区域限制相关：默认不限制，且仅所选区域可下单（与页面提示逻辑兼容）
    restrictedStatus: 0,
    restrictedType: 0,
    restrictedArea
  }

  return Promise.resolve({
    code: 200,
    success: true,
    data,
    msg: 'ok'
  })
}

/** 获取商品显示规则 */
export const requestGetGoodsShowRule = () => {
  // 本地拦截：返回默认展示规则，避免发起远程请求
  return Promise.resolve({
    code: 200,
    success: true,
    msg: 'ok',
    data: {
      createTime: '',
      createUser: 'mock',
      dashPrice: 1,
      dashPriceText: '参考价',
      id: 'mock-rule',
      merchantId: 'mock-merchant',
      sellingPrice: 1,
      sellingPriceText: '活动价',
      tenantId: 'mock-tenant',
      updateTime: '',
      updateUser: 'mock'
    } as IGoodsShowRule
  })
}

/**
 * 获取商品推荐规则详情
 */
export const requestGetGoodsRecommendRule = () => {
  // 本地拦截：返回默认推荐规则
  return Promise.resolve({
    code: 200,
    success: true,
    msg: 'ok',
    data: {
      commodityDetail: 1,
      shoppingPage: 1,
      payPage: 1
    }
  })
}

/**
 * 通过不同规则获取商品列表
 */
export const requestGetGoodsListByRule = (params: RequestPagination<GoodsListByRule>) => {
  // 本地拦截：返回推荐商品列表，避免远程请求
  const list = Array.from({ length: 20 }).map((_, i) => {
    const id = `rec-${i + 1}`
    const base = 29.9 + (i % 5) * 3
    return {
      id,
      title: `推荐好物 ${i + 1}`,
      coverImages: [
        buildImgUrl(),
        buildImgUrl(),
        buildImgUrl()
      ],
      priceMin: Number(base.toFixed(2)),
      priceMax: Number((base + 20).toFixed(2)),
      underlinePrice: Number((base + 30).toFixed(2))
    }
  })

  return Promise.resolve({
    code: 200,
    success: true,
    msg: 'ok',
    data: {
      current: params.current ?? 1,
      size: params.size ?? 10,
      total: list.length,
      records: list
    }
  })
}

/** 获取供应商客服消息 */
export const $getGoodsSupplierContactInfo = (supplierId: string) => {
  return request({
    url: `/anteng-cornerstone-goods-wap/m/goods/service/${supplierId}`
  })
}
