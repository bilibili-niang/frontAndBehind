# withScope

给事件名称添加页面作用域，该方法适用于全局事件，避免所有页面接收相同的处理事件

```ts
// 将得到类似结果 /packageIndex/index/1706242277195/login
cosnt eventName = withScope('login')
emitter.emit(eventName)
```
