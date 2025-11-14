import { defineComponent } from 'vue'
import './style.scss'
import { Image } from '@tarojs/components'
import { useSurveyFormStore } from '../../stores/form'
import { storeToRefs } from 'pinia'
import { withUnit } from '@anteng/utils'

export default defineComponent({
  emits: {
    result: () => true
  },
  setup(props, { emit }) {
    const formStore = useSurveyFormStore()
    const { styles } = storeToRefs(formStore)
    return () => {
      return (
        <div class="survey-form-end-page">
          <Image class="banner" mode="widthFix" src={styles.value?.end.backgroundImage!} />
          <div
            class="safe-area"
            style={{
              paddingTop: withUnit(styles.value?.end.paddingTop!, 450)
            }}
          >
            <div
              class="title"
              style={{
                color: styles.value?.end.title.color
              }}
            >
              {styles.value?.end.title.text || '感谢你参与本次问卷调查'}
            </div>
            {styles.value?.end.tipEnable && (
              <div
                class="desc"
                style={{
                  color: styles.value?.end.tip.color
                }}
              >
                {styles.value?.end.tip.text || '我们将会对提交的所有内容进行严格保密'}
              </div>
            )}
            <div
              class="start-button clickable"
              style={{
                color: styles.value?.end.button.color,
                backgroundColor: styles.value?.end.button.backgroundColor
              }}
              onClick={() => {
                emit('result')
              }}
            >
              {styles.value?.end.button.text || '查看答题记录'}
            </div>
            <img class="ads" src={styles.value?.end.ads} alt="" />
          </div>
        </div>
      )
    }
  }
})
