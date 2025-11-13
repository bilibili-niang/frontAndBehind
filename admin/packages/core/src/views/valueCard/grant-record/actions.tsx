import { SchemaForm } from '@anteng/jsf'
import { Modal, message } from '@anteng/ui'
import { ref } from 'vue'
import {
  $batchPreActivateValueCard,
  $modifyValueCardExpiredDate,
  $preActivateValueCard,
  $revokeValueCard
} from '../../../api/valueCard'
import useRequestErrorMessage, { useResponseMessage } from '../../../hooks/useRequestErrorMessage'
import useModal from '../../../hooks/useModal'
import { downloadFile } from '../../../utils'
import FileUploader from '../../../components/file-uploader'
export const onRevoke = (record: any, callback?: () => void) => {
  const state = ref({
    cardNo: record?.cardNo,
    name: record?.name,
    userPhone: record?.userPhone,
    remark: ''
  })

  Modal.confirm({
    title: '吊销储值卡',
    content: () => {
      return (
        <SchemaForm
          style="margin-left:-50px;width:calc(100% + 50px)"
          schema={{
            type: 'object',
            properties: {
              cardNo: {
                title: '卡号',
                type: 'string',
                readonly: true
              },
              name: {
                title: '储值卡名称',
                type: 'string',
                readonly: true
              },
              userPhone: {
                title: '归属用户',
                type: 'string',
                readonly: true,
                config: {
                  placeholder: '尚未绑定'
                }
              },
              remark: {
                title: '操作备注',
                type: 'string',
                widget: 'textarea',
                required: true,
                config: {
                  maxlength: 200,
                  placeholder: '请输入至少 5 个字备注说明'
                }
              }
            }
          }}
          value={state.value}
          onChange={(v) => {
            state.value = v
          }}
        ></SchemaForm>
      )
    },
    okText: '确定吊销',
    onOk: async () => {
      return $revokeValueCard({
        cardNo: record.cardNo,
        name: record.name,
        userId: record.userId,
        remark: state.value.remark
      })
        .then((res) => {
          if (res.code === 200) {
            message.success(res.msg)
            callback?.()
          } else {
            useRequestErrorMessage(res)
          }
          return res
        })
        .catch(useRequestErrorMessage)
    }
  })
}

export const onModifyExpiredDate = (record: any, callback?: () => void) => {
  const state = ref({
    cardNo: record?.cardNo,
    name: record?.name,
    userPhone: record?.userPhone,
    remark: '',
    validEndTime: ''
  })
  Modal.confirm({
    title: '修改有效期',
    content: () => {
      return (
        <SchemaForm
          style="margin-left:-50px;width:calc(100% + 50px)"
          value={state.value}
          onChange={(v) => {
            state.value = v
          }}
          schema={{
            type: 'object',
            properties: {
              cardNo: {
                title: '卡号',
                type: 'string',
                readonly: true
              },
              name: {
                title: '储值卡名称',
                type: 'string',
                readonly: true
              },
              userPhone: {
                title: '归属用户',
                type: 'string',
                readonly: true,
                config: {
                  placeholder: '尚未绑定'
                }
              },
              validEndTime: {
                title: '延长有效期至',
                type: 'string',
                widget: 'date-picker',
                required: true,
                config: {
                  style: 'width:100%',
                  valueFormat: 'YYYY-MM-DD HH:mm:ss',
                  showTime: true
                }
              },
              remark: {
                title: '操作备注',
                type: 'string',
                widget: 'textarea',
                required: true,
                config: {
                  maxlength: 200,
                  placeholder: '请输入至少 5 个字备注说明'
                }
              }
            }
          }}
        ></SchemaForm>
      )
    },
    okText: '确定修改',
    onOk: async () => {
      if (!state.value.validEndTime) {
        message.error('请选择有效期')
        return Promise.reject()
      }
      return $modifyValueCardExpiredDate({
        cardNo: record.cardNo,
        name: record.name,
        userId: record.userId,
        validEndTime: state.value.validEndTime,
        remark: state.value.remark
      })
        .then((res) => {
          if (res.code === 200) {
            callback?.()
            message.success(res.msg)
          } else {
            useRequestErrorMessage(res)
          }
        })
        .catch(useRequestErrorMessage)
    }
  })
}

export const onPreActivate = (record: any, callback?: () => void) => {
  const state = ref({
    cardNo: record?.cardNo,
    name: record?.name,
    cardPassword: '',
    remark: ''
  })
  Modal.confirm({
    title: '预激活',
    content: () => {
      return (
        <SchemaForm
          style="margin-left:-50px;width:calc(100% + 50px)"
          schema={{
            type: 'object',
            properties: {
              cardNo: {
                title: '卡号',
                type: 'string',
                readonly: true
              },
              name: {
                title: '储值卡名称',
                type: 'string',
                readonly: true
              },
              cardPassword: {
                title: '卡密',
                type: 'string',
                required: true,
                config: {
                  placeholder: '请输入'
                }
              },
              remark: {
                title: '操作备注',
                type: 'string',
                widget: 'textarea',
                required: true,
                config: {
                  maxlength: 200,
                  placeholder: '请输入至少 5 个字备注说明'
                }
              }
            }
          }}
          value={state.value}
          onChange={(v) => {
            state.value = v
          }}
        />
      )
    },
    okText: '确定预激活',
    onOk: async () => {
      return $preActivateValueCard({
        cardNo: record.cardNo,
        cardPassword: state.value.cardPassword,
        cardName: record.name,
        remark: state.value.remark
      })
        .then((res) => {
          useResponseMessage(res)
          if (res.code === 200) {
            callback?.()
          }
        })
        .catch(useRequestErrorMessage)
    }
  })
}

export const onBatchPreActivate = (cbk?: () => void) => {
  const modal = useModal({
    title: '批量预激活',
    content: (
      <div style="padding: 0 20px 20px 20px;">
        <div class="color-disabled" style="margin-bottom: 20px;">
          请先点击这里
          <a
            onClick={() => {
              downloadFile('https://dev-cdn.null.cn/upload/c339601688860f671a2b2a421ff61720.xlsx')
            }}
          >
            <strong>&nbsp;下载模板文件&nbsp;</strong>
          </a>
          ，填写完成之后将文件上传即可
        </div>
        <div class="form-container">
          <FileUploader
            uploadUrl={''}
            customRequest={$batchPreActivateValueCard}
            message="上传成功，请等待后台执行"
            onSuccess={() => {
              modal.destroy()
              cbk?.()
            }}
            allowedTypes={['xlsx']}
          />
        </div>
      </div>
    ),
    width: 600
  })
}
