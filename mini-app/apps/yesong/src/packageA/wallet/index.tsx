// 钱包
import './style.scss'
import { defineComponent, onMounted, ref } from 'vue'
import { BasePage, SCENE_STORE, useLoading, useLoadingEnd, usePagination, useToast } from '@anteng/core'
import { getAccountLog, getUserBalance } from '../../api'
import { ScrollView } from '@tarojs/components'
import { convertFenToYuanAndFen } from '../../utils'
import { balanceLabel } from '../../constants'

definePageConfig({
  navigationStyle: 'custom',
  disableScroll: true
})

interface balanceType {
  balance: number
  id: number
  userid: number
  scene: string
  status: number
  yuan?: number | undefined
  fen?: number | undefined
  amount: string | undefined
}

interface balanceItemType {
  id: number
  accountId: number
  recordNo: string
  outOrderNo: string
  type: number
  amount: number
  balance: number
  remark: string
  createTime: string
}

export default defineComponent({
  name: 'Wallet',
  setup() {
    const init = () => {
      getUserBalance()
        .then(res => {
          if (res.success) {
            balanceObj.value = res.data
          }
        })
        .catch((e: any) => useToast(e.response.data.msg + '' || '加载出错了'))
        .finally(() => {
          fetchData()
          useLoadingEnd()
        })
    }

    const balanceObj = ref<Partial<balanceType>>({
      balance: 0
    })

    const { fetchData, isEmpty, ErrorStatus, Loading, refreshData, data, refresherTriggered, Empty, EndTip } =
      usePagination({
        requestHandler: params => {
          return getAccountLog({ ...params, descs: 'create_time', id: balanceObj.value.userid, scene: SCENE_STORE })
        },
        showLoading: true
      })

    onMounted(() => init())
    useLoading()

    return () => {
      return (
        <BasePage
          backgroundColor="transparent"
          navigator={{
            title: '',
            showMenuButton: false,
            navigationBarBackgroundColor: 'rgba(0,0,0,0)'
          }}
          class="wallet-page"
        >
          <div class="back-cover"></div>

          <ScrollView
            scrollY
            onScrolltolower={fetchData}
            refresherEnabled={true}
            refresherBackground="transparent"
            onRefresherrefresh={() => {
              init()
              refreshData()
            }}
            refresherTriggered={refresherTriggered.value}
            class="wallet-page-scroll"
          >
            <div class="top-info-block">
              <div class="top-card">
                <div class="top-balance-title">我的余额(元)</div>
                <div class="balance-number">
                  <div class="yuan-number"> {convertFenToYuanAndFen(balanceObj.value.balance).yuan || 0}</div>.
                  <div class="fen-number">{convertFenToYuanAndFen(balanceObj.value.balance).fen || 0}</div>
                </div>
              </div>
            </div>
            <div class="bottom-scroll-list">
              <div class="top-title">金额明细</div>
              <div class="title-selection">
                {data.value.length > 0 &&
                  data.value.map((item: balanceItemType) => {
                    return (
                      <div class="balance-item">
                        <div class="left-text">
                          <div class="key-title">{balanceLabel.find(it => it.value === item.type).label}</div>
                          <div class="key-create-time">{item.createTime}</div>
                        </div>
                        <div class="right-text">{convertFenToYuanAndFen(item.amount).amount}</div>
                      </div>
                    )
                  })}

                <isEmpty />
                <ErrorStatus />
                <Loading />
                <Empty />
                <EndTip />
              </div>
            </div>
          </ScrollView>
        </BasePage>
      )
    }
  }
})
