import { Button, Image } from '@tarojs/components'
import useModal from '../useModal'
import './style.scss'
import { renderAnyNode } from '@pkg/utils'
import Taro from '@tarojs/taro'
import useResponseMessage from '../useResponseMessage'
import { useLoading, useLoadingEnd } from '../useLoading'
import { $bindWechat } from '../../api'
import { useAppStore, useUserStore } from '../../stores'

interface IWechatBindOptions {
  desc?: any
}

export const useWechatBind = async (options?: IWechatBindOptions) => {
  // 非微信小程序平台？怎么处理呢
  if (process.env.TARO_ENV !== 'weapp') {
    return Promise.resolve()
  }

  const userStore = useUserStore()

  if (userStore.isWechatBind) {
    return Promise.resolve()
  }

  await userStore.checkIsWechatBind()

  if (userStore.isWechatBind) {
    return Promise.resolve()
  }

  return new Promise((resolve, reject) => {
    const onBind = () => {
      useLoading()
      Taro.login({
        success: res => {
          bind(res.code)
        },
        fail: err => {
          useLoadingEnd()
          useResponseMessage(err)
          reject(err)
          console.log('绑定微信账户错误3：', err)
        }
      })
    }

    const bind = (code: string) => {
      $bindWechat(useAppStore().appId!, code)
        .then(res => {
          userStore
            .checkIsWechatBind()
            .then(eee => {
              useResponseMessage(eee || res)
            })
            .catch(catchE => {
              useResponseMessage(catchE || res)
            })
            .finally(() => {
              if (userStore.isWechatBind) {
                resolve(res)
                close()
              } else {
                console.log('绑定微信账户错误2：', res)
                reject(res)
              }
            })
        })
        .catch(err => {
          console.log('绑定微信账户错误1：', err)
          useResponseMessage(err)
          reject(err)
        })
        .finally(() => {
          useLoadingEnd()
        })
    }

    const close = () => {
      modal.close()
    }

    const cancel = () => {
      close()
      reject(new Error('用户取消'))
    }

    const modal = useModal({
      title: '绑定微信',
      height: 'auto',
      content: () => {
        return (
          <div class="bind-wechat-modal">
            <Image class="logo" src="https://cdn.anteng.cn/upload/20240903/30953b7dbfe2a77dbd004a5b510577da.svg"></Image>
            <div class="desc">
              {renderAnyNode(options?.desc) || (
                <>
                  <div>尚未绑定微信账号</div>
                  <div>无法提供订单支付、消息通知等功能</div>
                </>
              )}
            </div>
            <div class="bind" onClick={onBind}>
              <span>立即绑定</span>
              <Button class="bind-button"></Button>
            </div>
            <div class="cancel" onClick={cancel}>
              暂不绑定
            </div>
          </div>
        )
      }
    })
  })
}

export const withWechatBind = <T extends (...args: any[]) => any>(handler: T, options?: IWechatBindOptions) => {
  return (...args: Parameters<T>): Promise<ReturnType<T>> => {
    return new Promise((resolve, reject) => {
      useWechatBind(options)
        .then(() => {
          try {
            const result = handler(...args)
            if (result instanceof Promise) {
              result.then(resolve).catch(reject)
            } else {
              resolve(result)
            }
          } catch (err) {
            reject(err)
          }
        })
        .catch(error => {
          // 在这里可以处理登录检查失败的情况
          reject(error)
        })
    })
  }
}
