import { BasePage, useLoading, useLoadingEnd, useToast } from '@anteng/core'
import { defineComponent } from 'vue'
import './style.scss'
import { Button } from '@tarojs/components'

definePageConfig({
  navigationStyle: 'custom'
})

export default defineComponent({
  name: '',
  setup() {
    return () => {
      return (
        <BasePage class="demo-page" navigator={{ title: 'Demo' }}>
          <Button
            onClick={() => {
              useLoading()
              setTimeout(() => {
                useLoadingEnd()
              }, 2000)
            }}
          >
            普通 Loading
          </Button>
          <Button
            onClick={() => {
              useLoading({
                maskVisible: true,
                toastVisible: false
              })
              setTimeout(() => {
                useLoadingEnd()
              }, 2000)
            }}
          >
            遮罩 Loading
          </Button>
          <Button
            onClick={() => {
              useLoading({
                toastVisible: false
              })
              setTimeout(() => {
                useLoadingEnd()
              }, 2000)
            }}
          >
            空白 Loading
          </Button>
          <Button
            onClick={() => {
              useLoading({
                text: '加急查询中...'
              })
              setTimeout(() => {
                useLoadingEnd()
              }, 2000)
            }}
          >
            自定义文字
          </Button>
          <Button
            onClick={() => {
              useLoading({
                timeout: 3000
              })
            }}
          >
            3秒超时
          </Button>
          <Button
            onClick={() => {
              useLoading({ toastVisible: true })
              useToast('This message will contain a incomprehensibilities long word.')
            }}
          >
            Loading Toast 不再冲突
          </Button>
          <Button
            onClick={() => {
              useLoading({ toastVisible: true })
              useToast('叮')
            }}
          >
            很短 Toast
          </Button>
          <Button
            onClick={() => {
              useToast('短信发送成功，请查收！联系客服咨询。')
            }}
          >
            多行 Toast
          </Button>
        </BasePage>
      )
    }
  }
})
