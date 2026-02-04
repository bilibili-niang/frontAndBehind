import { BasePage, usePagination, navigateTo, useToast } from '@pkg/core'
import { defineComponent, onMounted } from 'vue'
import { $getSurveyList } from '../../api'
import './style.scss'
import { Icon } from '@pkg/ui'
import { simplifyDate } from '@pkg/utils'

export default defineComponent({
  name: '',
  setup() {
    const { data, fetchData, Empty, Loading, EndTip, ErrorStatus } = usePagination({
      requestHandler: params => {
        return $getSurveyList(params)
      }
    })

    onMounted(() => {
      fetchData()
    })

    const onItemClick = (item: any) => {
      navigateTo({
        url: `/packageOther/survey/index?id=${item.id}`
      })
    }

    if (process.env.TARO_ENV === 'h5') {
      setTimeout(() => {
        window.wx.ready(() => {
          window.wx.updateAppMessageShareData({
            title: 'xxx', // 分享标题
            desc: 'xxx', // 分享描述
            link: location.href, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
            imgUrl: '', // 分享图标
            success: function () {
              // 设置成功
              useToast('xxx')
              console.log('。。。。')
            },
            fail: err => {
              console.log('。。。。', err)
            }
          })
        })
      }, 1000)
    }

    return () => {
      return (
        <BasePage
          navigator={
            process.env.TARO_ENV === 'h5' && window.__wxjs_environment === 'miniprogram'
              ? null
              : {
                  title: '问卷列表'
                }
          }
        >
          <div class="survey-list-page">
            {data.value.map(item => {
              return (
                <div
                  class="survey-list-page__item"
                  onClick={() => {
                    onItemClick(item)
                  }}
                >
                  <div class="banner" style={{ backgroundImage: `url(${item.styles?.index?.backgroundImage})` }}></div>
                  <div class="title">
                    {item.name} <Icon name="right" />
                  </div>
                  <div class="desc max-2-rows">{item.description}</div>
                  <div class="info number-font">
                    <div class="item">
                      <div class="value">
                        {item.startTime ? (
                          <div>{simplifyDate(item.startTime.slice(0, 16))}</div>
                        ) : (
                          <div class="color-disabled">未设置</div>
                        )}
                      </div>
                      <div class="label">开始时间</div>
                    </div>
                    <div class="item">
                      <div class="value">
                        {item.endTime ? (
                          <div>{simplifyDate(item.endTime.slice(0, 16))}</div>
                        ) : (
                          <div class="color-disabled">未设置</div>
                        )}
                      </div>
                      <div class="label">截止时间</div>
                    </div>
                    <div class="item">
                      <div class="value">
                        <div>共 {item.questionContent?.length} 题</div>
                      </div>
                      <div class="label">题数</div>
                    </div>
                  </div>
                </div>
              )
            })}
            <Empty />
            <Loading />
            <EndTip />
            <ErrorStatus />
          </div>
        </BasePage>
      )
    }
  }
})
