import { defineComponent } from 'vue'
import { VDialog, VCard, VCardTitle, VCardText, VCardActions, VDivider } from 'vuetify/components'

export default defineComponent({
  name: 'UiModal',
  props: {
    modelValue: { type: Boolean, required: true },
    title: { type: String, default: '' },
    width: { type: [Number, String], default: 480 },
    persistent: { type: Boolean, default: false },
    maxWidth: { type: [Number, String], default: undefined },
  },
  emits: ['update:modelValue', 'close'],
  setup(props, { slots, emit }) {
    const onUpdate = (val: boolean) => {
      emit('update:modelValue', val)
      if (!val) emit('close')
    }

    return () => (
      <VDialog modelValue={props.modelValue} onUpdate:modelValue={onUpdate} width={props.width} maxWidth={props.maxWidth} persistent={props.persistent}>
        <VCard>
          {props.title ? (
            <VCardTitle class="text-subtitle-1 font-semibold">{props.title}</VCardTitle>
          ) : null}
          {props.title ? <VDivider /> : null}
          <VCardText>
            {slots.default?.()}
          </VCardText>
          {slots.actions ? (
            <>
              <VDivider />
              <VCardActions>
                {slots.actions?.()}
              </VCardActions>
            </>
          ) : null}
        </VCard>
      </VDialog>
    )
  }
})
