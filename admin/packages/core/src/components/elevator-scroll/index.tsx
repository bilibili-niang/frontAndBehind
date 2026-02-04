// 电梯滚动组件
import './index.scss'
import { computed, defineComponent, nextTick, onBeforeUnmount, onMounted, ref, Transition, watch } from 'vue'
import { Button, Icon, JsonView, message } from '@pkg/ui'
import Collapse from '@pkg/jsf/src/components/collapse'
import { SchemaErrors, Spin, useContextMenu } from '@pkg/core'
import { SchemaForm, validateForm } from '@pkg/jsf'

// 内容容器ID，用于获取滚动容器
const CONTAINER_ID = 'elevator-content-container'

// 传入的list的item类型
interface ElevatorSectionItem {
  title: string
  render: Function<() => JSX.Element>
}

/**
 * 电梯滚动组件 - 改造为更定制化的组件
 */
export default defineComponent({
  name: 'ElevatorScroll',
  props: {
    // 是否默认展开插槽内容
    defaultExpanded: {
      type: Boolean,
      default: true
    },
    // 章节列表
    list: {
      type: Function<() => ElevatorSectionItem[]>,
      default: () => [
        {
          title: '基础信息',
          render: () => {
            return <div>默认内容</div>
          }
        }
      ]
    },
    // 是否显示底部操作按钮
    showFooter: {
      type: Boolean,
      default: true
    },
    // 表单schema定义，用于验证
    schema: {
      type: Object,
      default: null
    },
    // 表单数据，用于验证
    formData: {
      type: Object,
      default: () => ({})
    },
    // 错误状态对象
    errorSchema: {
      type: Object,
      default: () => ({
        valid: true,
        errorMap: {}
      })
    },
    // 加载状态
    loading: {
      type: Boolean,
      default: false
    },
    // 标题
    title: {
      type: String,
      default: ''
    }
  },
  emits: ['save', 'cancel', 'validate', 'update:formData'],
  setup(props, { emit, slots }) {
    // 当前激活的导航项索引
    const currentNavId = ref(0)

    // 内容容器的引用
    const formRef = ref(null)

    // 每个表单部分的引用数组
    const sectionFormRefs = ref([])

    // 每个表单对应的错误状态
    const sectionErrorSchemas = ref([])

    // 添加表单引用的方法
    const addFormRef = (index, ref) => {
      if (!sectionFormRefs.value[index]) {
        sectionFormRefs.value[index] = ref
      }
    }

    // 表单验证错误状态
    const errorSchemaRef = ref({
      valid: true,
      errorMap: {}
    })

    // 验证所有表单的方法
    const validateAllForms = () => {
      // 检查是否有正在使用自定义渲染函数
      const isSingleItemWithoutTitle = props.list.length === 1 && !props.list[0].title
      const isUsingCustomRender = isSingleItemWithoutTitle && props.list[0].render

      // 如果使用自定义渲染函数，就不进行内部验证
      if (isUsingCustomRender) {
        // 直接返回验证通过
        return {
          valid: true,
          errorMap: {}
        }
      }

      // 检查是否有schema和数据
      if (!props.schema || !props.formData) {
        console.warn('缺少schema或formData，无法验证表单')
        return {
          valid: false,
          errorMap: {}
        }
      }

      // 验证各个表单部分
      const results = []
      try {
        Object.keys(props.schema.properties).forEach((key, index) => {
          const sectionSchema = props.schema.properties[key]
          const result = validateForm(sectionSchema, props.formData)
          sectionErrorSchemas.value[index] = result
          results.push(result)
        })
      } catch (err) {
        console.error('验证表单时出错:', err)
        return {
          valid: true, // 如果出错就假设验证通过，让外部控制验证
          errorMap: {}
        }
      }

      // 合并验证结果
      const mergedErrorMap = {}
      let isValid = true

      results.forEach((result) => {
        isValid = isValid && result.valid
        Object.assign(mergedErrorMap, result.errorMap)
      })

      const finalResult = {
        valid: isValid,
        errorMap: mergedErrorMap
      }

      // 触发验证事件
      emit('validate', finalResult)
      emit('update:errorSchema', finalResult)

      return finalResult
    }

    // 获取章节标题列表
    const navRef = computed(() => {
      return props.list.map((o) => o.title)
    })

    // 是否正在滚动
    let isScrolling = false

    // 滚动处理函数
    let scrollHandler = () => {}

    // 滚动定时器
    let scrollTimer = null

    // 定义导航项点击滚动函数
    const scrollTo = (index) => {
      console.log('点击导航项:', index)
      // 直接获取容器元素 - 使用document.querySelector更可靠
      const container = document.querySelector(`#${CONTAINER_ID}`)
      if (!container) {
        console.error('找不到容器:', CONTAINER_ID)
        return
      }

      // 获取内容项
      const items = container.querySelectorAll('.elevator-content-item')
      if (!items.length) {
        console.error('找不到内容项')
        return
      }

      // 确保索引有效
      if (index < 0 || index >= items.length) {
        console.error('索引超出范围:', index, items.length)
        return
      }

      // 获取目标元素的位置信息
      const targetItem = items[index]
      const offsetTop = targetItem.offsetTop

      // 添加20px偏移量以防止滚动过度
      // 如果出现标题被遮挡的问题，可以调整这个偏移量
      const scrollPosition = Math.max(0, offsetTop - 20)

      // 滚动到目标位置
      container.scrollTo({
        top: scrollPosition,
        behavior: 'smooth'
      })

      // 设置滚动状态
      isScrolling = true
      clearTimeout(scrollTimer)
      scrollTimer = setTimeout(() => {
        isScrolling = false
      }, 1000)

      // 更新导航激活状态
      currentNavId.value = index
    }

    // 初始化滚动功能
    const initScroll = () => {
      if (!formRef.value) return

      const container = document.querySelector(`#${CONTAINER_ID}`)
      if (!container) return

      // 定义滚动处理函数
      scrollHandler = () => {
        // 如果正在滚动，不处理
        if (isScrolling) return

        const items = container.querySelectorAll('.elevator-content-item')
        if (!items.length) return

        const scrollTop = container.scrollTop

        // 找到当前可见的章节
        for (let i = 0; i < items.length; i++) {
          const item = items[i]
          const offsetTop = item.offsetTop
          const itemHeight = item.clientHeight

          if (scrollTop <= offsetTop + itemHeight / 2) {
            currentNavId.value = i
            break
          }
        }
      }

      // 添加滚动监听
      container.addEventListener('scroll', scrollHandler)
    }

    // 组件挂载后初始化滚动
    onMounted(() => {
      nextTick(() => {
        initScroll()
      })
    })

    // 监听导航引用变化，重新初始化滚动
    watch(
      () => navRef.value,
      () => {
        nextTick(() => {
          initScroll()
        })
      }
    )

    // 组件卸载前移除滚动监听
    onBeforeUnmount(() => {
      const container = document.querySelector(`#${CONTAINER_ID}`)
      if (container) {
        container.removeEventListener('scroll', scrollHandler)
      }
    })

    // 处理保存按钮点击
    const handleSave = () => {
      // 验证所有表单
      const validateResult = validateAllForms()
      errorSchemaRef.value = validateResult
      console.log('errorSchemaRef.value 组件校验的:', errorSchemaRef.value)
      if (!validateResult.valid) {
        message.error(`当前表单存在 ${Object.keys(validateResult.errorMap).length} 处错误，请检查后再次尝试`)
        return
      } else {
        // 验证通过，触发保存事件
        emit('save')
      }
    }

    /** 右键确定/保存按钮 */
    const onSaveButtonContextmenu = (e: MouseEvent) => {
      useContextMenu(e, {
        list: [{ key: 'forceSave', title: '强制保存', handler: () => emit('save') }]
      })
    }

    // 使用固定的标识符进行全局状态同步
    const STORAGE_KEY = 'ELEVATOR_SCROLL_EXPANDED_STATE'

    // 控制插槽内容的展开/收起状态
    const getInitialExpandedState = () => {
      const storedValue = localStorage.getItem(STORAGE_KEY)
      if (storedValue !== null) {
        // localStorage 存储的是字符串，需要转换为布尔值
        return storedValue === 'true'
      }
      // 如果没有存储值，则使用默认值
      return props.defaultExpanded
    }
    const slotExpanded = ref(getInitialExpandedState())

    // 切换插槽内容的展开/收起状态
    const toggleSlot = () => {
      const newValue = !slotExpanded.value
      slotExpanded.value = newValue
      localStorage.setItem(STORAGE_KEY, String(newValue))
    }

    // 返回必要的属性和方法，不返回多余的内容
    return {
      // 模板渲染需要的属性
      currentNavId,
      formRef,
      navRef,

      // 组件内部使用的方法
      addFormRef,
      sectionFormRefs,
      sectionErrorSchemas,
      handleSave,

      // 暴露给外部的方法和属性
      scrollTo, // 滚动到指定章节的方法
      validateAllForms, // 验证所有表单的方法
      errorSchemaRef, // 错误状态引用

      // 右键的强制保存
      onSaveButtonContextmenu,

      // slots
      slots,

      // 插槽展开/收起控制
      slotExpanded,
      toggleSlot
    }
  },
  render() {
    // 将原来的内容包在activity-create-page容器中
    const elevatorContent = (
      // TODO 只有一个时,不展示顶部的折叠header,但是 hide-top-collapse 下面的类名不好选中 Collapse 可能存在嵌套
      <div class={['elevator-scroll', this.$props.list?.length === 1 && 'hide-top-collapse']}>
        {this.$props.title && <h2 class="elevator-title">{this.$props.title}</h2>}
        <div class="elevator-nav">
          {this.navRef.map((title, index) => (
            <div
              class={['elevator-nav-item', this.currentNavId === index && 'active']}
              onClick={() => {
                this.scrollTo(index)
                this.currentNavId = index
              }}
              key={index}
            >
              {title}
            </div>
          ))}
        </div>

        <div id={CONTAINER_ID} class="elevator-content-container" ref="formRef">
          {this.$props.list.map((item: ElevatorSectionItem, index) => {
            // 检查是否有提供对应的schema
            const hasSchema =
              this.$props.schema && this.$props.schema.properties && Object.keys(this.$props.schema.properties)[index]

            // 获取对应的schema
            const sectionSchema = hasSchema
              ? this.$props.schema.properties[Object.keys(this.$props.schema.properties)[index]]
              : null

            return (
              <div class="elevator-content-item" key={index}>
                <Collapse
                  // 只传入一个就没必要展示第一个章节的标题了
                  // title={this.$props.list?.length === 1 ? '' : item.title}
                  title={item.title}
                  visible={true}
                  // 类名改不得
                  class="jsf-collapse"
                  // 只传入一个就没必要点击收起了
                  clickToPutAway={this.$props.list?.length !== 1}
                >
                  <div class="elevator-content-body">
                    {/* 如果有schema和数据，使用内置SchemaForm组件 */}
                    {sectionSchema && this.$props.formData ? (
                      <SchemaForm
                        ref={(ref) => this.addFormRef(index, ref)}
                        schema={sectionSchema}
                        value={this.$props.formData}
                        errorSchema={this.sectionErrorSchemas[index] || this.errorSchemaRef}
                        onChange={(value) => {
                          // 通过事件通知父组件更新数据，而不是直接修改props
                          const updatedData = { ...this.$props.formData }
                          for (const key in value) {
                            updatedData[key] = value[key]
                          }
                          this.$emit('update:formData', updatedData)
                        }}
                      />
                    ) : (
                      // 如果没有schema和数据，使用自定义渲染函数
                      item.render &&
                      item.render({
                        errorSchema: this.errorSchemaRef,
                        className: 'create-policy-page__schema-form',
                        onChange: (value: any) => {
                          for (const key in value) {
                            this.$props.formData[key] = value[key]
                          }
                        }
                      })
                    )}
                  </div>
                </Collapse>
              </div>
            )
          })}
        </div>

        {this.$props.showFooter && (
          <div class="elevator-footer">
            {/* 在按钮左侧显示错误信息 */}
            <SchemaErrors errorSchema={this.errorSchemaRef} />
            {this.$slots.footer ? (
              this.$slots.footer()
            ) : (
              <div class="elevator-footer-buttons">
                <Button onClick={() => this.$emit('cancel')} class="cancel-btn">
                  取消
                </Button>
                <Button
                  type="primary"
                  onClick={this.handleSave}
                  loading={this.$props.loading}
                  // @ts-ignore
                  onContextmenu={this.onSaveButtonContextmenu}
                >
                  保存
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    )

    // 将电梯组件内容包裹在活动创建页面容器中
    return (
      <div class="activity-create-page elevator-page-sp">
        {/* 插槽内容与按钮组合，实现从按钮背后展开的效果 */}
        {process.env.NODE_ENV === 'development' ? (
          <div class="slot-container">
            {/* 圆形展开/收起按钮 */}
            <div class={['slot-toggle-button', this.slotExpanded ? 'expanded' : '']} onClick={this.toggleSlot}>
              <Icon name={this.slotExpanded ? 'arrow-up' : 'arrow-down'} />
            </div>

            {/* 插槽内容，带动画过渡效果 */}
            <Transition name="slot-clip">
              {this.slotExpanded && (
                <div class="elevator-text-ele" key="slot-content">
                  <div class="slot-content-inner">{this.$slots.default && this.$slots.default()}</div>
                  <JsonView data={this.$props.formData} defaultUnfold />
                </div>
              )}
            </Transition>
          </div>
        ) : (
          ''
        )}
        <div class="activity-create-content">
          {this.$props.loading ? (
            <div class="loading-content-fixed">
              <Spin></Spin>
              <strong style="margin: 12px 0 15% 0;">加载中，请稍候...</strong>
            </div>
          ) : (
            ''
          )}
          {elevatorContent}
        </div>
      </div>
    )
  }
})
