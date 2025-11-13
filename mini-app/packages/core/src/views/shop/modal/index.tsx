import { useCrud } from '../../../../lib'

const { onCreate, onUpdate } = useCrud({
  title: '门店管理',
  defaultValue() {
    return {
      name: '',
      status: 1,
      addressInfo: { name: '', address: '', city: '', longitude: (null as unknown as number), latitude: (null as unknown as number) },
      openingAt: '08:00:00',
      closingAt: '18:00:00',
      contactInfo: [ { contactName: '', contactPhone: '' } ]
    }
  },
  // 将表单数据格式化为后端所需字段
  format: (data: any) => {
    const a = data.addressInfo
    return {
      name: data.name,
      status: data.status,
      openingAt: data.openingAt,
      closingAt: data.closingAt,
      contactInfo: data.contactInfo,
      // 映射地址选择器到后端字段
      region: a?.city ?? '',
      address: a?.address ?? '',
      // 后端 longitude/latitude 也按字符串接收，保持一致
      longitude: a?.longitude != null ? String(a?.longitude) : '',
      latitude: a?.latitude != null ? String(a?.latitude) : '',
      // 后端校验 location.lng/lat 为字符串类型（见 500 invalid_type）
      // 为避免 undefined 被字符串化，只有在经纬度存在时才传递 location
      location:
        a && a.longitude != null && a.latitude != null
          ? { lng: String(a.longitude), lat: String(a.latitude) }
          : undefined
    }
  },
  // 编辑时将已有后端数据回填到地址选择器
  retrieve: (value: any) => {
    const lng = Number(value?.longitude)
    const lat = Number(value?.latitude)
    const hasCoord = !Number.isNaN(lng) && !Number.isNaN(lat) && lng && lat
    return {
      ...value,
      addressInfo: hasCoord
        ? { name: value?.name ?? '', address: value?.address ?? '', city: value?.region ?? '', longitude: lng, latitude: lat }
        : { name: '', address: value?.address ?? '', city: value?.region ?? '', longitude: (null as unknown as number), latitude: (null as unknown as number) }
    }
  },
  schema: () => ({
    type: 'object',
    properties: {
      name: {
        title: '门店名称',
        type: 'string',
        required: true,
        config: { placeholder: '请输入门店名称' }
      },
      status: {
        title: '状态',
        type: 'boolean',
        required: true,
        widget: 'switch',
        config: { numberMode: true }
      },
      addressInfo: {
        title: '地址',
        type: 'object',
        required: true,
        widget: 'address-selector',
        config: { placeholder: '请选择地址', withLocation: true }
      },
      openingAt: {
        title: '开门时间',
        type: 'string',
        config: { placeholder: '例如 08:00:00' }
      },
      closingAt: {
        title: '关门时间',
        type: 'string',
        config: { placeholder: '例如 18:00:00' }
      },
      contactInfo: {
        title: '联系人信息',
        type: 'array',
        items: {
          type: 'object',
          properties: {
            contactName: { title: '联系人', type: 'string' },
            contactPhone: { title: '联系电话', type: 'string' }
          }
        }
      }
    }
  })
})

export { onCreate, onUpdate }