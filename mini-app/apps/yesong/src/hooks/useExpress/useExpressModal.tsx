import { EmptyStatus, makePhoneCall, useCopyText, useModal } from '@pkg/core'
import { defineComponent } from 'vue'
import './style.scss'
import useExpress from './index'
import dayjs from 'dayjs'
import { EXPRESS_SUB_STATUS_OPTIONS } from '../../constants'

const useExpressModal = (options: { header?: any; courierNo: string; phone: string }) => {
  const content = (
    <div class="express-modal-wrap">
      {options.header}
      <ExpressInfo courierNo={options.courierNo} phone={options.phone} />
    </div>
  )

  return useModal({
    placement: 'bottom',
    content: content,
    title: '物流详情'
  })
}

export default useExpressModal

const ExpressInfo = defineComponent({
  props: {
    courierNo: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const { expressRef, isLoading, errMsg } = useExpress({ courierNo: props.courierNo, phone: props.phone })
    return () => {
      if (!isLoading.value && (errMsg.value || !expressRef.value)) return <EmptyStatus description={errMsg.value} />
      if (isLoading.value || !expressRef.value) return null
      const { expressCompanyName, logisticsTraceDetails } = expressRef.value!
      return (
        <div class="express-modal">
          <div class="express-modal__header">
            {/* <Icon name="icon-lose" /> */}
            <div
              class="logo"
              style={{
                backgroundImage: `url(${expressRef.value?.expressCompanyLogo})`
              }}
            ></div>
            <div class="name">{expressCompanyName}</div>
            <div>{props.courierNo}</div>
            <div class="copy" onClick={() => useCopyText(props.courierNo)}>
              复制
            </div>
          </div>
          <div class="express-modal__details">
            {logisticsTraceDetails?.map((item, index, list) => {
              const statusText =
                // 当前的状态和上一条状态一样，不显示状态文本
                item.subLogisticsStatus === list[index - 1]?.subLogisticsStatus
                  ? ''
                  : EXPRESS_SUB_STATUS_OPTIONS.find(option => option.value === item.subLogisticsStatus)?.label
              const time = dayjs(item.time).format('MM-DD HH:mm:ss')

              const phoneNumberRegex = /(\b\d{11}\b)|(\b\d{3,4}-\d{7,8}\b)|(\+\d{2}\s\d{2,4}-\d{7,8}\b)/g
              const highlightedText = item.desc.split(phoneNumberRegex).map((text, index) => {
                if (phoneNumberRegex.test(text)) {
                  return (
                    <span
                      key={index}
                      class="express-step__phone"
                      onClick={() => {
                        makePhoneCall(text)
                      }}
                    >
                      {text}
                    </span>
                  )
                }
                return text
              })

              return (
                <div class={['express-step', index === 0 && 'active', index === list.length - 1 && 'last']}>
                  <div class="dot"></div>
                  <div class="dash-line"></div>
                  <div class="express-step__title">
                    {statusText && <div class="express-step__status">{statusText}</div>}
                    <div class="express-step__date">{time}</div>
                  </div>
                  <div class="express-step__text">{highlightedText}</div>
                </div>
              )
            })}
          </div>
        </div>
      )
    }
  }
})
