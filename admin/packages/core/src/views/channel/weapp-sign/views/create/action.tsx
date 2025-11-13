import { Spin, message } from '@anteng/ui'
import { computed, reactive, ref } from 'vue'
import { ImageWidget } from '@anteng/jsf/src/theme/default/widgets/image'
import uuid from '../../../../../utils/uuid'
import recognizeBusinessLicense from '../../../../../api/recognizeBusinessLicense'
import { useSchemaFormModal, type ImageDefine, useRequestErrorMessage, useAppStore } from '../../../../../../lib'
import { createEnterpriseWeapp } from '../../../../../api/weapp'

const licenseStatus = ref<'loading' | 'success' | 'error' | null>(null)
const licenseData = ref<any | null>(null)
const clearLicense = () => {
  licenseStatus.value = null
  licenseData.value = null
}
const handleLicenseChange = () => {
  if (state.licenseImage?.url) {
    const msgId = uuid()
    message.loading({ key: msgId, content: '营业执照正在识别中，请稍候片刻！', duration: 0 })
    licenseStatus.value = 'loading'
    recognizeBusinessLicense(state.licenseImage.url)
      .then((res: any) => {
        console.log(res)
        if (res.code === 200) {
          licenseData.value = res.data as IBusinessLicense

          state.companyName = licenseData.value.companyName
          state.creditCode = licenseData.value.creditCode

          message.success({ key: msgId, content: '营业执照识别成功！' })
          licenseStatus.value = 'success'
        } else {
          message.error({
            key: msgId,
            content: res.msg || '营业执照识别失败！'
          })
          licenseStatus.value = 'error'
        }
      })
      .catch((err: any) => {
        message.error({
          key: msgId,
          content: err.response?.data?.msg || err.msg || err.message || '营业执照识别失败！'
        })
        licenseStatus.value = 'error'
      })
  }
}

const ocrWidgetOptions = computed(() => {
  const businessLicenseEditable = state.companyName?.length > 0 || licenseStatus.value === 'success'
  return {
    required: true,
    config: {
      placeholder: businessLicenseEditable ? '必填，请输入' : 'OCR识别营业执照自动写入'
    }
  }
})

const schema = computed<any>(() => {
  return {
    type: 'object',
    required: [
      'licenseImage',
      'companyName',
      'creditCode',
      'legalPersonName',
      'legalPersonIdentity',
      'legalPersonWechat'
    ],
    properties: {
      licenseImage: {
        title: '营业执照',
        type: 'object',
        widget: (props: any) => {
          const onChange = (image: ImageDefine) => {
            handleLicenseChange()
            props.onChange(image)
          }
          return <ImageWidget {...props} onChange={onChange} />
        },
        config: {
          width: 200,
          ratio: '3:4'
        },
        description: (
          <div style="width: 100%">
            {licenseStatus.value === 'loading' ? (
              <div class="color-loading">
                营业执照正在识别中，请稍候片刻！<Spin></Spin>
              </div>
            ) : licenseStatus.value === 'error' ? (
              <div class="color-error">营业执照识别失败，请重试</div>
            ) : licenseStatus.value === 'success' ? (
              <div class="color-success">营业执照识别成功</div>
            ) : (
              <div>请上传营业执照图片等待OCR识别</div>
            )}
          </div>
        )
      },
      companyName: {
        title: '企业名称',
        type: 'string',
        ...ocrWidgetOptions.value
      },
      creditCode: {
        title: '统一信用代码',
        type: 'string',
        ...ocrWidgetOptions.value
      },
      legalPersonName: {
        title: '法人姓名',
        type: 'string',
        required: true,
        config: {
          placeholder: '必填，请输入'
        }
      },
      legalPersonIdentity: {
        title: '法人身份证',
        type: 'string',
        required: true,
        config: {
          placeholder: '必填，请输入'
        }
      },
      legalPersonWechat: {
        title: '法人微信号',
        type: 'string',
        required: true,
        config: {
          placeholder: '必填，请输入'
        }
      },
      thirdPartyTell: {
        title: '第三方联系电话',
        type: 'string',
        config: {
          placeholder: '选填'
        }
      }
    }
  }
})

const defaultState = () => {
  return {
    licenseImage: null as unknown as ImageDefine,
    companyName: '',
    creditCode: '',
    legalPersonName: '',
    legalPersonIdentity: '',
    legalPersonWechat: '',
    thirdPartyTell: ''
  }
}
const state = reactive(defaultState())
const formatState = () => {
  return {
    scene: useAppStore().scene,
    name: state.companyName,
    code: state.creditCode,
    codeType: state.creditCode,
    legalPersonaWechat: state.legalPersonWechat,
    legalPersonaName: state.legalPersonName,
    componentPhone: state.thirdPartyTell
  }
}

export const commit = () => {
  useSchemaFormModal({
    title: '提交小程序认证信息',
    width: 600,
    labelWidth: 110,
    schema: schema,
    data: state,
    onChange: (data) => {
      Object.assign(state, data)
    },
    onOk: async (data) => {
      try {
        const res = await createEnterpriseWeapp(formatState())
        if (res.code === 200) {
          message.success(res.msg || '提交成功')
          return Promise.resolve(res)
        } else {
          message.error(res.msg || '提交失败')
          return Promise.reject()
        }
      } catch (err) {
        useRequestErrorMessage(err)
        return Promise.reject(err)
      }
    }
  })
}
