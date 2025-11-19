import { computed, defineComponent } from 'vue'
import './style.scss'
import { useSurveyFormStore } from '../../stores/form'
import { storeToRefs } from 'pinia'
import QuestionItem from './question-item'
import { DEFAULT_SURVEY_NAME } from '../../constants'
import { Icon } from '@anteng/ui'
import { useLoading, useLoadingEnd, useLogin, useResponseMessage, useUserStore } from '@anteng/core'

export default defineComponent({
  name: '',
  props: {
    asResult: Boolean
  },
  emits: {
    next: () => true
  },
  setup(props, { emit }) {
    const userStore = useUserStore()

    const formStore = useSurveyFormStore()
    const { prevPage, nextPage } = formStore
    const { items, settings, form, submitted } = storeToRefs(formStore)

    const onSubmit = () => {
      useLoading()
      formStore
        .submit()
        .then(() => {
          emit('next')
        })
        .catch(err => {
          useResponseMessage(err, '提交失败')
        })
        .finally(useLoadingEnd)
    }

    const onCheckout = () => {
      formStore.validate()
    }

    const paginationEnable = computed(() => !props.asResult && settings.value!.display.showPagination)

    /** 显示回退上一分页按钮 */
    const returnAble = computed(() => {
      return settings.value!.display.returnable !== false && form.value!.pagination.current > 0
    })

    return () => {
      if (!form.value) return <div></div>
      return (
        <div class="survey-form-editor-view__render">
          {/* <img class="survey-form-editor-view__banner" src="https://image.wjx.cn/images/theme/vmbg1.png" /> */}
          <img
            class="survey-form-editor-view__banner"
            src="https://dev-cdn.anteng.cn/upload/5e97376a7d789a59c3dd7db2602ccf30.jpg"
          />
          <div class="survey-form-editor-view__page">
            {paginationEnable.value && (
              <div class={['survey-form__progress', form.value!.currentProgress === 0 && 'hidden']}>
                <div class="bar" style={`width:${form.value!.currentProgress * 100}%`}></div>
              </div>
            )}
            {!paginationEnable.value || form.value.pagination.current === 0 ? (
              <>
                <h2 class="survey-form-title">{settings.value!.base.name || DEFAULT_SURVEY_NAME}</h2>
                {form.value?.description && <div class="survey-form-desc">{form.value.description}</div>}
              </>
            ) : (
              <div class="survey-form-title"></div>
            )}
            {paginationEnable.value ? (
              <div class="question-item-wrap" key={form.value.currentPage?.$id}>
                <QuestionItem key={form.value.currentPage?.$id} item={form.value.currentPage!} />
                <div class="survey-form__actions">
                  {returnAble.value && (
                    <div
                      class="survey-form__action prev clickable"
                      onClick={() => {
                        prevPage()
                      }}
                    >
                      <Icon name="left" />
                    </div>
                  )}
                  {form.value!.pagination.current < items.value.length - 1 ? (
                    <div
                      class="survey-form__action next clickable"
                      onClick={() => {
                        nextPage()
                      }}
                    >
                      下一题
                    </div>
                  ) : (
                    <>
                      <div class="survey-form__action submit clickable" onClick={onSubmit}>
                        提交
                      </div>
                      {submitted.value && (
                        <div class="survey-form__submitted">您已提交过，重复提交将覆盖之前的内容</div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ) : (
              <>
                {items.value.map((item, index) => {
                  return (
                    <div class={['question-item-wrap', props.asResult && 'disabled']} key={item.$id}>
                      <QuestionItem key={item.$id} index={index + 1} item={item} />
                    </div>
                  )
                })}
                {!props.asResult && (
                  <div class="survey-form__footer" onClick={onSubmit}>
                    <div class="survey-form__action submit clickable">提交</div>
                    {submitted.value && <div class="survey-form__submitted">您已提交过，重复提交将覆盖之前的内容</div>}
                  </div>
                )}
              </>
            )}
            {process.env.NODE_ENV === 'development' && (
              <div class="survey-form__footer check" onClick={onCheckout}>
                <div class="action">&nbsp;校验&nbsp;</div>
              </div>
            )}
          </div>
          {!userStore.isLogin && (
            <div class="survey-form-editor-view__login">
              <div class="tip">请您先登录</div>
              <div
                class="button"
                onClick={() => {
                  useLogin()
                }}
              >
                立即登录
              </div>
            </div>
          )}
        </div>
      )
    }
  }
})
