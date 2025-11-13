import { Button } from '@anteng/ui'
import { defineComponent } from 'vue'
import Base from '../base'
import { commit } from './action'

export default defineComponent({
  name: 'WeappBind',
  setup() {
    const steps = [
      {
        title: '快速创建小程序',
        action: (
          <Button type="primary" onClick={commit}>
            创建
          </Button>
        ),
        description: (
          <p>
            提交企业名称、统一社会信用代码、法人姓名、法人身份证、法人微信号等信息，微信完成信息核实后，将向法人微信下发模板消息。法人需在24
            小时内完成校验（查看授权流程示意），进行身份证信息与人脸识别信息收集。以上全部验证通过后，即可创建已认证的小程序。
          </p>
        )
      }
    ]

    return () => {
      return <Base stpes={steps} currentStep={0}></Base>
    }
  }
})
