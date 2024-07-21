<script setup lang="ts">
import { computed, ref, useAttrs, useSlots, watch } from 'vue'
import { Close, FullScreen } from '@element-plus/icons-vue'
import FixedActionBar from '@/components/FixedActionBar/index.vue'

const props = withDefaults(defineProps<DataDialogPropsType>(), {
  title: '',
  isDraggable: false,
  modelValue: false,
  hiddenFullBtn: false,
  loading: false,
  confirmText: '确认',
  cancelText: '关闭',
  showFooter: true,
  showConfirmBtn: true,
  width: '50%',
})
const emits = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'confirm'): void
  (e: 'close'): void
  (e: 'open'): void
}>()
const attrs = useAttrs()
const slots = useSlots()
const isFullscreen = ref(false)
const isFullScreenBtn = computed(() => {
  if (props.hiddenFullBtn)
    return false
  if (attrs?.fullscreen)
    return false
  return true
})

interface DataDialogPropsType {
  title?: string
  isDraggable?: boolean
  modelValue?: boolean
  hiddenFullBtn?: boolean
  loading?: boolean
  confirmText?: string
  cancelText?: string
  showFooter?: boolean
  width?: string
  showConfirmBtn?: boolean
}

function handleFullscreen() {
  if (attrs?.fullscreen)
    return
  isFullscreen.value = !isFullscreen.value
}

watch(
  () => props.modelValue,
  (value, oldValue, onCleanup) => {
    if (value)
      emits('open')
  },
)
function handleClose() {
  if (Reflect.has(attrs, 'before-close') && typeof attrs['before-close'] === 'function')
    attrs['before-close']()

  setTimeout(() => {
    isFullscreen.value = false
  }, 0)
  emits('close')
  emits('update:modelValue', false)
}
function handleConfirm() {
  emits('confirm')
}
defineExpose({
  visible: props.modelValue,
})
</script>

<template>
  <div class="">
    <el-dialog
      v-bind="attrs"
      :width="props.width"
      :model-value="props.modelValue"
      :show-close="false"
      :fullscreen="attrs?.fullscreen ?? isFullscreen"
      :before-close="handleClose"
    >
      <template #header>
        <div>
          <span class="dialog-title">{{ props.title }}</span>
        </div>
        <div class="btns">
          <el-icon v-if="isFullScreenBtn" @click="handleFullscreen">
            <FullScreen />
          </el-icon>
          <el-icon @click="handleClose">
            <Close />
          </el-icon>
        </div>
      </template>
      <div v-loading="props.loading" class="dialog-content">
        <slot />
      </div>
      <template v-if="props.showFooter" #footer>
        <div v-if="!slots.footer" class="dialog-footer">
          <FixedActionBar v-if="isFullscreen">
            <el-button type="primary" @click="handleConfirm">
              {{ props.confirmText }}
            </el-button>
            <el-button @click="handleClose">
              {{ props.cancelText }}
            </el-button>
          </FixedActionBar>
          <div v-else>
            <el-button type="primary" @click="handleConfirm">
              {{ props.confirmText }}
            </el-button>
            <el-button @click="handleClose">
              {{ props.cancelText }}
            </el-button>
          </div>
        </div>
        <slot v-else name="footer" />
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
:deep(.el-dialog__header) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  margin: 0;
  border-bottom: 1px solid #eee;
}

:deep(.el-dialog__footer) {
  box-sizing: border-box;
}

.dialog-content {
  flex: 1;
  max-height: 75vh;
  overflow: scroll;
}

.dialog-title {
  font-size: 18px;
  line-height: 24px;
  color: #303133;
}

.btns {
  display: flex;
  align-items: center;

  i {
    margin-right: 8px;
    font-size: 16px;
    cursor: pointer;
  }

  i:last-child {
    margin-right: 0;
  }
}
</style>
