import { defineComponent, onMounted } from 'vue'
import { Alert, Button } from '@anteng/ui'
import './style.scss'
import { RouterView, useRoute, useRouter } from 'vue-router'
import { PageView } from '../../../router'

export default defineComponent({
  name: 'WeappSign',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const toWeappBind = () => {
      router.push({
        name: 'store-channel-weapp-bind'
      })
    }
    const toWeappTrial = () => {
      router.push({
        name: 'store-channel-weapp-trial'
      })
    }

    const toWeappOA = () => {
      router.push({
        name: 'store-channel-weapp-oa'
      })
    }
    const toWeappCreate = () => {
      router.push({
        name: 'store-channel-weapp-create'
      })
    }

    onMounted(() => {
      // getWeappInfo()
    })

    return () => {
      if (route.name !== 'store-channel-weapp-sign') {
        return <RouterView class="store-channel-create" />
      }
      return (
        <PageView class="store-channel-create">
          <Alert
            style="border-radius: 4px; margin-bottom:16px;"
            message="请根据您的实际情况，从下列注册场景中选择一个发布小程序"
            type="info"
            show-icon
          />
          {/* -------------------------------- 授权绑定小程序 ------------------------------- */}
          <section class="weapp-sign-section">
            <h3>（1）若您已有小程序，请直接「授权绑定小程序」</h3>
            <p>若您的小程序曾经授权其他第三方平台，可能会使得本平台无法获取部分互斥权限集的权限。</p>
            <Button type="primary" onClick={toWeappBind}>
              授权绑定
            </Button>
          </section>
          {/* -------------------------------- 创建试用小程序 ------------------------------- */}
          <section class="weapp-sign-section">
            <h3>（2）若您不想准备资料注册小程序，可以「创建试用小程序」</h3>
            <p>
              只需填写小程序名称，即可创建一个有效期14天的小程序，总耗时在1分钟之内。
              <br />
              试用小程序可转正为正式小程序，但不支持微信支付、小程序直播、不可以被搜索。
            </p>
            <Button type="primary" onClick={toWeappTrial}>
              创建
            </Button>
          </section>
          {/* -------------------------- 复用公众号主体快速注册小程序 -------------------------- */}
          <section class="weapp-sign-section">
            <h3>（3）若您有完成认证的公众号，可以「复用公众号主体快速注册小程序」</h3>
            <p>
              复用资质创建的小程序默认与公众号关联，并将以公众号的主体作为小程序的开发者。
              <br />
              一个公众号只能将授权给一个第三方平台发布小程序，所以若您的公众号已授权其他平台，则可能无法注册。
            </p>
            <Button type="primary" onClick={toWeappOA}>
              创建
            </Button>
          </section>
          {/* -------------------------------- 快速创建小程序 ------------------------------- */}
          <section class="weapp-sign-section">
            <h3>
              （4）若您<strong>没有</strong>
              完成认证的公众号，但企业法人可以进行人脸识别完成认证场景，可以「快速创建小程序」
            </h3>
            <p>
              只需填写法人微信、法人姓名、企业名称、信用代码，以上信息核实成功后，微信将向法人微信下发身份校验信息，
              <br />
              法人在 24小时 内点击信息按页面提示完成身份证信息与人脸识别信息的校验，认证通过即可创建已认证的小程序。
            </p>
            <Button type="primary" onClick={toWeappCreate}>
              创建
            </Button>
          </section>

          {/* --------------------------------- 自行注册 --------------------------------- */}
          <section class="weapp-sign-section">
            <h3>
              （5）若您<strong>既没有</strong>完成认证的公众号，<strong>又无法联系</strong>
              企业法人进行人脸识别完成认证，请自行到微信公众平台注册小程序
            </h3>
            <p>点击前往微信公众号平台注册小程序，注册完成后通过方式（1）完成授权绑定</p>
            <a href="https://mp.weixin.qq.com/" target="__blank">
              <Button type="primary">前往</Button>
            </a>
          </section>
        </PageView>
      )
    }
  }
})
