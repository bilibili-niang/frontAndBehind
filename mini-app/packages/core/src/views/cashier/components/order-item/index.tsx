import { Icon } from '@anteng/ui'
import { copyText } from '@anteng/utils'
import { type PropType, defineComponent } from 'vue'
import './style.scss'
import { PayAmount } from '../../../payee/components/PayAmount'

export const PendingPayOrderItem = defineComponent({
  props: {
    user: {
      type: Object as PropType<{
        name: string
        phone: string
        avatar?: string
      }>,
      required: true
    },
    totalAmount: {
      type: Number,
      required: true
    },
    payAmount: {
      type: Number,
      required: true
    },
    paymentChannelInfos: {
      type: Array
    },
    orderNo: {
      type: String,
      required: true
    },
    date: {
      type: String,
      required: true
    },
    infos: Array as PropType<{ label: string; value: any }[]>,

    serviceList: Array as PropType<{ name: string; price: number; count: number }[]>,
    valueCard: Object as PropType<{ name: string; value: number; image?: string }>
  },
  setup(props, { slots }) {
    const Content = () => {
      return (
        <>
          {props.serviceList && ServiceOrderContent(props.serviceList)}
          {props.valueCard && ValueCardOrderContent(props.valueCard)}
        </>
      )
    }

    const Amount = () => {
      if (props.paymentChannelInfos?.length! > 0) {
        return <PayAmount paymentChannelInfos={props.paymentChannelInfos} />
      }
      return <div class="value">￥{props.payAmount}</div>
    }

    return () => {
      return (
        <div class="c_cashier-order-item">
          <div class="user">
            <div
              class="avatar"
              style={{
                backgroundImage: props.user?.avatar ? `url('${props.user?.avatar}')` : undefined
              }}
            ></div>
            <div class="info">
              <div class="name">{props.user?.name || (!props.user?.phone ? '会员' : '')}</div>
              {props.user?.phone && <div class="phone">{props.user.phone}</div>}
            </div>
          </div>
          <Content />
          <div class="summary">
            <div class="item">
              <div class="label">总计：</div>
              <div class="value">￥{props.totalAmount}</div>
            </div>
            <div
              class="item clickable"
              onClick={() => {
                copyText(props.orderNo)
              }}
            >
              <div class="label">单号：</div>
              <div class="value">
                {props.orderNo}&nbsp;
                <Icon class="color-disabled" name="copy" />
              </div>
            </div>
            {props.date && (
              <div class="item">
                <div class="label">下单时间：</div>
                <div class="value">{props.date}</div>
              </div>
            )}
            {props.infos?.map((info) => {
              return (
                <div class="item">
                  <div class="label">{info.label}：</div>
                  <div class="value">{info.value}</div>
                </div>
              )
            })}
            <div class="item pay-amount">
              <div class="label">应收款：</div>
              <Amount />
            </div>
          </div>
          {slots.default?.()}
        </div>
      )
    }
  }
})

const ServiceOrderContent = (
  list: {
    name: string
    price: number
    count: number
  }[]
) => {
  return (
    <div class="c_cashier-order-item__service">
      {list?.map((o, i) => {
        return (
          <div class="product-item">
            <div class="name">
              {i + 1}. {o.name}
            </div>
            <div class="price">￥{o.price}</div>
            <div class="count">&times;{o.count}</div>
          </div>
        )
      })}
    </div>
  )
}

const ValueCardOrderContent = (options: { name: string; value: number; image?: string }) => {
  const { name, value, image } = options

  return (
    <div class="c_cashier-order-item__value-card">
      <div class="name">{name}</div>
      <div class="value">
        <span class="yen">&yen;</span>
        {value}
      </div>
      {image && (
        <div class="image-wrap">
          <img class="image" src={image} />
        </div>
      )}
    </div>
  )
}
