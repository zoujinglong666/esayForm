<script setup lang="ts">
import { useRuleFormItem } from '@/hooks/component/useFormItem.ts'

const props = defineProps({
  modelValue: {
    type: Date,
  },
})
const emits = defineEmits(['input'])
const emitData = ref('')
// Embedded in the form, just use the hook binding to perform form verification
const [state] = useRuleFormItem(props, 'modelValue', 'input', emitData)
function handleChange(val) {
  if (val === undefined || val === null)
    emits('input', '')

  emits('input', val)
}
</script>

<template>
  <el-date-picker
    v-bind="$attrs"
    v-model="state"
    :title="state"
    clearable
    editable
    type="datetime"
    @change="handleChange"
  />
</template>

<style scoped lang="scss">

</style>
