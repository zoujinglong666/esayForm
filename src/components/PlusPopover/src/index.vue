<template>
  <el-popover v-model:visible="subVisible" v-bind="$attrs">
    <slot></slot>
    <div v-if="hasShowBottomButton" style="padding-top: 12px">
      <el-button size="small" plain @click="handleCancelPopover">
        {{ cancelText || t('plus.popover.cancelText') }}
      </el-button>

      <el-button
        size="small"
        type="primary"
        :loading="confirmLoading"
        @click="handleConfirmPopover"
      >
        {{ confirmText || t('plus.popover.confirmText') }}
      </el-button>
    </div>

    <template #reference>
      <span>
        <slot name="reference"></slot>
      </span>
    </template>
  </el-popover>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import { ElPopover, ElButton } from 'element-plus'
import {useI18n} from '@/hooks/web/useI18n'
export interface PlusPopoverProps {
  hasShowBottomButton?: boolean
  confirmLoading?: boolean
  cancelText?: string
  confirmText?: string
}

defineOptions({
  name: 'PlusPopover'
})

const { t } = useI18n()
const props = defineProps({
  visible: Boolean,
  hasShowBottomButton: Boolean,
  confirmLoading: Boolean,
  cancelText: String,
  confirmText: String
})
const emit = defineEmits(['cancel', 'confirm'])

const subVisible = ref(false)

watch(
  () => props.visible,
  (val) => {
    subVisible.value = val
  },
  {
    immediate: true
  }
)

const handleCancelPopover = (): void => {
  subVisible.value = false
  emit('cancel')
}

const handleConfirmPopover = (): void => {
  subVisible.value = false
  emit('confirm')
}
</script>
