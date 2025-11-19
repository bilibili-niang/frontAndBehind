import { computed, inject, onMounted, provide, ref } from 'vue'
import { defineStore } from 'pinia'
import { SurveyForm, SurveyFormSnapshot } from '../form'
import { merge } from 'lodash-es'
import { WIDGET_OPTIONS, WIDGET_TYPE_OPTIONS } from '../constants'
import { $getSurveyAnswerRecord, $getSurveyDetail, $submitSurvey } from '../api'
import { SurveyDetail } from '../api/types'
import { useAppStore, useLoading, useLoadingEnd, useResponseMessage, useToast } from '@anteng/core'
import { formatDate } from '@anteng/utils'

const stores: {
  [key: string]: ReturnType<typeof defineSurveyFormStore>
} = {}

/** 定义下单页面全局状态 store */
export const defineSurveyFormStore = (id: string) =>
  defineStore(`survey-form-${id}`, () => {
    // 不能直接修改原对象，否则无法触发代理对象的响应式更新
    // 所有属性、方法都应该通过代理对象触发
    const form = ref<SurveyForm | null>(null)

    const surveyDetail = ref<SurveyDetail | null>(null)
    const generateForm = () => {
      useLoading()

      $getSurveyAnswerRecord(id)
        .then(res => {
          const answerInfo = res.data.records?.[0].answerInfo
          form.value = new SurveyForm(retrieve(surveyDetail.value!, answerInfo))
        })
        .catch(err => {
          console.log(err)
          form.value = new SurveyForm(retrieve(surveyDetail.value!))
        })
        .finally(() => {
          useLoadingEnd()
        })

      // console.log(form.value)
    }

    const getSurveyDetail = () => {
      useLoading()
      $getSurveyDetail(id)
        .then(res => {
          if (res.code === 200 && res.data) {
            surveyDetail.value = res.data
            generateForm()
          } else {
            useResponseMessage(res)
          }
        })
        .catch(err => {
          useResponseMessage(err)
        })
        .finally(() => {
          useLoadingEnd()
        })
    }

    // 这里必须等待挂载，因为登录弹窗依赖 BasePage
    onMounted(() => {
      getSurveyDetail()
    })

    const widgets = computed(() => {
      return WIDGET_TYPE_OPTIONS.map(group => {
        return {
          label: group.label,
          value: group.value,
          children: WIDGET_OPTIONS.filter(item => item.group === group.value)
        }
      })
    })

    const items = computed(() => {
      return form.value?.items ?? []
    })

    const nextPage = () => {
      const res = form.value?.currentPage?.validate()
      if (res) {
        form.value!.nextPage()
      } else {
        useToast('请检查答案')
      }
    }
    const prevPage = () => {
      form.value!.prevPage()
    }

    const settings = computed({
      get: () => {
        return form.value?.settings
      },
      set: data => {
        merge(form.value?.settings, data)
      }
    })

    const styles = computed({
      get: () => {
        return form.value?.styles
      },
      set: data => {
        merge(form.value?.styles, data)
      }
    })

    /** 是否显示序号 */
    const showIndex = computed(() => {
      return settings.value?.display.showIndex !== false
    })

    // /** 恢复数据：后端接口返回的数据 => 前端数据 */
    // const retrieve = (data: SurveyDetail) => {
    //   console.log(data)
    //   return DEMO as SurveyFormSnapshot
    // }

    /** 恢复数据：后端接口返回的数据 => 前端数据 */
    const retrieve = (data: any, answerList?: any[]) => {
      if (answerList?.length! > 0) {
        submitted.value = true
      }
      const snapshot: SurveyFormSnapshot = {
        $id: data.id,
        name: data.name,
        description: data.description,
        settings: {
          base: {
            name: data.name,
            description: data.homePage?.guide,
            collectionTime: [data.startTime, data.endTime]
          },
          display: {
            showIndex: data.displaySettings.showIndex,
            showPagination: data.displaySettings.showPage,
            returnable: data.displaySettings.showBack
          },
          share: {
            enable: data.shareSettings.shareable,
            title: data.shareSettings.shareTitle,
            subtitle: data.shareSettings.shareSubTitle,
            image: data.shareSettings.shareImg
          }
        },
        styles: data.styles,
        items: data.questionContent.map((item: any, index) => {
          const { $id, topicName, required, topicType, ...rest } = item
          return {
            $id: $id,
            name: topicName,
            required: required === 1,
            key: WIDGET_OPTIONS.find(item => item.type === topicType)?.value,
            // 服务器获取的历史答题记录，这里只能用序号对应，也是醉了...
            $remote_answer: answerList?.find(item => item.questionSort === index),
            config: {
              ...rest
            }
          }
        })
      }
      return snapshot
    }

    const submitted = ref(false)

    const startTime = new Date()
    const submit = async () => {
      // if (submitted.value) {
      //   useToast('请勿重复提交')
      //   return void 0
      // }
      const answerInfo = form.value?.format()
      if (!answerInfo) return Promise.reject()
      const payload = {
        merchantId: useAppStore().merchantId,
        questionnaireId: id,
        startTime: formatDate(startTime),
        endTime: formatDate(new Date()),
        answerInfo: answerInfo
      }
      useLoading()
      try {
        const res = await $submitSurvey(payload as any)
        if (res.code === 200) {
          submitted.value = true
          return Promise.resolve(res)
        } else {
          useResponseMessage(res)
          return Promise.reject(res)
        }
      } catch (err) {
        useResponseMessage(err)
        return Promise.reject(err)
      } finally {
        useLoadingEnd()
      }
    }

    const validate = () => {
      return form.value?.validate()
    }

    return {
      form,
      widgets,
      items,

      settings,
      styles,
      showIndex,

      submit,
      submitted,
      validate,

      nextPage,
      prevPage
    }
  })

export const useSurveyFormStore = (id?: string, ...args: Parameters<ReturnType<typeof defineSurveyFormStore>>) => {
  if (id) {
    try {
      provide('id', id)
    } catch (err) {
      id
    }
  }
  const formId = id ?? inject('id')
  if (!formId) {
    throw new Error('useSurveyFormStore 必须在问卷模块里使用，或者手动传入id')
  }
  const name = `survey-form-${formId}`
  if (stores[name]) {
    return stores[name](...args)
  }
  const store = defineSurveyFormStore(formId)
  stores[name] = store
  return store(...args)
}
