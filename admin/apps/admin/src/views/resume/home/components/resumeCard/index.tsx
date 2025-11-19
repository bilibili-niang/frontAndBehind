import { defineComponent } from 'vue'

export default defineComponent({
  name: 'ResumeCard',
  props: {},
  emits: [''],
  setup(props, { emit }) {
    console.log('props:')
    console.log(props)
    return () => {
      return (
        <div class="resume-card">

        </div>
      )
    }
  }
})
