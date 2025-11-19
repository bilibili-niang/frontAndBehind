import { PropType, computed, defineComponent, onMounted, ref } from 'vue'
import './style.scss'

import { storeToRefs } from 'pinia'

import Taro, { useRouter } from '@tarojs/taro'
import { Image } from '@tarojs/components'
import useAction, { Action } from '../../../hooks/useAction'
import { getInformationList } from '../../../api/information'
import { BasePage, useAppStore, usePagination } from '@anteng/core'
import { Search } from '@anteng/ui'
import { navigateToInformationDetail } from '../../../router'
import { ScrollView } from '@tarojs/components'

definePageConfig({
  navigationStyle: 'custom',
  disableScroll: true
})

function replaceHtmlEntities(str = '') {
  return (
    str
      .replace(/[\'\"\\\/\b\f\n\r\t]/g, '')
      // .replace(/[\@\#\$\%\^\&\*\{\}\:\"\L\<\>\? ]/, '')
      .replace(/&nbsp;/g, ' ') // 将 &nbsp; 替换为空格
      .replace(/&ldquo;/g, '“') // 将 &ldquo; 替换为“
      .replace(/&rdquo;/g, '”') // 将 &rdquo; 替换为”
      .replace(/&mdash;/g, '—') // 将 &mdash; 替换为—
      .replace(/&ndash;/g, '–') // 将 &ndash; 替换为–
      .replace(/&hellip;/g, '…') // 将 &hellip; 替换为…
      .replace(/&amp;/g, '&') // 将 &amp; 替换为 &
      .replace(/&quot;/g, '"') // 将 &quot; 替换为 "
      .replace(/&apos;/g, "'") // 将 &apos; 替换为 '
      .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec))
  ) // 将 &#123; 替换为对应的字符
}

const MessageItem = defineComponent({
  props: {
    uid: {
      type: [String, Number],
      required: true
    },
    title: {
      type: String,
      required: true
    },
    subtitle: {
      type: String,
      required: true
    },
    image: {
      type: String,
      required: true
    },
    category: {
      type: String,
      required: true
    },
    date: {
      type: String,
      required: true
    },
    contentType: {
      type: Number
    },
    action: {
      type: Object as PropType<Action>
    },
    hasFavorite: {
      type: Boolean,
      default: false
    },
    // 是否作为选择器
    asSelector: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const useClick = () => {
      if (props.asSelector) {
        // console.log('选择器,不用触发')
      } else {
        // 为0是链接
        if (props.contentType === 0) {
          useAction(props.action)
        } else {
          navigateToInformationDetail(props.uid)
        }
      }
    }
    return () => {
      return (
        <div
          class={[
            props.asSelector ? 'information-card-selector' : 'information-card',
            props.contentType === 0 && 'isAHref'
          ]}
        >
          <div class="information-card__content">
            <div class="information-card__text">
              <div class="information-card__title" onClick={useClick}>
                {props.title}
              </div>
              <div class="information-card__desc" onClick={useClick}>
                {props.subtitle}
              </div>
            </div>
            {props.image && (
              <Image class="information-card__thumbnail" mode="aspectFill" src={props.image} onClick={useClick} />
            )}
          </div>
          <div class="information-card__footer" onClick={useClick}>
            <span class="information-card__type"></span>
            <span class="information-card__date">{props.date}</span>
          </div>
        </div>
      )
    }
  }
})

export default defineComponent({
  name: 'InformationList',
  props: {
    // 是否作为选择器
    asSelector: {
      type: Boolean,
      default: false
    },
    // 选择触发
    onChange: {
      type: Function,
      default: () => ({})
    }
  },
  setup(props) {
    const router = useRouter()
    const { key } = router.params

    const navTitle = computed(() => {
      return '资讯列表'
    })

    const appStore = useAppStore()
    const { commonNavigatorHeight } = storeToRefs(appStore)

    const current = ref(1)
    const keywords = ref(key || '')

    /** 清除数据 */
    const clearState = () => {
      current.value = 1
    }
    const { Loading, data, refreshData, refresherTriggered, fetchData, ErrorStatus, Empty, EndTip } = usePagination({
      requestHandler: params => {
        return getInformationList({
          ...params,
          descs: 'create_time',
          title: keywords.value
        })
      }
    })
    const onSearch = v => {
      keywords.value = v
      isFocused.value = true
      // 静默刷新
      refreshData({ isRefresherPulling: false })
    }

    const onChange = (text: string) => {
      keywords.value = text
    }

    const isFocused = ref(false)

    onMounted(fetchData)

    return () => {
      if (props.asSelector) {
        return (
          <ScrollView
            scrollY
            refresherEnabled={true}
            refresherBackground="transparent"
            onRefresherrefresh={refreshData}
            onScrolltolower={fetchData}
            refresherTriggered={refresherTriggered.value}
            class="information-list-as-selector"
          >
            <div class="list-content">
              {data.value.map(item => {
                return (
                  <MessageItem
                    asSelector={true}
                    onClick={() => {
                      if (item.contentType === 0) {
                        Taro.showToast({
                          title: '不支持选择链接',
                          icon: 'none'
                        })
                      } else {
                        props.onChange(item)
                      }
                    }}
                    uid={item.id}
                    title={item.title}
                    subtitle={item.subtitle || item.content}
                    image={item.coverImageUri}
                    category={item.category}
                    date={item.createTime}
                    contentType={item.contentType}
                    action={item.jumpUrl as any}
                    hasFavorite={item.hasFavorite}
                  />
                )
              })}
            </div>
          </ScrollView>
        )
      } else {
        return (
          <BasePage navigator={{ title: navTitle.value }} class="information-list-page">
            <div
              class="information-page__header"
              style={{
                top: `${commonNavigatorHeight.value}px`
              }}
            >
              <Search
                onSearch={onSearch}
                focus={isFocused.value}
                value={keywords.value}
                onChange={onChange}
                onFocus={() => (isFocused.value = true)}
                placeholder="搜索你感兴趣的内容"
              />
            </div>
            <ScrollView
              scrollY
              refresherEnabled={true}
              refresherBackground="transparent"
              onRefresherrefresh={refreshData}
              onScrolltolower={fetchData}
              refresherTriggered={refresherTriggered.value}
              class={['information-page', 'typeHidden']}
            >
              <div class="list-content">
                {data.value.map(item => {
                  return (
                    <MessageItem
                      uid={item.id}
                      title={item.title}
                      subtitle={item.subtitle || item.content}
                      image={item.coverImageUri}
                      category={item.category}
                      date={item.createTime}
                      contentType={item.contentType}
                      action={item.jumpUrl as any}
                      hasFavorite={item.hasFavorite}
                    />
                  )
                })}
              </div>
            </ScrollView>
          </BasePage>
        )
      }
    }
  }
})
