# 平台兼容

## createSelectQuery 节点查询异常

参考示例：packages/ui/src/components/scroll-tab/index.tsx

小程序端中`跨组件`最多支持 16 层节点查询，如果超过将导致无法正确获得节点信息

[微信小程序文档](https://developers.weixin.qq.com/miniprogram/dev/api/wxml/wx.createSelectorQuery.html)， [Taro文档](https://docs.taro.zone/docs/ref/#%E5%B5%8C%E5%A5%97%E5%B1%82%E7%BA%A7%E8%B6%85%E8%BF%87-baselevel-%E6%97%B6)

```ts
const id = `id-${uuid()}`
const query = Taro.createSelectorQuery()

if (process.env.TARO_ENV === 'h5') {
  query.selectAll(`.${id} .ice-scroll-tab__item`).boundingClientRect()
} else {
  // 小程序端 跨组件需要加 >>> 选择器
  query.selectAll(`.${id} >>> .ice-scroll-tab__item`).boundingClientRect()
}
```
