<script lang="ts" setup>
import type { PropType } from 'vue'
import { computed } from 'vue'
import type { ButtonProps } from 'element-plus'
import type { ColEx } from '../types'
import { useFormContext } from '../hooks/useFormContext'
import { propTypes } from '@/utils/propTypes'

defineOptions({ name: 'BasicFormAction' })

const props = defineProps({
  showActionButtonGroup: propTypes.bool.def(true),
  showResetButton: propTypes.bool.def(true),
  showSubmitButton: propTypes.bool.def(true),
  showAdvancedButton: propTypes.bool.def(true),
  resetButtonOptions: {
    type: Object as PropType<ButtonProps>,
    default: () => ({}),
  },
  submitButtonOptions: {
    type: Object as PropType<ButtonProps>,
    default: () => ({}),
  },
  actionColOptions: {
    type: Object as PropType<Partial<ColEx>>,
    default: () => ({}),
  },
  actionSpan: propTypes.number.def(6),
  isAdvanced: propTypes.bool,
  hideAdvanceBtn: propTypes.bool,
})

const emit = defineEmits(['toggle-advanced'])

const { resetAction, submitAction } = useFormContext()

const actionColOpt = computed(() => {
  const { showAdvancedButton, actionSpan: span, actionColOptions } = props
  const actionSpan = 24 - span
  const advancedSpanObj = showAdvancedButton ? { span: actionSpan < 6 ? 24 : actionSpan } : {}
  const actionColOpt: Partial<ColEx> = {
    style: { textAlign: 'right' },
    span: showAdvancedButton ? 6 : 4,
    ...advancedSpanObj,
    ...actionColOptions,
  }
  return actionColOpt
})

const getResetBtnOptions = computed((): ButtonProps => {
  return Object.assign(
    {
      text: '重置',
    },
    props.resetButtonOptions,
  )
})

const getSubmitBtnOptions = computed((): ButtonProps => {
  return Object.assign(
    {
      text: '提交',
    },
    props.submitButtonOptions,
  )
})

function toggleAdvanced() {
  emit('toggle-advanced')
}
</script>

<template>
  <el-form-item label="">
    <el-col v-if="showActionButtonGroup" v-bind="actionColOpt" label="" :style="{ textAlign: actionColOpt.style.textAlign }" style="white-space: nowrap;">
      <slot name="resetBefore" />

      <el-button
        v-if="showResetButton"
        @click="resetAction"
      >
        {{ getResetBtnOptions.text }}
      </el-button>
      <slot name="submitBefore" />
      <el-button
        v-if="showSubmitButton"
        type="primary"
        @click="submitAction"
      >
        {{ getSubmitBtnOptions.text }}
      </el-button>

      <slot name="advanceBefore" />
      <el-button
        v-if="showAdvancedButton && !hideAdvanceBtn"
        @click="toggleAdvanced"
      >
        {{ isAdvanced ? 'component.form.putAway' : 'component.form.unfold' }}
        <BasicArrow class="ml-1" :expand="!isAdvanced" up />
      </el-button>
      <slot name="advanceAfter" />
    </el-col>
  </el-form-item>
</template>
