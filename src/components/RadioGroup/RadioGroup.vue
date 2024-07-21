<script setup lang="ts">
import { useRuleFormItem } from '@/hooks/component/useFormItem.ts'

const props = defineProps({
  modelValue: {
    type: [Number, String],
    default: null,
  },
  options: {
    type: Array,
    default: () => [],
  },
})
const emits = defineEmits(['input'])
const emitData = ref('')
// Embedded in the form, just use the hook binding to perform form verification
const [state] = useRuleFormItem(props, 'modelValue', 'input', emitData)
function handleChange(val: any) {
  if (val === undefined || val === null)
    emits('input', '')

  emits('input', val)
}
</script>

<template>
  <el-radio-group v-bind="$attrs" v-model="state" @change="handleChange">
    <el-radio v-for="item in props.options" :label="item.value">
      {{ item.label }}
    </el-radio>
  </el-radio-group>
</template>

<style scoped lang="scss">

</style>
