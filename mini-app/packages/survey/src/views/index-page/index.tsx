import { defineComponent } from 'vue'
import './style.scss'
import { Image } from '@tarojs/components'
import { useSurveyFormStore } from '../../stores/form'
import { storeToRefs } from 'pinia'
import { useLoading, useLoadingEnd, useResponseMessage, withLogin } from '@pkg/core'
import { withUnit } from '@pkg/utils'
import { $startSurvey } from '../../api'

export default defineComponent({
  emits: {
    start: () => true
  },
  setup(props, { emit }) {
    const formStore = useSurveyFormStore()
    const { settings, form, styles } = storeToRefs(formStore)

    const onStart = withLogin(() => {
      useLoading()
      $startSurvey(form.value?.$id!)
        .then(res => {
          if (res.code === 200) {
            emit('start')
          } else {
            useResponseMessage(res)
          }
        })
        .catch(useResponseMessage)
        .finally(useLoadingEnd)
    })

    return () => {
      if (!form.value) {
        return null
      }
      return (
        <div class="survey-form-index-page">
          <Image class="banner" mode="widthFix" src={styles.value?.index.backgroundImage!} />
          <div
            class="safe-area"
            style={{
              paddingTop: withUnit(styles.value?.index.paddingTop!, 450)
            }}
          >
            <div class="title" style={{ color: styles.value?.index.title?.color }}>
              {styles.value?.index.title?.text || settings.value?.base?.name}
            </div>
            <div class="desc" style={{ color: styles.value?.index.tip?.color }}>
              {styles.value?.index.tip?.text || form.value?.description}
            </div>
            <div
              class="start-button clickable"
              onClick={onStart}
              style={{
                color: styles.value?.index.button.color,
                backgroundColor: styles.value?.index.button.backgroundColor
              }}
            >
              {styles.value?.index.button.text || '开始答题'}
            </div>
            <div class="summary">
              共 {formStore.items.length} 题，约 {formStore.form?.estimateDuration} 分钟
            </div>
          </div>
        </div>
      )
    }
  }
})
