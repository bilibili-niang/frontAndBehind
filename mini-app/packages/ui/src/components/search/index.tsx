import { Input } from '@tarojs/components'
import { computed, defineComponent, onMounted, PropType, ref, watch } from 'vue'
import TextSlider from '../text-slider'
import './style.scss'
import Icon from '../icon'

export default defineComponent({
  name: '',
  props: {
    value: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: ''
    },
    keywords: {
      type: [String, Array] as PropType<string | string[]>,
      default: () => []
    },
    clearAble: {
      type: Boolean,
      default: true
    },
    focus: {
      type: Boolean,
      default: false
    }
  },
  emits: {
    change: (text: string) => true,
    focus: () => true,
    blur: () => true,
    search: (text: string) => true
  },
  setup(props, { emit }) {
    const content = ref(props.value ?? '')
    watch(
      () => props.value,
      () => {
        content.value = props.value ?? ''
      }
    )

    const cursor = ref<number>(content.value.length)
    const onChange = (e: any) => {
      if (process.env.TARO_ENV === 'h5') {
        content.value = e.target.value
      } else {
        content.value = e.detail.value
        cursor.value = e.detail.cursor
      }
      triggerChange()
    }

    const keywordsList = computed(() => {
      if (props.keywords.length > 0) {
        if (Array.isArray(props.keywords)) {
          return props.keywords
        } else {
          return [props.keywords]
        }
      }
      return props.placeholder.length > 0 ? [props.placeholder] : []
    })
    const placeholderVisible = computed(() => {
      return !(content.value?.length > 0) && keywordsList.value.length > 0
    })

    const clear = () => {
      content.value = ''
      triggerChange()
      emit('search', '')
    }

    const triggerChange = () => {
      emit('change', content.value)
    }

    const currentKeywords = ref(0)
    const autoplay = ref(true)
    const onKeywordsToggle = (index: number) => {
      currentKeywords.value = index
    }

    const inputRef = ref()
    if (process.env.TARO_ENV === 'h5') {
      onMounted(() => {
        watch(
          () => props.focus,
          () => {
            if (props.focus) {
              inputRef.value?.focus()
            } else {
              inputRef.value?.blur()
            }
          },
          { immediate: true }
        )
      })
    }

    const onFocus = () => {
      cursor.value = content.value.length
      autoplay.value = false
      emit('focus')
    }
    const onBlur = () => {
      cursor.value = content.value.length
      autoplay.value = true
      emit('blur')
    }

    const onSearch = (e: any) => {
      if (process.env.TARO_ENV === 'h5') {
        if (e.keyCode === 13 || e.key === 'Enter' || e.code === 'Enter') {
          search()
        }
      } else {
        search()
      }
    }

    const search = () => {
      const _content = content.value.trim() ?? ''
      content.value = _content
      const text = _content || (props.keywords.length > 0 ? keywordsList.value[currentKeywords.value] : '')

      emit('search', text)

      // if (text.length > 0) {
      //   emit('search', text)
      // } else {
      //   useToast('请输入搜索内容')
      // }
    }

    return () => {
      return (
        <div class={['anteng-search', content.value.length > 0 && 'clearable']}>
          <div class="anteng-search__content">
            <Icon class="anteng-search__icon" name="search" />
            <div class="anteng-search__input-wrap">
              {process.env.TARO_ENV === 'h5' ? (
                <form
                  action="javascript:void(0);"
                  onSubmit={e => {
                    e.preventDefault()
                  }}
                >
                  <input
                    ref={inputRef}
                    type="search"
                    class="anteng-search__input input"
                    value={content.value}
                    onInput={onChange}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    onKeypress={onSearch}
                    placeholder={keywordsList.value.length === 1 ? keywordsList.value[0] : undefined}
                  />
                </form>
              ) : (
                <Input
                  class="anteng-search__input input"
                  value={content.value}
                  onInput={onChange}
                  confirmType="search"
                  onFocus={onFocus}
                  onBlur={onBlur}
                  onConfirm={onSearch}
                  focus={props.focus}
                  placeholder={keywordsList.value.length === 1 ? keywordsList.value[0] : undefined}
                  cursor={cursor.value}
                />
              )}
              {placeholderVisible.value && keywordsList.value.length > 1 && (
                <TextSlider
                  class="anteng-search__placeholder placeholder"
                  autoplay={autoplay.value}
                  list={keywordsList.value}
                  current={currentKeywords.value}
                  onChange={onKeywordsToggle}
                />
              )}
            </div>
            {props.clearAble && (
              <div class="anteng-search__clear" onClick={clear}>
                <Icon name="close-round-fill" />
              </div>
            )}
          </div>
        </div>
      )
    }
  }
})
