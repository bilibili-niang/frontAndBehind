/** 物流主状态：待揽收 */
export const EXPRESS_STATUS_WAIT_ACCEPT = 'WAIT_ACCEPT'
/** 物流主状态：已揽收 */
export const EXPRESS_STATUS_ACCEPT = 'ACCEPT'
/** 物流主状态：运输中 */
export const EXPRESS_STATUS_TRANSPORT = 'TRANSPORT'
/** 物流主状态：派件中 */
export const EXPRESS_STATUS_DELIVERING = 'DELIVERING'
/** 物流主状态：已代签收 */
export const EXPRESS_STATUS_AGENT_SIGN = 'AGENT_SIGN'
/** 物流主状态：已签收 */
export const EXPRESS_STATUS_SIGN = 'SIGN'
/** 物流主状态：包裹异常 */
export const EXPRESS_STATUS_FAILED = 'FAILED'

/** 物流主状态 */
export const EXPRESS_STATUS_OPTIONS = [
  { label: '待揽收', value: EXPRESS_STATUS_WAIT_ACCEPT },
  { label: '已揽收', value: EXPRESS_STATUS_ACCEPT },
  { label: '运输中', value: EXPRESS_STATUS_TRANSPORT },
  { label: '派件中', value: EXPRESS_STATUS_DELIVERING },
  { label: '已代签收', value: EXPRESS_STATUS_AGENT_SIGN },
  { label: '已签收', value: EXPRESS_STATUS_SIGN },
  { label: '包裹异常', value: EXPRESS_STATUS_FAILED }
]

/** 物流子状态：接单中 */
export const EXPRESS_SUB_STATUS_RECEIVE = 'RECEIVE'
/** 物流子状态：待揽收 */
export const EXPRESS_SUB_STATUS_WAIT_ACCEPT = 'WAIT_ACCEPT'
/** 物流子状态：已揽收 */
export const EXPRESS_SUB_STATUS_ACCEPT = 'ACCEPT'
/** 物流子状态：运输中 */
export const EXPRESS_SUB_STATUS_TRANSPORT = 'TRANSPORT'
/** 物流子状态：转单或修改地址转寄 */
export const EXPRESS_SUB_STATUS_SEND_ON = 'SEND_ON'
/** 物流子状态：到达目的城市 */
export const EXPRESS_SUB_STATUS_ARRIVE_CITY = 'ARRIVE_CITY'
/** 物流子状态：派件中 */
export const EXPRESS_SUB_STATUS_DELIVERING = 'DELIVERING'
/** 物流子状态：已放入快递柜或驿站 */
export const EXPRESS_SUB_STATUS_STA_INBOUND = 'STA_INBOUND'
/** 物流子状态：已代签收 */
export const EXPRESS_SUB_STATUS_AGENT_SIGN = 'AGENT_SIGN'
/** 物流子状态：已签收 */
export const EXPRESS_SUB_STATUS_SIGN = 'SIGN'
/** 物流子状态：从快递柜或者驿站取出 */
export const EXPRESS_SUB_STATUS_STA_SIGN = 'STA_SIGN'
/** 物流子状态：退回签收 */
export const EXPRESS_SUB_STATUS_RETURN_SIGN = 'RETURN_SIGN'
/** 物流子状态：包裹异常 */
export const EXPRESS_SUB_STATUS_FAILED = 'FAILED'
/** 物流子状态：拒收 */
export const EXPRESS_SUB_STATUS_REFUSE_SIGN = 'REFUSE_SIGN'
/** 物流子状态：派件异常 */
export const EXPRESS_SUB_STATUS_DELIVER_ABNORMAL = 'DELIVER_ABNORMAL'
/** 物流子状态：滞留件 */
export const EXPRESS_SUB_STATUS_RETENTION = 'RETENTION'
/** 物流子状态：问题件 */
export const EXPRESS_SUB_STATUS_ISSUE = 'ISSUE'
/** 物流子状态：退回件 */
export const EXPRESS_SUB_STATUS_RETURN = 'RETURN'
/** 物流子状态：破损 */
export const EXPRESS_SUB_STATUS_DAMAGE = 'DAMAGE'
/** 物流子状态：揽件取消 */
export const EXPRESS_SUB_STATUS_CANCEL_ORDER = 'CANCEL_ORDER'
/** 物流子状态 */
export const EXPRESS_SUB_STATUS_OPTIONS = [
  { label: '接单中', value: EXPRESS_SUB_STATUS_RECEIVE },
  { label: '待揽收', value: EXPRESS_SUB_STATUS_WAIT_ACCEPT },
  { label: '已揽收', value: EXPRESS_SUB_STATUS_ACCEPT },
  { label: '运输中', value: EXPRESS_SUB_STATUS_TRANSPORT },
  { label: '已转寄', value: EXPRESS_SUB_STATUS_SEND_ON },
  { label: '到达目的城市', value: EXPRESS_SUB_STATUS_ARRIVE_CITY },
  { label: '派件中', value: EXPRESS_SUB_STATUS_DELIVERING },
  { label: '待取件' /** 已放入快递柜或驿站 */, value: EXPRESS_SUB_STATUS_STA_INBOUND },
  { label: '已代签收', value: EXPRESS_SUB_STATUS_AGENT_SIGN },
  { label: '已签收', value: EXPRESS_SUB_STATUS_SIGN },
  { label: '已签收' /** 从快递柜或者驿站取出 */, value: EXPRESS_SUB_STATUS_STA_SIGN },
  { label: '退回签收', value: EXPRESS_SUB_STATUS_RETURN_SIGN },
  { label: '包裹异常', value: EXPRESS_SUB_STATUS_FAILED },
  { label: '拒收', value: EXPRESS_SUB_STATUS_REFUSE_SIGN },
  { label: '派件异常', value: EXPRESS_SUB_STATUS_DELIVER_ABNORMAL },
  { label: '滞留件', value: EXPRESS_SUB_STATUS_RETENTION },
  { label: '问题件', value: EXPRESS_SUB_STATUS_ISSUE },
  { label: '退回件', value: EXPRESS_SUB_STATUS_RETURN },
  { label: '破损', value: EXPRESS_SUB_STATUS_DAMAGE },
  { label: '揽件取消', value: EXPRESS_SUB_STATUS_CANCEL_ORDER }
]
